import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Home, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';

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

interface BuyersListProps {
  buyers: Buyer[];
}

export default function BuyersList({ buyers }: BuyersListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      case 'converted':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const formatTimeline = (timeline: string) => {
    return timeline.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (buyers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Home className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No buyers found</h3>
          <p className="text-gray-500 text-center">
            Try adjusting your search criteria or filters to find buyers.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="grid grid-cols-12 gap-4 bg-gray-100 p-4 rounded-md text-sm font-semibold text-gray-600">
        <div className="col-span-4">Buyer Details</div>
        <div className="col-span-3">Budget & Timeline</div>
        <div className="col-span-3">Location</div>
        <div className="col-span-2 text-right">Last Updated</div>
      </div>

      {/* Buyers List */}
      {buyers.map((buyer) => (
        <Card key={buyer.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <Link href={`/buyers/${buyer?.id}`}>
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Buyer Details */}
              <div className="col-span-4 space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-md font-medium text-gray-900">
                    {buyer.fullName}
                  </h3>
                  <Badge className={getStatusColor(buyer.status)}>
                    {buyer.status.charAt(0).toUpperCase() + buyer.status.slice(1).toLowerCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{buyer.phone}</span>
                </div>
              </div>

              {/* Budget & Timeline */}
              <div className="col-span-3 space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span>
                    {formatCurrency(buyer.budgetMin)} - {formatCurrency(buyer.budgetMax)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatTimeline(buyer.timeline)}</span>
                </div>
              </div>

              {/* Location */}
              <div className="col-span-3 space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{buyer.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-gray-500" />
                  <span>{buyer.propertyType.charAt(0).toUpperCase() + buyer.propertyType.slice(1).toLowerCase()}</span>
                </div>
              </div>

              {/* Last Updated */}
              <div className="col-span-2 text-right text-sm text-gray-500">
                Updated: {formatDate(buyer.updatedAt)}
              </div>
            </div>
        </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
