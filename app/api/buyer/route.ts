import { NextRequest, NextResponse } from "next/server";
import {
  BHK,
  PrismaClient,
  PropertyType,
  Purpose,
  Source,
  Status,
  Timeline,
  User,
} from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const skip = (page - 1) * limit;

    const city = searchParams.get("city");
    const propertyType = searchParams.get("propertyType");
    const status = searchParams.get("status");
    const timeline = searchParams.get("timeline");

    const search = searchParams.get("search");

    const where: any = {};

    if (city) where.city = city;
    if (propertyType) where.propertyType = propertyType;
    if (status) where.status = status;
    if (timeline) where.timeline = timeline;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const total = await prisma.buyer.count({ where });

    const buyers = await prisma.buyer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        fullName: true,
        phone: true,
        city: true,
        propertyType: true,
        budgetMin: true,
        budgetMax: true,
        timeline: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      data: buyers,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

const createBuyerSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.email().optional(),
  phone: z.string().min(10).max(15),
  city: z.string(),
  propertyType: z.enum(PropertyType),
  bhk: z.enum(BHK).optional(),
  purpose: z.enum(Purpose),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  timeline: z.enum(Timeline),
  source: z.enum(Source),
  status: z.enum(Status).optional(),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  ownerEmail: z.email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createBuyerSchema.parse(body);

    const owner = await prisma.user.findUnique({
      where: {
        email: data.ownerEmail,
      },
    });

    if (!owner) {
      return NextResponse.json(
        {
          error: "Owner not found",
        },
        { status: 404 }
      );
    }

    if (data.budgetMin !== undefined && data.budgetMax !== undefined) {
      if (data.budgetMax < data.budgetMin) {
        return NextResponse.json(
          { error: "budgetMax must be greater than or equal to budgetMin" },
          { status: 400 }
        );
      }
    }

    if (
      (data.propertyType === PropertyType.Apartment ||
        data.propertyType === PropertyType.Villa) &&
      !data.bhk
    ) {
      return NextResponse.json(
        { error: "bhk is required for Apartment or Villa property types" },
        { status: 400 }
      );
    }

    const buyer = await prisma.buyer.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        propertyType: data.propertyType,
        bhk: data.bhk,
        purpose: data.purpose,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        timeline: data.timeline,
        source: data.source,
        status: data.status ?? Status.New,
        notes: data.notes,
        tags: data.tags || [],
        ownerId: owner?.id,
      },
    });

    await prisma.buyerHistory.create({
      data: {
        buyerId: buyer.id,
        changedBy: owner.id,
        diff: { action: "Created buyer record" },
      },
    });

    return NextResponse.json(buyer, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Error creating buyer:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
