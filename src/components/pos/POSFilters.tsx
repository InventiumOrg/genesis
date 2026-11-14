'use client';
import { useState } from 'react';
import { POSFilters } from '@/lib/pos';

interface POSFiltersProps {
  filters: POSFilters;
  onFiltersChange: (filters: POSFilters) => void;
  isLoading: boolean;
}

export default function POSFiltersComponent({
  filters,
  onFiltersChange,
  isLoading,
}: POSFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({
      ...filters,
      search: searchInput,
      page: 1,
    });
  };

  const handleSearchClear = () => {
    setSearchInput('');
    onFiltersChange({
      ...filters,
      search: '',
      page: 1,
    });
  };

  return (
    <div className="border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <form onSubmit={handleSearchSubmit} className="flex gap-4 items-end">
        <div className="flex-1">
          <label htmlFor="search" className="label-cap mb-1.5 block">
            Search POS
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, location..."
              className="h-10 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:font-mono placeholder:text-[12px] placeholder:tracking-wider placeholder:text-gray-400 focus:border-success-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-gray-500"
              disabled={isLoading}
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleSearchClear}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                disabled={isLoading}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex h-10 items-center rounded-sm bg-brand-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 dark:bg-brand-500 dark:hover:bg-brand-400"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>
    </div>
  );
}
