'use client';
import { useState } from 'react';
import { POS, POSPagination } from '@/lib/pos';
import { usePOSClient } from '@/lib/pos-client';
import { useRouter } from 'next/navigation';

interface POSTableProps {
  posList: POS[];
  pagination: POSPagination;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  onPOSDeleted?: () => void;
}

export default function POSTable({
  posList,
  pagination,
  onPageChange,
  isLoading,
  onPOSDeleted,
}: POSTableProps) {
  const router = useRouter();
  const { deletePOS } = usePOSClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleView = (pos: POS) => {
    router.push(`/pos/${pos.id}`);
  };

  const handleEdit = (pos: POS) => {
    router.push(`/pos/${pos.id}/edit`);
  };

  const handleDelete = async (pos: POS) => {
    if (!confirm(`Are you sure you want to delete POS "${pos.name}"?`)) {
      return;
    }

    setDeletingId(pos.id);
    try {
      await deletePOS(pos.id);
      onPOSDeleted?.();
    } catch (error) {
      console.error('Failed to delete POS:', error);
      alert('Failed to delete POS. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'active') {
      return (
        <span className="inline-flex items-center justify-center rounded-sm px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.08em] whitespace-nowrap uppercase bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-300">
          Active
        </span>
      );
    } else if (statusLower === 'inactive') {
      return (
        <span className="inline-flex items-center justify-center rounded-sm px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.08em] whitespace-nowrap uppercase bg-transparent text-gray-400 dark:text-gray-500">
          Inactive
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center rounded-sm px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.08em] whitespace-nowrap uppercase bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-300">
        {status}
      </span>
    );
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
                Location
              </th>
              <th className="px-4 py-2.5 text-left font-mono text-[9px] font-medium tracking-[0.15em] text-gray-600 uppercase dark:text-gray-400">
                Warehouse
              </th>
              <th className="px-4 py-2.5 text-left font-mono text-[9px] font-medium tracking-[0.15em] text-gray-600 uppercase dark:text-gray-400">
                Status
              </th>
              <th className="px-4 py-2.5 text-right font-mono text-[9px] font-medium tracking-[0.15em] text-gray-600 uppercase dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {posList.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  {isLoading ? 'Loading POS...' : 'No POS found'}
                </td>
              </tr>
            ) : (
              posList.map((pos) => (
                <tr key={pos.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {pos.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {pos.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {pos.warehouseName || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(pos.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleView(pos)}
                        className="inline-flex h-7 items-center rounded-sm border border-gray-300 bg-white px-2 text-[12px] font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/[0.06]"
                        title="View POS details"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(pos)}
                        className="inline-flex h-7 items-center rounded-sm border border-gray-300 bg-white px-2 text-[12px] font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/[0.06]"
                        title="Edit POS"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(pos)}
                        disabled={deletingId === pos.id}
                        className="inline-flex h-7 items-center rounded-sm border border-gray-300 bg-white px-2 text-[12px] font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/[0.06] text-error-600 hover:border-error-300 hover:bg-error-50 hover:text-error-700 dark:text-error-300 dark:hover:bg-error-500/10 disabled:cursor-not-allowed disabled:text-gray-400"
                        title="Delete POS"
                      >
                        {deletingId === pos.id ? 'Deleting...' : 'Delete'}
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
