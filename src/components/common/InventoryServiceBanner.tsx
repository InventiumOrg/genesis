import React from 'react';

interface InventoryServiceBannerProps {
  error?: string;
  onRetry?: () => void;
}

export default function InventoryServiceBanner({ error, onRetry }: InventoryServiceBannerProps) {
  return (
    <div className="bg-error-50 border border-error-200 rounded-lg p-6 dark:bg-error-900/20 dark:border-error-800">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-error-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-error-800 dark:text-error-200">
            Inventory Service Unavailable
          </h3>
          <div className="mt-2 text-sm text-error-700 dark:text-error-300">
            <p>
              Failed to connect to the inventory service. Please check if the service is running and try again.
            </p>
            {error && (
              <p className="mt-1 text-xs text-error-600 dark:text-error-400">
                Error: {error}
              </p>
            )}
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-error-700 bg-error-100 hover:bg-error-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500 dark:bg-error-800 dark:text-error-200 dark:hover:bg-error-700"
              >
                <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry Connection
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-md dark:bg-warning-900/20 dark:border-warning-800">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-warning-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.19-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-warning-800 dark:text-warning-200">
              Service Status
            </h4>
            <p className="mt-1 text-sm text-warning-700 dark:text-warning-300">
              Make sure the inventory service is running
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}