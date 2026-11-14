"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useSalesClient } from "@/lib/sales-client";

export default function SaleCreateForm() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { createSale } = useSalesClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    posId: 0,
    recipeId: 0,
    price: 0,
    quantity: 1,
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/sign-in");
  }, [isLoaded, isSignedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    if (!formData.posId || !formData.recipeId) {
      alert("POS ID and Recipe ID are required.");
      return;
    }
    setIsLoading(true);
    try {
      await createSale({
        posId: Math.floor(formData.posId),
        recipeId: Math.floor(formData.recipeId),
        price: Number(formData.price) || 0,
        quantity: Math.floor(formData.quantity) || 1,
      });
      router.push("/sales");
      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to create sale."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label-cap mb-1.5 block">POS ID *</label>
          <input
            type="number"
            min={1}
            value={formData.posId || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                posId: parseInt(e.target.value, 10) || 0,
              })
            }
            required
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label className="label-cap mb-1.5 block">Recipe ID *</label>
          <input
            type="number"
            min={1}
            value={formData.recipeId || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                recipeId: parseInt(e.target.value, 10) || 0,
              })
            }
            required
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label className="label-cap mb-1.5 block">Quantity</label>
          <input
            type="number"
            min={1}
            value={formData.quantity}
            onChange={(e) =>
              setFormData({
                ...formData,
                quantity: parseInt(e.target.value, 10) || 1,
              })
            }
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label className="label-cap mb-1.5 block">Price</label>
          <input
            type="number"
            min={0}
            step="1"
            value={formData.price}
            onChange={(e) =>
              setFormData({
                ...formData,
                price: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-3 text-sm rounded-sm bg-brand-900 text-white hover:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-400 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
        >
          {isLoading ? "Creating…" : "Create sale"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/sales")}
          className="px-5 py-3 text-sm ring-1 ring-gray-300 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
