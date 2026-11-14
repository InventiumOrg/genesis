'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWarehouseClient } from '@/lib/warehouse-client';
import { Warehouse } from '@/lib/warehouse';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@clerk/nextjs';
import { backendServiceBaseUrl } from '@/lib/backend-url';

export default function EditWarehousePage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { fetchWarehouse } = useWarehouseClient();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    country: '',
  });

  const warehouseId = params.id ? parseInt(params.id as string) : null;

  useEffect(() => {
    if (isLoaded && isSignedIn && warehouseId) {
      loadWarehouse();
    }
  }, [isLoaded, isSignedIn, warehouseId]);

  const loadWarehouse = async () => {
    if (!warehouseId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const warehouseData = await fetchWarehouse(warehouseId);
      setWarehouse(warehouseData);
      setFormData({
        name: warehouseData.name,
        address: warehouseData.address,
        ward: warehouseData.ward,
        district: warehouseData.district,
        city: warehouseData.city,
        country: warehouseData.country,
      });
    } catch (err) {
      console.error('Failed to load warehouse:', err);
      setError(err instanceof Error ? err.message : 'Failed to load warehouse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseId) return;

    setIsSaving(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('Name', formData.name);
      formDataToSend.append('Address', formData.address);
      formDataToSend.append('Ward', formData.ward);
      formDataToSend.append('District', formData.district);
      formDataToSend.append('City', formData.city);
      formDataToSend.append('Country', formData.country);

      const response = await fetch(`${backendServiceBaseUrl('warehouse')}/${warehouseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Success - redirect to warehouse detail page
      router.push(`/warehouse/${warehouseId}`);
    } catch (err) {
      console.error('Failed to update warehouse:', err);
      setError(err instanceof Error ? err.message : 'Failed to update warehouse');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading authentication..." />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to edit warehouses.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading warehouse details..." />
      </div>
    );
  }

  if (error && !warehouse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-error-600 dark:text-error-400 mb-4">
            Error Loading Warehouse
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/warehouse')}
            className="px-4 py-2 rounded-sm bg-brand-900 text-white hover:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-400"
          >
            Back to Warehouses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push(`/warehouse/${warehouseId}`)}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Warehouse
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-error-800 dark:text-error-400">
                    Error updating warehouse
                  </h3>
                  <div className="mt-2 text-sm text-error-700 dark:text-error-300">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="label-cap mb-1.5 block">
                Warehouse Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="h-10 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:font-mono placeholder:text-[12px] placeholder:tracking-wider placeholder:text-gray-400 focus:border-success-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-gray-500"
                disabled={isSaving}
              />
            </div>

            <div>
              <label htmlFor="address" className="label-cap mb-1.5 block">
                Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="h-10 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:font-mono placeholder:text-[12px] placeholder:tracking-wider placeholder:text-gray-400 focus:border-success-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-gray-500"
                disabled={isSaving}
              />
            </div>

            <div>
              <label htmlFor="ward" className="label-cap mb-1.5 block">
                Ward *
              </label>
              <input
                type="text"
                id="ward"
                name="ward"
                value={formData.ward}
                onChange={handleInputChange}
                required
                className="h-10 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:font-mono placeholder:text-[12px] placeholder:tracking-wider placeholder:text-gray-400 focus:border-success-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-gray-500"
                disabled={isSaving}
              />
            </div>

            <div>
              <label htmlFor="district" className="label-cap mb-1.5 block">
                District *
              </label>
              <input
                type="text"
                id="district"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                required
                className="h-10 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:font-mono placeholder:text-[12px] placeholder:tracking-wider placeholder:text-gray-400 focus:border-success-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-gray-500"
                disabled={isSaving}
              />
            </div>

            <div>
              <label htmlFor="city" className="label-cap mb-1.5 block">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="h-10 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:font-mono placeholder:text-[12px] placeholder:tracking-wider placeholder:text-gray-400 focus:border-success-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-gray-500"
                disabled={isSaving}
              />
            </div>

            <div>
              <label htmlFor="country" className="label-cap mb-1.5 block">
                Country *
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                className="h-10 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:font-mono placeholder:text-[12px] placeholder:tracking-wider placeholder:text-gray-400 focus:border-success-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-gray-500"
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push(`/warehouse/${warehouseId}`)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-10 items-center rounded-sm bg-brand-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 dark:bg-brand-500 dark:hover:bg-brand-400"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}