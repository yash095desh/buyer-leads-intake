// app/buyers/[id]/page.tsx
import { notFound } from 'next/navigation';
import axios from 'axios';
import BuyerProfileClient from '../../../components/BuyerProfileClient';

interface BuyerWithDetails {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  city: string;
  propertyType: string;
  bhk?: string;
  purpose: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline: string;
  source: string;
  status: string;
  notes?: string;
  tags: string[];
  updatedAt: string;
  ownerId: string;
  histories: Array<{
    id: string;
    changedAt: string;
    diff: any;
  }>;
}

async function getBuyerProfile(id: string): Promise<BuyerWithDetails | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await axios.get(`${baseUrl}/api/buyer/${id}`);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

interface PageProps {
  params: { id: string };
}

export default async function BuyerProfilePage({ params }: PageProps) {
  const buyer = await getBuyerProfile(await params.id);

  if (!buyer) {
    notFound();
  }

  return <BuyerProfileClient buyer={buyer} />;
}