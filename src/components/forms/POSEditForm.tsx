"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { POS } from "@/lib/pos";
import { usePOSClient } from "@/lib/pos-client";

interface POSEditFormProps {
  pos: POS;
}

export default function POSEditForm({ pos }: POSEditFormProps) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { updatePOS } = usePOSClient();
  const [formData, setFormData] = useState({
    name: pos.name,
    location: pos.location,
    status: pos.status,
    warehouseId: pos.warehouseId || 0,
    latitude: pos.latitude == null ? '' : String(pos.latitude),
    longitude: pos.longitude == null ? '' : String(pos.longitude),
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      console.error('❌ User not authenticated - redirecting to sign-in');
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignedIn) {
      alert('You must be signed in to update POS.');
      router.push('/sign-in');
      return;
    }

    setIsLoading(true);

    try {
      // The two coordinate inputs are text so they can be emptied. Empty means
      // "not recorded" and is sent as null; anything unparseable is treated the
      // same way rather than banked as a number.
      const toCoord = (v: string): number | null => {
        const t = v.trim();
        if (t === '') return null;
        const n = Number(t);
        return Number.isFinite(n) ? n : null;
      };

      await updatePOS(pos.id, {
        ...formData,
        latitude: toCoord(formData.latitude),
        longitude: toCoord(formData.longitude),
      });
      console.log('✅ Update successful, redirecting...');
      router.push('/pos');
      router.refresh();
    } catch (error) {
      console.error('❌ Failed to update POS:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          alert('Authentication failed. Please sign in again.');
          router.push('/sign-in');
        } else {
          alert(`Failed to update POS: ${error.message}`);
        }
      } else {
        alert('Failed to update POS. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/pos');
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You must be signed in to edit POS.
          </p>
          <button
            onClick={() => router.push('/sign-in')}
            className="inline-flex h-10 items-center rounded-sm bg-brand-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-400"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* POS Name */}
        <div>
          <label htmlFor="name" className="label-cap mb-1.5 block">
            POS Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full h-10 px-3 border border-gray-300 rounded-sm text-sm focus:border-success-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white"
            placeholder="Enter POS name"
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="label-cap mb-1.5 block">
            Location *
          </label>
          <input
            type="text"
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
            className="w-full h-10 px-3 border border-gray-300 rounded-sm text-sm focus:border-success-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white"
            placeholder="Enter location"
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="label-cap mb-1.5 block">
            Status *
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            required
            className="w-full h-10 px-3 border border-gray-300 rounded-sm text-sm focus:border-success-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        {/* Warehouse ID */}
        <div>
          <label htmlFor="warehouseId" className="label-cap mb-1.5 block">
            Warehouse ID
          </label>
          <input
            type="number"
            id="warehouseId"
            value={formData.warehouseId}
            onChange={(e) => setFormData({ ...formData, warehouseId: parseInt(e.target.value) || 0 })}
            min="0"
            className="w-full h-10 px-3 border border-gray-300 rounded-sm text-sm focus:border-success-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white"
            placeholder="Enter warehouse ID"
          />
        </div>

        {/* Optional. Left empty, the map pins this till by whatever ward or
            district its location names, and the pin says it did so. */}
        <div>
          <label htmlFor="latitude" className="label-cap mb-1.5 block">
            Latitude
          </label>
          <input
            type="text"
            inputMode="decimal"
            id="latitude"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            className="w-full h-10 px-3 border border-gray-300 rounded-sm text-sm focus:border-success-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white"
            placeholder="10.804400"
          />
        </div>

        <div>
          <label htmlFor="longitude" className="label-cap mb-1.5 block">
            Longitude
          </label>
          <input
            type="text"
            inputMode="decimal"
            id="longitude"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            className="w-full h-10 px-3 border border-gray-300 rounded-sm text-sm focus:border-success-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white"
            placeholder="106.734700"
          />
          <p className="mt-1.5 text-[12px] text-gray-500 dark:text-gray-400">
            Leave both empty to pin by district instead.
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="min-w-[120px] inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-5 py-3.5 text-sm rounded-sm bg-brand-900 text-white hover:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Updating...' : 'Update POS'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-5 py-3.5 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
