import { NextRequest, NextResponse } from "next/server";
import { BHK, PrismaClient, PropertyType, Purpose, Source, Status, Timeline } from "@prisma/client";
import { z } from "zod";

import { RateLimiterMemory } from "rate-limiter-flexible";

const prisma = new PrismaClient();

const updateRateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
});

// GET handler — fetch buyer by id
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Buyer ID is required" },
        { status: 400 }
      );
    }

    const buyer = await prisma.buyer.findUnique({
      where: { id },
      include: {
        histories: {
          orderBy: { changedAt: "desc" },
          take: 5,
        },
      },
    });

    if (!buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    return NextResponse.json(buyer, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

const buyerSchema = z.object({
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

// PUT handler — update buyer
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const data = buyerSchema.parse(body);

    const owner = await prisma.user.findUnique({
      where: {
        email: data.ownerEmail,
      },
    });

    if (!owner) {
      return NextResponse.json(
        { error: "Owner not found" },
        { status: 401 }
      );
    }

    try {
      await updateRateLimiter.consume(owner.id);
    } catch {
      return NextResponse.json(
        { error: "Rate limit exceeded for update" },
        { status: 429 }
      );
    }

    const existingBuyer = await prisma.buyer.findUnique({
      where: { id },
    });

    if (!existingBuyer) {
      return NextResponse.json(
        { error: "Buyer not found" },
        { status: 404 }
      );
    }

    if (owner.role !== "admin" && existingBuyer.ownerId !== owner.id) {
      return NextResponse.json(
        { error: "Unauthorized to update this buyer info" },
        { status: 403 }
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

    const updatedBuyer = await prisma.buyer.update({
      where: { id },
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        propertyType: data.propertyType,
        bhk: data.bhk || null,
        purpose: data.purpose,
        budgetMin: data.budgetMin || null,
        budgetMax: data.budgetMax || null,
        timeline: data.timeline,
        source: data.source,
        status: data.status || existingBuyer.status,
        notes: data.notes || null,
        tags: data.tags || [],
      },
    });

    await prisma.buyerHistory.create({
      data: {
        buyerId: id,
        changedBy: owner.id,
        diff: {
          action: "Updated buyer",
        },
      },
    });

    return NextResponse.json(updatedBuyer, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Error updating buyer:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE handler — delete buyer
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { ownerEmail } = await req.json();

    const owner = await prisma.user.findUnique({
      where: { email: ownerEmail },
    });

    if (!owner) {
      return NextResponse.json(
        { error: "Owner not found" },
        { status: 401 }
      );
    }

    const existingBuyer = await prisma.buyer.findUnique({
      where: { id },
    });

    if (!existingBuyer) {
      return NextResponse.json(
        { error: "Buyer not found" },
        { status: 404 }
      );
    }

    if (owner.role !== "admin" && existingBuyer.ownerId !== owner.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this buyer" },
        { status: 403 }
      );
    }

    await prisma.buyerHistory.create({
      data: {
        buyerId: id,
        changedBy: owner.id,
        diff: {
          action: "Deleted buyer",
          previousData: existingBuyer,
        },
      },
    });

    await prisma.buyer.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Buyer deleted successfully" }, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Error deleting buyer:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
