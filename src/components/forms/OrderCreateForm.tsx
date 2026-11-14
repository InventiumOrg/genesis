"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useOrdersClient } from "@/lib/orders-client";

export default function OrderCreateForm() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { createOrder } = useOrdersClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    posId: 0,
    recipeId: 0,
    price: 0,
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      alert("You must be signed in to create orders.");
      router.push("/sign-in");
      return;
    }

    if (!formData.posId || formData.posId < 1) {
      alert("POS ID is required.");
      return;
    }
    if (!formData.recipeId || formData.recipeId < 1) {
      alert("Recipe ID is required.");
      return;
    }

    setIsLoading(true);
    try {
      await createOrder({
        posId: Math.floor(formData.posId),
        recipeId: Math.floor(formData.recipeId),
        price: Number(formData.price) || 0,
      });
      router.push("/orders");
      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to create order."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/orders");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="posId"
            className="label-cap mb-1.5 block"
          >
            POS ID *
          </label>
          <input
            type="number"
            id="posId"
            value={formData.posId || ""}
            min={1}
            step={1}
            onChange={(e) =>
              setFormData({
                ...formData,
                posId: parseInt(e.target.value, 10) || 0,
              })
            }
            required
            className="w-full h-10 px-3 border border-gray-300 rounded-sm text-sm focus:border-success-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white"
            placeholder="e.g. 23456"
          />
        </div>

        <div>
          <label
            htmlFor="recipeId"
            className="label-cap mb-1.5 block"
          >
            Recipe ID *
          </label>
          <input
            type="number"
            id="recipeId"
            value={formData.recipeId || ""}
            min={1}
            step={1}
            onChange={(e) =>
              setFormData({
                ...formData,
                recipeId: parseInt(e.target.value, 10) || 0,
              })
            }
            required
            className="w-full h-10 px-3 border border-gray-300 rounded-sm text-sm focus:border-success-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white"
            placeholder="e.g. 12432"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="price"
            className="label-cap mb-1.5 block"
          >
            Price
          </label>
          <input
            type="number"
            id="price"
            value={formData.price}
            min={0}
            step="1"
            onChange={(e) =>
              setFormData({
                ...formData,
                price: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full h-10 px-3 border border-gray-300 rounded-sm text-sm focus:border-success-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white"
            placeholder="e.g. 235"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="min-w-[120px] inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-5 py-3.5 text-sm rounded-sm bg-brand-900 text-white hover:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating..." : "Create order"}
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
