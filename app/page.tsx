// app/page.tsx
import { Suspense } from 'react';
import BuyersFilters from '../components/BuyersFilter';
import BuyersList from '../components/BuyersList';
import ExportButton from '../components/ExportButton';
import ImportButton from '../components/ImportButton';
import Pagination from '../components/Pagination';
import axios from 'axios';

interface SearchParams {
  page?: string;
  limit?: string;
  city?: string;
  propertyType?: string;
  status?: string;
  timeline?: string;
  search?: string;
}

interface Buyer {
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
}

interface BuyersResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
  data: Buyer[];
}

async function fetchBuyers(searchParams: SearchParams): Promise<BuyersResponse> {
  try {
    const params: Record<string, string> = {};

    if (searchParams.page) params.page = searchParams.page;
    if (searchParams.limit) params.limit = searchParams.limit;
    if (searchParams.city) params.city = searchParams.city;
    if (searchParams.propertyType) params.propertyType = searchParams.propertyType;
    if (searchParams.status) params.status = searchParams.status;
    if (searchParams.timeline) params.timeline = searchParams.timeline;
    if (searchParams.search) params.search = searchParams.search;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/buyer`;

    const response = await axios.get<BuyersResponse>(apiUrl, {
      params,
      headers: { 'Cache-Control': 'no-cache' },
      timeout: 20000,
    });

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch buyers: ${error.message}`);
    }
    throw new Error('Failed to fetch buyers');
  }
}

// Loading component for BuyersFilters
function BuyersFiltersLoading() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search input skeleton */}
          <div className="h-10 bg-gray-200 rounded-md"></div>
          {/* Filter dropdowns skeleton */}
          <div className="h-10 bg-gray-200 rounded-md"></div>
          <div className="h-10 bg-gray-200 rounded-md"></div>
          <div className="h-10 bg-gray-200 rounded-md"></div>
          <div className="h-10 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    </div>
  );
}

interface HomePageProps {
  searchParams: SearchParams;
}

export default async function Dashboard({ searchParams }: HomePageProps) {
  try {
    const buyersData = await fetchBuyers(await searchParams);

    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex justify-end items-center gap-4 mb-2">
          <ImportButton/>
          <ExportButton buyers={buyersData.data} />
        </div>

        <Suspense fallback={<BuyersFiltersLoading />}>
          <BuyersFilters 
            cities={['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai']}
            propertyTypes={['APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL']}
            statuses={['ACTIVE', 'INACTIVE', 'CONVERTED']}
            timelines={['IMMEDIATE', 'WITHIN_3_MONTHS', 'WITHIN_6_MONTHS']}
          />
        </Suspense>

        <BuyersList buyers={buyersData.data} />

        <Pagination
          currentPage={buyersData.page}
          totalPages={buyersData.pages}
          total={buyersData.total}
          limit={buyersData.limit}
        />
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Buyers Dashboard</h1>
            <p className="text-red-600">Failed to load buyers data.</p>
          </div>
          <ExportButton buyers={[]} />
        </div>

        <Suspense fallback={<BuyersFiltersLoading />}>
          <BuyersFilters 
            cities={['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai']}
            propertyTypes={['APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL']}
            statuses={['ACTIVE', 'INACTIVE', 'CONVERTED']}
            timelines={['IMMEDIATE', 'WITHIN_3_MONTHS', 'WITHIN_6_MONTHS']}
          />
        </Suspense>
        
        <div className="text-center py-8">
          <p className="text-gray-500">Unable to load buyer data. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }
}