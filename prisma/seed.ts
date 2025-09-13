import { PrismaClient, PropertyType, BHK, Purpose, Timeline, Source, Status } from '@prisma/client'

const prisma = new PrismaClient()

const buyersData = [
    {
      fullName: "Aman Sharma",
      email: "aman.sharma@example.com",
      phone: "9876543210",
      city: "Chandigarh",
      propertyType: PropertyType.Apartment,
      bhk: BHK.TWO,
      purpose: Purpose.Buy,
      budgetMin: 3000000,
      budgetMax: 5000000,
      timeline: Timeline.THREE_TO_SIX_M,
      source: Source.Website,
      status: Status.New,
      notes: "Looking for a ready-to-move-in property",
      tags: ["premium", "urgent"],
      ownerId: "owner-123"
    },
    {
      fullName: "Neha Verma",
      email: "neha.verma@example.com",
      phone: "9123456780",
      city: "Mohali",
      propertyType: PropertyType.Villa,
      bhk: BHK.FOUR,
      purpose: Purpose.Rent,
      budgetMin: 50000,
      budgetMax: 80000,
      timeline: Timeline.ZERO_TO_THREE_M,
      source: Source.Referral,
      status: Status.Contacted,
      notes: "Interested in pet-friendly villas",
      tags: ["high-priority"],
      ownerId: "owner-456"
    },
    {
      fullName: "Rohit Mehta",
      email: "rohit.mehta@example.com",
      phone: "9012345678",
      city: "Zirakpur",
      propertyType: PropertyType.Plot,
      bhk: null,
      purpose: Purpose.Buy,
      budgetMin: 1500000,
      budgetMax: 2500000,
      timeline: Timeline.GREATER_THAN_SIX_M,
      source: Source.Walk_in,
      status: Status.Visited,
      notes: "Wants land for personal use",
      tags: ["land"],
      ownerId: "owner-789"
    },
    {
      fullName: "Priya Kapoor",
      email: "priya.kapoor@example.com",
      phone: "9988776655",
      city: "Panchkula",
      propertyType: PropertyType.Office,
      bhk: null,
      purpose: Purpose.Rent,
      budgetMin: 70000,
      budgetMax: 100000,
      timeline: Timeline.ZERO_TO_THREE_M,
      source: Source.Call,
      status: Status.Negotiation,
      notes: "Needs furnished office space",
      tags: ["corporate"],
      ownerId: "owner-321"
    },
    {
      fullName: "Vivek Jain",
      email: "vivek.jain@example.com",
      phone: "9123456701",
      city: "Other",
      propertyType: PropertyType.Retail,
      bhk: null,
      purpose: Purpose.Buy,
      budgetMin: 5000000,
      budgetMax: 10000000,
      timeline: Timeline.THREE_TO_SIX_M,
      source: Source.Website,
      status: Status.Qualified,
      notes: "Interested in a shopping complex",
      tags: ["investment"],
      ownerId: "owner-654"
    },
    {
      fullName: "Kavita Nair",
      email: "kavita.nair@example.com",
      phone: "9876501234",
      city: "Chandigarh",
      propertyType: PropertyType.Apartment,
      bhk: BHK.ONE,
      purpose: Purpose.Rent,
      budgetMin: 15000,
      budgetMax: 30000,
      timeline: Timeline.Exploring,
      source: Source.Other,
      status: Status.New,
      notes: "First-time renter, unsure of location",
      tags: ["starter"],
      ownerId: "owner-987"
    },
    {
      fullName: "Saurabh Gupta",
      email: "saurabh.gupta@example.com",
      phone: "9023456781",
      city: "Mohali",
      propertyType: PropertyType.Villa,
      bhk: BHK.THREE,
      purpose: Purpose.Buy,
      budgetMin: 4000000,
      budgetMax: 7000000,
      timeline: Timeline.ZERO_TO_THREE_M,
      source: Source.Walk_in,
      status: Status.Converted,
      notes: "Ready to close deal",
      tags: ["vip"],
      ownerId: "owner-852"
    },
    {
      fullName: "Deepika Singh",
      email: "deepika.singh@example.com",
      phone: "9011223344",
      city: "Zirakpur",
      propertyType: PropertyType.Office,
      bhk: null,
      purpose: Purpose.Buy,
      budgetMin: 3000000,
      budgetMax: 6000000,
      timeline: Timeline.THREE_TO_SIX_M,
      source: Source.Referral,
      status: Status.Contacted,
      notes: "Looking for co-working space",
      tags: ["shared-space"],
      ownerId: "owner-963"
    },
    {
      fullName: "Harpreet Kaur",
      email: "harpreet.kaur@example.com",
      phone: "9988223344",
      city: "Panchkula",
      propertyType: PropertyType.Retail,
      bhk: null,
      purpose: Purpose.Rent,
      budgetMin: 25000,
      budgetMax: 50000,
      timeline: Timeline.GREATER_THAN_SIX_M,
      source: Source.Website,
      status: Status.Dropped,
      notes: "Changed priorities",
      tags: ["inactive"],
      ownerId: "owner-741"
    },
    {
      fullName: "Manoj Patel",
      email: "manoj.patel@example.com",
      phone: "9012334455",
      city: "Other",
      propertyType: PropertyType.Plot,
      bhk: null,
      purpose: Purpose.Buy,
      budgetMin: 1000000,
      budgetMax: 3000000,
      timeline: Timeline.THREE_TO_SIX_M,
      source: Source.Call,
      status: Status.Negotiation,
      notes: "Needs legal documentation",
      tags: ["legal"],
      ownerId: "owner-258"
    }
  ]

async function main() {
  console.log("Start seeding...")

  for (const buyerData of buyersData) {
    const buyer = await prisma.buyer.create({
      data: {
        ...buyerData,
        histories: {
          create: [
            {
              changedBy: "admin",
              diff: {
                fieldChanged: "status",
                oldValue: "New",
                newValue: buyerData.status
              }
            },
            {
              changedBy: "supervisor",
              diff: {
                fieldChanged: "budgetMax",
                oldValue: buyerData.budgetMax ? buyerData.budgetMax - 500000 : null,
                newValue: buyerData.budgetMax
              }
            }
          ]
        }
      }
    })
    console.log(`Created buyer: ${buyer.fullName}`)
  }

  console.log("Seeding completed.")
}

main()
  .catch(e => {
    console.error("Error seeding data:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })