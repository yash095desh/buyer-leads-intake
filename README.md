# Buyer Leads App

A simple **Buyer Lead Intake** application built with **Next.js**, **TypeScript**, **Prisma ORM**, and **Neon PostgreSQL**. It allows users to capture, list, and manage buyer leads with validation, filtering, search, and CSV import/export functionality.

This project was built as an assignment and demonstrates best practices in validation, server-side rendering, transactional data handling, and ownership enforcement.

---

##  Deployed URL

You can access the live version of the app here:

[https://buyer-leads-intake.vercel.app](https://buyer-leads-intake.vercel.app)

---

##  Tech Stack

- **Frontend**: Next.js (App Router) + TypeScript
- **Database**: PostgreSQL (via [Neon](https://neon.tech)) + Prisma ORM with migrations
- **Validation**: Zod (client and server)
- **Authentication**: Basic authentication setup using clerk.js

---

## Features Implemented

✔ Create, edit, and delete buyer leads  
✔ Real pagination and server-rendered search/filter  
✔ URL-synced filters with sorting and debouncing   
✔ CSV import with row validation and error display  
✔ CSV export respecting current filters and sorting  
✔ Buyer history tracking on edits  
✔ Ownership enforced at server layer  
✔ Simple rate limiting for create/update actions  
✔ Accessibility improvements with form labels and error handling  

---

## Setup Instructions

### Prerequisites
- Node.js v18+ installed
- PostgreSQL via [Neon](https://neon.tech) account set up

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yash095desh/buyer-leads-intake.git
   cd buyer-leads-intake
   ```
2. Install dependencies:
  ```bash
  npm install
  ```

3. Configure environment variables:
  Create a .env file with the following:

  ```bash
  DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database>"
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
  CLERK_SECRET_KEY=your_clerk_secret_key
  
  NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
  NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
  
  NEXT_PUBLIC_BASE_URL=http://localhost:3000
  ```


4. Run Prisma migrations:

  ```bash
  npx prisma migrate deploy
  ```

5. Seed the database with sample data:

  ```bash
  npx prisma db seed
  ```

6. Run the development server:

  ```bash
  npm run dev
  ```

Access the app at http://localhost:3000

##  Design Notes

###  Validation

- Validation is handled by Zod both on the client and the server.
- All required and conditional fields (e.g., bhk required for certain property types) are validated consistently.
- Budget fields are cross-validated to ensure budgetMax ≥ budgetMin.

###  SSR vs Client

- Listing pages are server-rendered (SSR) with real pagination and filters synced via URL.
- Debounced search is performed with client-side handling but updates SSR parameters.

###  Ownership Enforcement

- All editing/deleting operations are validated at the server layer.
- Users can only modify records where ownerId matches their session.
- An optional admin role can be added to override this (not implemented in this version).

###  CSV Import/Export

- Errors are displayed per row with actionable messages.
- Unknown enums or invalid data cause row-specific errors without affecting other rows.
- Export respects applied filters and sorting.


