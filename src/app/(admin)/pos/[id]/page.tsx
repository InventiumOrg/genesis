'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePOSClient } from '@/lib/pos-client';
import { POS } from '@/lib/pos';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@clerk/nextjs';

export default function ViewPOSPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { fetchPOS } = usePOSClient();
  const [pos, setPOS] = useState<POS | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = params?.id ? parseInt(params.id as string) : null;

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    if (!id || isNaN(id)) {
      setError('Invalid POS ID');
      setIsLoading(false);
      return;
    }

    const loadPOS = async () => {
      try {
        const data = await fetchPOS(id);
        setPOS(data);
      } catch (err) {
        console.error('Failed to fetch POS:', err);
        setError(err instanceof Error ? err.message : 'Failed to load POS');
      } finally {
        setIsLoading(false);
      }
    };

    loadPOS();
  }, [id, isLoaded, isSignedIn, fetchPOS, router]);

  const handleEdit = () => {
    router.push(`/pos/${id}/edit`);
  };

  const handleBack = () => {
    router.push('/pos');
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'active') {
      return (
        <span className="inline-flex items-center justify-center rounded-sm px-2 py-0.5 font-mono text-[11px] font-medium tracking-[0.08em] whitespace-nowrap uppercase bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-300">
          Active
        </span>
      );
    } else if (statusLower === 'inactive') {
      return (
        <span className="inline-flex items-center justify-center rounded-sm px-2 py-0.5 font-mono text-[11px] font-medium tracking-[0.08em] whitespace-nowrap uppercase bg-transparent text-gray-400 dark:text-gray-500">
          Inactive
        </span>
      );
    } else if (statusLower === 'maintenance') {
      return (
        <span className="inline-flex items-center justify-center rounded-sm px-2 py-0.5 font-mono text-[11px] font-medium tracking-[0.08em] whitespace-nowrap uppercase bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-300">
          Maintenance
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center rounded-sm px-2 py-0.5 font-mono text-[11px] font-medium tracking-[0.08em] whitespace-nowrap uppercase bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">
        {status}
      </span>
    );
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading POS details..." />
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
            Please sign in to view POS details.
          </p>
        </div>
      </div>
    );
  }

  if (error || !pos) {
    return (
      <div>
        <PageBreadcrumb pageTitle="POS Details" />
        <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-error-800 dark:text-error-400 mb-2">
            Error Loading POS
          </h3>
          <p className="text-error-700 dark:text-error-300">
            {error || 'POS not found'}
          </p>
          <button
            onClick={handleBack}
            className="mt-4 inline-flex h-10 items-center rounded-sm border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/[0.06]"
          >
            Back to POS List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={`POS Details #${id}`} />
      <div className="space-y-6">
        <ComponentCard title={pos.name}>
          <div className="space-y-6">
            {/* POS Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  POS ID
                </label>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  #{pos.id}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Name
                </label>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {pos.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Location
                </label>
                <p className="text-base text-gray-900 dark:text-white">
                  {pos.location}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Status
                </label>
                <div className="mt-1">
                  {getStatusBadge(pos.status)}
                </div>
              </div>

              {pos.warehouseId && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Warehouse ID
                  </label>
                  <p className="text-base text-gray-900 dark:text-white">
                    {pos.warehouseId}
                  </p>
                </div>
              )}

              {pos.warehouseName && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Warehouse Name
                  </label>
                  <p className="text-base text-gray-900 dark:text-white">
                    {pos.warehouseName}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleEdit}
                className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-5 py-3.5 text-sm rounded-sm bg-brand-900 text-white hover:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-400"
              >
                Edit POS
              </button>
              <button
                onClick={handleBack}
                className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-5 py-3.5 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
              >
                Back to List
              </button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
