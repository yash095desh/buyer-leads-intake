import { NextRequest, NextResponse } from "next/server";
import { BHK, PrismaClient, PropertyType, Purpose, Source, Status, Timeline } from "@prisma/client";
import { parse } from "csv-parse/sync";
import { z } from "zod";

const prisma = new PrismaClient();

interface CSVRow {
  fullName: string;
  email?: string;
  phone: string;
  city: string;
  propertyType: string;
  bhk?: string;
  purpose: string;
  budgetMin?: string;
  budgetMax?: string;
  timeline: string;
  source: string;
  status?: string;
  notes?: string;
  tags?: string;
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
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const ownerEmail = formData.get("ownerEmail");

    if (!ownerEmail || typeof ownerEmail !== "string") {
      return NextResponse.json({ error: `ownerEmail not provided` }, { status: 400 });
    }

    const owner = await prisma.user.findUnique({
      where: { email: ownerEmail },
    });

    if (!owner) {
      return NextResponse.json({ error: `Owner with email ${ownerEmail} not found` }, { status: 400 });
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
    }

    const content = await file.text();

    const records: CSVRow[] = parse(content, {
      columns: true,
      skip_empty_lines: true,
    });

    const results = {
      success: [] as { row: number; message: string }[],
      errors: [] as { row: number; message: string }[],
    };

    const transactionOperations = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNumber = i + 2; // Header is at row 1

      try {
        // Preprocessing with type safety
        const processedRow: Omit<CSVRow, 'budgetMin' | 'budgetMax' | 'tags'> & {
          budgetMin?: number;
          budgetMax?: number;
          tags?: string[];
        } = {
          fullName: row.fullName.trim(),
          email: row.email?.trim(),
          phone: row.phone.trim(),
          city: row.city.trim(),
          propertyType: row.propertyType.trim(),
          bhk: row.bhk?.trim(),
          purpose: row.purpose.trim(),
          budgetMin: row.budgetMin ? parseInt(row.budgetMin, 10) : undefined,
          budgetMax: row.budgetMax ? parseInt(row.budgetMax, 10) : undefined,
          timeline: row.timeline.trim(),
          source: row.source.trim(),
          status: row.status?.trim(),
          notes: row.notes?.trim(),
          tags: row.tags ? (() => {
            try {
              const parsed = JSON.parse(row.tags);
              return Array.isArray(parsed) ? parsed.map(String) : [];
            } catch {
              return [];
            }
          })() : []
        };

        const data = buyerSchema.parse(processedRow);

        if (
          data.budgetMin !== undefined &&
          data.budgetMax !== undefined &&
          data.budgetMax < data.budgetMin
        ) {
          throw new Error("budgetMax must be greater than or equal to budgetMin");
        }

        if (
          (data.propertyType === PropertyType.Apartment || data.propertyType === PropertyType.Villa) &&
          !data.bhk
        ) {
          throw new Error("bhk is required for Apartment or Villa property types");
        }

        transactionOperations.push(
          prisma.buyer.create({
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
              status: data.status || Status.New,
              notes: data.notes || null,
              tags: data.tags || [],
              ownerId: owner.id,
              histories: {
                create: {
                  changedBy: owner.id,
                  diff: { action: "Created via import" },
                },
              },
            },
          })
        );

        results.success.push({ row: rowNumber, message: "Valid row queued for import" });
      } catch (error) {
        results.errors.push({
          row: rowNumber,
          message: error instanceof Error ? error.message : "Invalid data",
        });
      }
    }

    if (transactionOperations.length === 0) {
      return NextResponse.json(
        { error: "No valid rows to import", errors: results.errors },
        { status: 400 }
      );
    }

    await prisma.$transaction(transactionOperations);

    return NextResponse.json({
      message: `Successfully imported ${transactionOperations.length} buyers`,
      errors: results.errors,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
