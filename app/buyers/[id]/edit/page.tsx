"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, X, Plus, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

// Zod schema for editing buyer
const editBuyerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name must be less than 80 characters"),
  email: z.email("Invalid email address").optional().or(z.literal("")),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits"),
  city: z.string().min(2, "City is required"),
  propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
  bhk: z.enum(["ONE", "TWO", "THREE", "FOUR", "Studio"]).optional(),
  purpose: z.enum(["Buy", "Rent"]),
  budgetMin: z.string().optional(),
  budgetMax: z.string().optional(),
  timeline: z.enum([
    "ZERO_TO_THREE_M",
    "THREE_TO_SIX_M",
    "GREATER_THAN_SIX_M",
    "Exploring",
  ]),
  source: z.enum(["Website", "Referral", "Walk_in", "Call", "Other"]),
  status: z.enum([
    "New",
    "Qualified",
    "Contacted",
    "Visited",
    "Negotiation",
    "Converted",
    "Dropped",
  ]),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type EditBuyerFormValues = z.infer<typeof editBuyerSchema>;

interface BuyerData {
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
}

export default function EditBuyerClient() {
  const router = useRouter();
  const params = useParams();
  const buyerId = params.id as string;
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [currentTag, setCurrentTag] = useState("");
  const [buyer, setBuyer] = useState<BuyerData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<EditBuyerFormValues>({
    resolver: zodResolver(editBuyerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      city: "",
      budgetMin: "",
      budgetMax: "",
      notes: "",
      tags: [],
    },
  });

  useEffect(() => {
    const fetchBuyerData = async () => {
      try {
        setIsLoadingData(true);
        const response = await axios.get(`/api/buyer/${buyerId}`);
        const buyerData = response.data;

        setBuyer(buyerData);

        form.reset({
          fullName: buyerData.fullName,
          email: buyerData.email || "",
          phone: buyerData.phone,
          city: buyerData.city,
          propertyType: buyerData.propertyType as any,
          bhk: buyerData.bhk as any,
          purpose: buyerData.purpose as any,
          budgetMin: buyerData.budgetMin?.toString() || "",
          budgetMax: buyerData.budgetMax?.toString() || "",
          timeline: buyerData.timeline as any,
          source: buyerData.source as any,
          status: buyerData.status as any,
          notes: buyerData.notes || "",
          tags: buyerData.tags || [],
        });
      } catch (error) {
        console.error("Error fetching buyer:", error);
        setError("Failed to load buyer data");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (buyerId) {
      fetchBuyerData();
    }
  }, [buyerId, form, router]);

  const watchedTags = form.watch("tags") || [];

  const addTag = () => {
    if (currentTag.trim() && !watchedTags.includes(currentTag.trim())) {
      const updatedTags = [...watchedTags, currentTag.trim()];
      form.setValue("tags", updatedTags);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = watchedTags.filter((tag) => tag !== tagToRemove);
    form.setValue("tags", updatedTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  async function onSubmit(data: EditBuyerFormValues) {
    if (!buyer) return;

    setIsLoading(true);
    try {
      let ownerEmail = user?.emailAddresses[0]?.emailAddress || null;
      if (!ownerEmail) {
        toast.error("Something went wrong Please login again!");
      }
      const payload = {
        ...data,
        email: data.email || undefined,
        ownerEmail,
        budgetMin: data.budgetMin ? parseInt(data.budgetMin) : undefined,
        budgetMax: data.budgetMax ? parseInt(data.budgetMax) : undefined,
        tags: data.tags || [],
      };

      const response = await axios.put(`/api/buyer/${buyer.id}`, payload);

      toast.success("Buyer profile updated successfully.");

      router.push(`/buyers/${buyer.id}`);
    } catch (error) {
      console.error("Error updating buyer:", error);
      toast.error("Failed to update buyer profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const getBHKLabel = (value: string) => {
    const labels = {
      ONE: "1 BHK",
      TWO: "2 BHK",
      THREE: "3 BHK",
      FOUR: "4 BHK",
      Studio: "Studio",
    };
    return labels[value as keyof typeof labels] || value;
  };

  const getTimelineLabel = (value: string) => {
    const labels = {
      ZERO_TO_THREE_M: "0-3 months",
      THREE_TO_SIX_M: "3-6 months",
      GREATER_THAN_SIX_M: "More than 6 months",
      Exploring: "Just exploring",
    };
    return labels[value as keyof typeof labels] || value;
  };

  // Loading state
  if (isLoadingData) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
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
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}. Please try again or go back to the buyers list.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!buyer) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
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
          <h1 className="text-3xl font-bold text-gray-900">
            Edit {buyer.fullName}
          </h1>
          <p className="text-gray-600">Update buyer profile information</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Basic contact details and personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Optional email address</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Property Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Property Requirements</CardTitle>
              <CardDescription>
                What type of property is the buyer looking for?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Apartment">Apartment</SelectItem>
                          <SelectItem value="Villa">Villa</SelectItem>
                          <SelectItem value="Plot">Plot</SelectItem>
                          <SelectItem value="Office">Office</SelectItem>
                          <SelectItem value="Retail">Retail</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bhk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BHK Configuration</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select BHK" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Not Applicable</SelectItem>
                          <SelectItem value="ONE">
                            {getBHKLabel("ONE")}
                          </SelectItem>
                          <SelectItem value="TWO">
                            {getBHKLabel("TWO")}
                          </SelectItem>
                          <SelectItem value="THREE">
                            {getBHKLabel("THREE")}
                          </SelectItem>
                          <SelectItem value="FOUR">
                            {getBHKLabel("FOUR")}
                          </SelectItem>
                          <SelectItem value="Studio">
                            {getBHKLabel("Studio")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Optional - only for apartments/villas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Buy or Rent" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Buy">Buy</SelectItem>
                          <SelectItem value="Rent">Rent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeline *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeline" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ZERO_TO_THREE_M">
                            {getTimelineLabel("ZERO_TO_THREE_M")}
                          </SelectItem>
                          <SelectItem value="THREE_TO_SIX_M">
                            {getTimelineLabel("THREE_TO_SIX_M")}
                          </SelectItem>
                          <SelectItem value="GREATER_THAN_SIX_M">
                            {getTimelineLabel("GREATER_THAN_SIX_M")}
                          </SelectItem>
                          <SelectItem value="Exploring">
                            {getTimelineLabel("Exploring")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Budget */}
              <div>
                <h3 className="text-lg font-medium mb-4">Budget Range</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="budgetMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Budget</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter minimum budget"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter amount in rupees
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budgetMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Budget</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter maximum budget"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter amount in rupees
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lead Information */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Information</CardTitle>
              <CardDescription>
                Source and additional details about this lead
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="How did they find you?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Website">Website</SelectItem>
                          <SelectItem value="Referral">Referral</SelectItem>
                          <SelectItem value="Walk_in">Walk-in</SelectItem>
                          <SelectItem value="Call">Phone Call</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Qualified">Qualified</SelectItem>
                          <SelectItem value="Contacted">Contacted</SelectItem>
                          <SelectItem value="Visited">Visited</SelectItem>
                          <SelectItem value="Negotiation">
                            Negotiation
                          </SelectItem>
                          <SelectItem value="Converted">Converted</SelectItem>
                          <SelectItem value="Dropped">Dropped</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tags */}
              <div>
                <FormLabel>Tags</FormLabel>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag..."
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {watchedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {watchedTags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:bg-gray-200 rounded-full p-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <FormDescription>
                  Add tags to categorize this buyer (press Enter to add)
                </FormDescription>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes about this buyer..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional notes or comments
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Buyer Profile
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
