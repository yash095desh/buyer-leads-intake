'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, FileText, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

interface ImportResult {
  success: { row: number; message: string }[];
  errors: { row: number; message: string }[];
  message?: string;
}



export default function ImportButton() {
  const [isImporting, setIsImporting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file.');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    await handleImport(file);
  };

  const handleImport = async (file: File) => {
    try {
      setIsImporting(true);
      setImportResult(null);

      if(!user || !user?.emailAddresses[0]?.emailAddress){
       return toast.error(" user email not found ")
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('ownerEmail', user?.emailAddresses[0]?.emailAddress);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await axios.post(`${baseUrl}/api/buyer/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });

      const result: ImportResult = {
        success: [],
        errors: response.data.errors || [],
        message: response.data.message
      };

      // Extract success count from message
      const successMatch = result.message?.match(/Successfully imported (\d+) buyers/);
      const successCount = successMatch ? parseInt(successMatch[1]) : 0;
      
      // Create success entries based on count
      for (let i = 0; i < successCount; i++) {
        result.success.push({ row: i + 2, message: 'Successfully imported' });
      }

      setImportResult(result);
      setShowDialog(true);

      // Call the callback to refresh data
      if (window && successCount > 0) {
        setTimeout(() => {
          window.location.reload()
        }, 1000);
      }

    } catch (error) {
      console.error('Import failed:', error);
      
      let errorMessage = 'Import failed. Please try again.';
      let errors: { row: number; message: string }[] = [];

      if (axios.isAxiosError(error)) {
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
        if (error.response?.data?.errors) {
          errors = error.response.data.errors;
        }
      }

      setImportResult({
        success: [],
        errors: errors.length > 0 ? errors : [{ row: 0, message: errorMessage }],
        message: undefined
      });
      setShowDialog(true);
    } finally {
      setIsImporting(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const closeDialog = () => {
    setShowDialog(false);
    setImportResult(null);
  };
const downloadTemplate = () => {
  const headers = [
    'fullName',
    'email',
    'phone',
    'city',
    'propertyType',
    'bhk',
    'purpose',
    'budgetMin',
    'budgetMax',
    'timeline',
    'source',
    'status',
    'notes',
    'tags'
  ];

  const sampleData = [
    'John Doe',
    'john@example.com',
    '9876543210',
    'Mumbai',
    'Apartment',        
    'TWO',              
    'Buy',              
    5000000,            
    7000000,            
    'ZERO_TO_THREE_M',  
    'Website',          
    'New',              
    'Looking for sea-facing apartment',
    '["premium","urgent"]'
  ];

  const csvContent = [
    headers.join(','),
    sampleData.join(','),
    '# Property Types: Apartment, Villa, Plot, Office, Retail',
    '# BHK: ONE, TWO, THREE, FOUR, Studio',
    '# Purpose: Buy, Rent',
    '# Timeline: ZERO_TO_THREE_M, THREE_TO_SIX_M, GREATER_THAN_SIX_M, Exploring',
    '# Source: Website, Referral, Walk_in, Call, Other',
    '# Status: New, Qualified, Contacted, Visited, Negotiation, Converted, Dropped'
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'buyers-import-template.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={downloadTemplate}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-sm"
        >
          <FileText className="h-4 w-4" />
          Template
        </Button>

        <Button
          onClick={handleFileSelect}
          disabled={isImporting}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isImporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {isImporting ? 'Importing...' : 'Import CSV'}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      <Dialog open={showDialog} onOpenChange={closeDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {importResult?.success.length ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              Import Results
            </DialogTitle>
            <DialogDescription>
              Review the import results below
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Success Summary */}
            {importResult?.message && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {importResult.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Statistics */}
            <div className="flex gap-4">
              <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                ✓ {importResult?.success.length || 0} Successful
              </Badge>
              <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
                ✗ {importResult?.errors.length || 0} Failed
              </Badge>
            </div>

            {/* Errors */}
            {importResult?.errors && importResult.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {importResult.errors.map((error, index) => (
                    <div key={index} className="text-sm bg-red-50 border border-red-200 rounded p-2">
                      <span className="font-medium text-red-700">Row {error.row}:</span>
                      <span className="text-red-600 ml-2">{error.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="text-sm text-gray-600 border-t pt-4">
              <p className="font-medium mb-2">Import Guidelines:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Use the template for correct column headers</li>
                <li>Ensure phone numbers are 10-15 digits</li>
                <li>BHK is required for APARTMENT and VILLA property types</li>
                <li>budgetMax must be greater than budgetMin if both are provided</li>
                <li>Use exact enum values as shown in the template</li>
              </ul>
            </div>

            <div className="flex justify-end">
              <Button onClick={closeDialog} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}