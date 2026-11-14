'use client';
import { useState } from 'react';
import { Warehouse, WarehousePagination } from '@/lib/warehouse';
import { useWarehouseClient } from '@/lib/warehouse-client';
import { useRouter } from 'next/navigation';

interface WarehouseTableProps {
  warehouses: Warehouse[];
  pagination: WarehousePagination;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  onWarehouseDeleted?: () => void;
}

export default function WarehouseTable({
  warehouses,
  pagination,
  onPageChange,
  isLoading,
  onWarehouseDeleted,
}: WarehouseTableProps) {
  const router = useRouter();
  const { deleteWarehouse } = useWarehouseClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleView = (warehouse: Warehouse) => {
    router.push(`/warehouse/${warehouse.id}`);
  };

  const handleEdit = (warehouse: Warehouse) => {
    router.push(`/warehouse/${warehouse.id}/edit`);
  };

  const handleDelete = async (warehouse: Warehouse) => {
    if (!confirm(`Are you sure you want to delete warehouse "${warehouse.name}"?`)) {
      return;
    }

    setDeletingId(warehouse.id);
    try {
      await deleteWarehouse(warehouse.id);
      onWarehouseDeleted?.();
    } catch (error) {
      console.error('Failed to delete warehouse:', error);
      alert('Failed to delete warehouse. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-transparent border-t border-gray-200 dark:border-gray-800 sm:px-6">
        <div className="flex justify-between flex-1 sm:hidden">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1 || isLoading}
            className="relative inline-flex h-9 items-center rounded-sm border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 dark:border-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/[0.06]"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages || isLoading}
            className="relative ml-2 relative inline-flex h-9 items-center rounded-sm border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 dark:border-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/[0.06]"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{pagination.startIndex}</span> to{' '}
              <span className="font-medium">{pagination.endIndex}</span> of{' '}
              <span className="font-medium">{pagination.totalItems}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex gap-1" aria-label="Pagination">
              <button
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1 || isLoading}
                className="relative inline-flex items-center rounded-sm border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 dark:border-gray-700 dark:bg-transparent dark:text-gray-400 dark:hover:bg-white/[0.06]"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              {pages.map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  disabled={isLoading}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === pagination.currentPage
                      ? 'z-10 bg-brand-50 dark:bg-brand-900 border-brand-500 text-brand-600 dark:text-brand-400'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages || isLoading}
                className="relative inline-flex items-center rounded-sm border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 dark:border-gray-700 dark:bg-transparent dark:text-gray-400 dark:hover:bg-white/[0.06]"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-hidden border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-2.5 text-left font-mono text-[9px] font-medium tracking-[0.15em] text-gray-600 uppercase dark:text-gray-400">
                Name
              </th>
              <th className="px-4 py-2.5 text-left font-mono text-[9px] font-medium tracking-[0.15em] text-gray-600 uppercase dark:text-gray-400">
                Address
              </th>
              <th className="px-4 py-2.5 text-left font-mono text-[9px] font-medium tracking-[0.15em] text-gray-600 uppercase dark:text-gray-400">
                Location
              </th>
              <th className="px-4 py-2.5 text-right font-mono text-[9px] font-medium tracking-[0.15em] text-gray-600 uppercase dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {warehouses.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  {isLoading ? 'Loading warehouses...' : 'No warehouses found'}
                </td>
              </tr>
            ) : (
              warehouses.map((warehouse) => (
                <tr key={warehouse.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {warehouse.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {warehouse.address}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {warehouse.ward}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {warehouse.district}, {warehouse.city}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {warehouse.country}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleView(warehouse)}
                        className="inline-flex h-7 items-center rounded-sm border border-gray-300 bg-white px-2 text-[12px] font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/[0.06]"
                        title="View warehouse details"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(warehouse)}
                        className="inline-flex h-7 items-center rounded-sm border border-gray-300 bg-white px-2 text-[12px] font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/[0.06]"
                        title="Edit warehouse"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(warehouse)}
                        disabled={deletingId === warehouse.id}
                        className="inline-flex h-7 items-center rounded-sm border border-gray-300 bg-white px-2 text-[12px] font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/[0.06] text-error-600 hover:border-error-300 hover:bg-error-50 hover:text-error-700 dark:text-error-300 dark:hover:bg-error-500/10 disabled:cursor-not-allowed disabled:text-gray-400"
                        title="Delete warehouse"
                      >
                        {deletingId === warehouse.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  );
}