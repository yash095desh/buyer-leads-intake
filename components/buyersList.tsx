// app/page.tsx (or wherever your homepage is)
interface SearchParams {
  page?: string;
  limit?: string;
  city?: string;
  propertyType?: string;
  status?: string;
  timeline?: string;
  search?: string;
}

interface BuyersResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
  data: Array<{
    id: string;
    fullName: string;
    phone: string;
    city: string;
    propertyType: string;
    budgetMin: number;
    budgetMax: number;
    timeline: string;
    status: string;
    updatedAt: string;
  }>;
}

import axios from 'axios';

async function fetchBuyers(searchParams: SearchParams): Promise<BuyersResponse> {
  const params: Record<string, string> = {};
  
  // Add parameters if they exist
  if (searchParams.page) params.page = searchParams.page;
  if (searchParams.limit) params.limit = searchParams.limit;
  if (searchParams.city) params.city = searchParams.city;
  if (searchParams.propertyType) params.propertyType = searchParams.propertyType;
  if (searchParams.status) params.status = searchParams.status;
  if (searchParams.timeline) params.timeline = searchParams.timeline;
  if (searchParams.search) params.search = searchParams.search;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  try {
    const response = await axios.get<BuyersResponse>(`${baseUrl}/api/buyers`, {
      params,
      headers: {
        'Cache-Control': 'no-cache', 
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch buyers: ${error.message}`);
    }
    throw new Error('Failed to fetch buyers');
  }
}

interface HomePageProps {
  searchParams: SearchParams;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  try {
    const buyersData = await fetchBuyers(searchParams);

    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Buyers</h1>
        
        <div className="grid gap-4">
          {buyersData.data.map((buyer) => (
            <div key={buyer.id} className="border p-4 rounded-lg">
              <h3 className="font-semibold">{buyer.fullName}</h3>
              <p>Phone: {buyer.phone}</p>
              <p>City: {buyer.city}</p>
              <p>Property Type: {buyer.propertyType}</p>
              <p>Budget: ${buyer.budgetMin} - ${buyer.budgetMax}</p>
              <p>Status: {buyer.status}</p>
            </div>
          ))}
        </div>

        {/* Pagination info */}
        <div className="mt-4 text-center">
          Page {buyersData.page} of {buyersData.pages} 
          (Total: {buyersData.total} buyers)
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>Failed to load buyers data.</p>
      </div>
    );
  }
}