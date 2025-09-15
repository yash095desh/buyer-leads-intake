'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

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

interface ExportButtonProps {
  buyers: Buyer[];
}

export default function ExportButton({ buyers }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Convert buyers array to CSV string
  const convertToCSV = (buyers: Buyer[]): string => {
    const headers = [
      'ID',
      'Full Name',
      'Phone',
      'City',
      'Property Type',
      'Budget Min',
      'Budget Max',
      'Timeline',
      'Status',
      'Updated At'
    ];

    const csvRows = [
      headers.join(','),
      ...buyers.map(buyer => [
        `"${buyer.id}"`,
        `"${buyer.fullName}"`,
        `"${buyer.phone}"`,
        `"${buyer.city}"`,
        `"${buyer.propertyType}"`,
        buyer.budgetMin,
        buyer.budgetMax,
        `"${buyer.timeline.replace(/_/g, ' ')}"`,
        `"${buyer.status}"`,
        `"${new Date(buyer.updatedAt).toLocaleDateString()}"`
      ].join(','))
    ];

    return csvRows.join('\n');
  };

  // CSV Export function
  const exportToCSV = async () => {
    try {
      setIsExporting(true);
      
      if (!buyers || buyers.length === 0) {
        alert('No data to export on current page.');
        return;
      }

      // Convert to CSV
      const csvContent = convertToCSV(buyers);
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().split('T')[0];
        const timeString = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
        const filename = `buyers-export-${timestamp}-${timeString}.csv`;
        
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        URL.revokeObjectURL(url);
        
        // Show success message
        console.log(`Successfully exported ${buyers.length} buyers`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={exportToCSV}
      disabled={isExporting || buyers.length === 0}
      variant="outline"
      className="flex items-center gap-2"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {isExporting ? 'Exporting...' : `Export ${buyers.length} Records`}
    </Button>
  );
}