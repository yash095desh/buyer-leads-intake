// components/BuyerProfileClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Home, 
  Calendar, 
  DollarSign, 
  User,
  Clock,
  Target,
  MessageSquare,
  Tag,
  History,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import { useSaveUser } from '@/hooks/useSaveUser';

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

interface BuyerProfileClientProps {
  buyer: BuyerWithDetails;
}

export default function BuyerProfileClient({ buyer }: BuyerProfileClientProps) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useSaveUser();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP p');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'New': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      'Qualified': 'bg-purple-100 text-purple-800 hover:bg-purple-100',
      'Contacted': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      'Visited': 'bg-orange-100 text-orange-800 hover:bg-orange-100',
      'Negotiation': 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100',
      'Converted': 'bg-green-100 text-green-800 hover:bg-green-100',
      'Dropped': 'bg-red-100 text-red-800 hover:bg-red-100',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  };

  const formatEnumValue = (value: string) => {
    return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getBHKLabel = (bhk?: string) => {
    if (!bhk) return 'Not specified';
    const labels = {
      'ONE': '1 BHK',
      'TWO': '2 BHK', 
      'THREE': '3 BHK',
      'FOUR': '4 BHK',
      'Studio': 'Studio'
    };
    return labels[bhk as keyof typeof labels] || bhk;
  };

  const handleEdit = () => {
    router.push(`/buyers/${buyer.id}/edit`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/buyers/${buyer.id}`);
      
      toast.success('Buyer profile deleted successfully.');
      
      router.push('/buyers');
    } catch (error) {
      console.error('Error deleting buyer:', error);
      toast.error('Failed to delete buyer profile. Please try again.');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  useEffect(()=>{
    console.log("User data:",user)
  },[user])

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{buyer.fullName}</h1>
            <p className="text-gray-600">Buyer Profile Details</p>
          </div>
        </div>

        {/* Action Buttons */}
        {user && (user?.id === buyer.ownerId || user.role === "admin") && (
          <div className="flex items-center gap-2">
            
              <Button onClick={handleEdit} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            
            
              <Button 
                variant="destructive" 
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{buyer.phone}</p>
                  </div>
                </div>

                {buyer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{buyer.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">City</p>
                    <p className="font-medium">{buyer.city}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">{formatDate(buyer.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Property Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Property Type</p>
                  <p className="font-medium">{buyer.propertyType}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">BHK Configuration</p>
                  <p className="font-medium">{getBHKLabel(buyer.bhk)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Purpose</p>
                  <p className="font-medium">{buyer.purpose}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Timeline</p>
                  <p className="font-medium">{formatEnumValue(buyer.timeline)}</p>
                </div>

                {(buyer.budgetMin || buyer.budgetMax) && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Budget Range</p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <p className="font-medium text-green-600">
                        {buyer.budgetMin ? formatCurrency(buyer.budgetMin) : 'Not specified'} - {buyer.budgetMax ? formatCurrency(buyer.budgetMax) : 'Not specified'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {buyer.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{buyer.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Change History
              </CardTitle>
              <CardDescription>
                Track of all changes made to this buyer profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              {buyer.histories.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No changes recorded yet</p>
              ) : (
                <div className="space-y-4">
                  {buyer.histories.map((history) => (
                    <div key={history.id} className="border-l-2 border-gray-200 pl-4 pb-4">
                      <div className="space-y-1">
                            <span className="text-green-600 ml-2">
                              {history?.diff?.action}
                            </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Status & Meta */}
        <div className="space-y-6">
          {/* Status & Source */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Status & Source
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Current Status</p>
                <Badge className={getStatusColor(buyer.status)}>
                  {buyer.status}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-gray-500">Source</p>
                <p className="font-medium">{formatEnumValue(buyer.source)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {buyer.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {buyer.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Owner Information */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Owner Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Owned by</p>
                <p className="font-medium">{buyer.owner.name || buyer.owner.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <Badge variant="outline">
                  {buyer.owner.role}
                </Badge>
              </div>
              {buyer.permissions.isOwner && (
                <Badge variant="secondary" className="w-fit">
                  You own this profile
                </Badge>
              )}
              {buyer.permissions.isAdmin && (
                <Badge variant="secondary" className="w-fit">
                  Admin access
                </Badge>
              )}
            </CardContent>
          </Card> */}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Buyer Profile
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{buyer.fullName}</strong>'s profile? 
              This action cannot be undone and will also delete all associated history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Profile'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}