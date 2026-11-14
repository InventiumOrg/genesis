'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePOSClient } from '@/lib/pos-client';
import { POS } from '@/lib/pos';
import POSEditForm from '@/components/forms/POSEditForm';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@clerk/nextjs';

export default function EditPOSPage() {
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

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading POS..." />
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
            Please sign in to edit POS.
          </p>
        </div>
      </div>
    );
  }

  if (error || !pos) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit POS" />
        <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-error-800 dark:text-error-400 mb-2">
            Error Loading POS
          </h3>
          <p className="text-error-700 dark:text-error-300">
            {error || 'POS not found'}
          </p>
          <button
            onClick={() => router.push('/pos')}
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
      <PageBreadcrumb pageTitle={`Edit POS #${id}`} />
      <div className="space-y-6">
        <ComponentCard title={`Edit: ${pos.name}`}>
          <POSEditForm pos={pos} />
        </ComponentCard>
      </div>
    </div>
  );
}
