'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter, Loader2 } from 'lucide-react';

interface FiltersProps {
  cities?: string[];
  propertyTypes?: string[];
  statuses?: string[];
  timelines?: string[];
}

export default function BuyersFilters({ 
  cities = [],
  propertyTypes = [],
  statuses = [],
  timelines = [],
}: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isSearching, setIsSearching] = useState(false);

  const currentSearch = searchParams.get('search') || '';
  const currentCity = searchParams.get('city') || '';
  const currentPropertyType = searchParams.get('propertyType') || '';
  const currentStatus = searchParams.get('status') || '';
  const currentTimeline = searchParams.get('timeline') || '';

  const [searchInput, setSearchInput] = useState(currentSearch);
  

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const isMountedRef = useRef(true);

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      params.set('page', '1');
      
      return params.toString();
    },
    [searchParams]
  );


  const debouncedSearch = useCallback(
    (searchValue: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      setIsSearching(true);


      debounceTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          startTransition(() => {
            router.push(`/?${createQueryString({ search: searchValue || null })}`);
            setIsSearching(false);
          });
        }
      }, 300);
    },
    [createQueryString, router]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    
    debouncedSearch(value);
  };


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    
    setIsSearching(true);
    startTransition(() => {
      router.push(`/?${createQueryString({ search: searchInput || null })}`);
      setIsSearching(false);
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    const newValue = value === 'all' ? '' : value;
    startTransition(() => {
      router.push(`/?${createQueryString({ [key]: newValue || null })}`);
    });
  };

  const clearAllFilters = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    
    setSearchInput('');
    setIsSearching(false);
    startTransition(() => {
      router.push('/');
    });
  };

  const removeFilter = (key: string) => {
    if (key === 'search') {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      setSearchInput('');
      setIsSearching(false);
    }
    startTransition(() => {
      router.push(`/?${createQueryString({ [key]: null })}`);
    });
  };

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const activeFilters = [
    { key: 'search', value: currentSearch, label: `Search: "${currentSearch}"` },
    { key: 'city', value: currentCity, label: `City: ${currentCity}` },
    { key: 'propertyType', value: currentPropertyType, label: `Type: ${currentPropertyType}` },
    { key: 'status', value: currentStatus, label: `Status: ${currentStatus}` },
    { key: 'timeline', value: currentTimeline, label: `Timeline: ${currentTimeline}` },
  ].filter(filter => filter.value);

  const showLoadingState = isPending || isSearching;

  return (
    <div>
      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchInput}
                onChange={handleSearchChange}
                className="pl-10 pr-10"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                disabled={showLoadingState}
              >
                {showLoadingState ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Search className="h-3 w-3" />
                )}
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap gap-2">
            {/* City Filter */}
            {cities.length > 0 && (
              <Select defaultValue={currentCity || "all"} onValueChange={(value) => handleFilterChange('city', value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Property Type Filter */}
            {propertyTypes.length > 0 && (
              <Select defaultValue={currentPropertyType || "all"} onValueChange={(value) => handleFilterChange('propertyType', value)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Status Filter */}
            {statuses.length > 0 && (
              <Select defaultValue={currentStatus || "all"} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Timeline Filter */}
            {timelines.length > 0 && (
              <Select defaultValue={currentTimeline || "all"} onValueChange={(value) => handleFilterChange('timeline', value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Timeline</SelectItem>
                  {timelines.map((timeline) => (
                    <SelectItem key={timeline} value={timeline}>
                      {timeline.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Clear All Button */}
            {activeFilters.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Filter className="h-3 w-3" />
              Active filters:
            </div>
            {activeFilters.map((filter) => (
              <Badge key={filter.key} variant="secondary" className="flex items-center gap-1">
                {filter.label}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-transparent"
                  onClick={() => removeFilter(filter.key)}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {showLoadingState && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {isSearching ? 'Searching...' : 'Loading...'}
          </div>
        )}
      </div>
    </div>
  );
}