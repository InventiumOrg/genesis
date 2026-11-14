'use client';

import { useAuth } from '@clerk/nextjs';
import { useApiClient } from '@/lib/api-client';
import { backendServiceBaseUrl } from '@/lib/backend-url';
import { useState } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AuthHeaderTestPage() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { apiRequest } = useApiClient();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (result: any) => {
    setTestResults(prev => [...prev, { timestamp: new Date().toISOString(), ...result }]);
  };

  const testClerkToken = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      addResult({
        test: 'Clerk Token Direct',
        success: !!token,
        data: {
          hasToken: !!token,
          tokenLength: token?.length || 0,
          tokenPreview: token ? `${token.substring(0, 50)}...` : 'No token',
        }
      });
    } catch (error) {
      addResult({
        test: 'Clerk Token Direct',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testApiClientWrapper = async () => {
    setIsLoading(true);
    try {
      // Test a simple GET request through our API client
      const response = await apiRequest('/list?limit=1');
      addResult({
        test: 'API Client Wrapper',
        success: true,
        data: response
      });
    } catch (error) {
      addResult({
        test: 'API Client Wrapper',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setIsLoading(true);
    try {
      // Test direct fetch to see what headers are actually sent
      const token = await getToken();
      
      const response = await fetch(`${backendServiceBaseUrl('inventory')}/list?limit=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      addResult({
        test: 'Direct Fetch with Manual Auth',
        success: response.ok,
        data: {
          status: response.status,
          statusText: response.statusText,
          hasToken: !!token,
          tokenPreview: token ? `${token.substring(0, 30)}...` : 'No token',
          responseData: data,
        }
      });
    } catch (error) {
      addResult({
        test: 'Direct Fetch with Manual Auth',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testFormDataRequest = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      
      const formData = new URLSearchParams();
      formData.append('Name', 'Test Item');
      formData.append('Unit', 'piece');
      formData.append('Quantity', '1');
      formData.append('Measure', 'unit');
      formData.append('Category', 'Test');
      formData.append('Location', 'Test Location');

      console.log('🔍 Making direct form data request with token:', token ? `${token.substring(0, 30)}...` : 'No token');
      
      const response = await fetch(`${backendServiceBaseUrl('inventory')}/1`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
      
      const responseText = await response.text();
      
      addResult({
        test: 'Direct Form Data PUT',
        success: response.ok,
        data: {
          status: response.status,
          statusText: response.statusText,
          hasToken: !!token,
          tokenPreview: token ? `${token.substring(0, 30)}...` : 'No token',
          responseBody: responseText,
          formDataSent: formData.toString(),
        }
      });
    } catch (error) {
      addResult({
        test: 'Direct Form Data PUT',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-error-50 dark:bg-error-900/20 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-error-900 dark:text-error-400 mb-4">
            Authentication Required
          </h1>
          <p className="text-error-700 dark:text-error-300">
            Please sign in to test authentication headers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Authorization Header Debug Test
        </h1>
        
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Test Authorization Headers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={testClerkToken}
              disabled={isLoading}
              className="px-4 py-2 rounded-sm bg-brand-900 text-white hover:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Clerk Token
            </button>
            <button
              onClick={testApiClientWrapper}
              disabled={isLoading}
              className="px-4 py-2 bg-success-500 text-white rounded-lg hover:bg-success-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test API Client
            </button>
            <button
              onClick={testDirectFetch}
              disabled={isLoading}
              className="px-4 py-2 rounded-sm bg-brand-900 text-white hover:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Direct Fetch
            </button>
            <button
              onClick={testFormDataRequest}
              disabled={isLoading}
              className="px-4 py-2 bg-error-500 text-white rounded-lg hover:bg-error-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Form Data PUT
            </button>
          </div>
          <div className="mt-4">
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Clear Results
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Test Results
          </h2>
          {testResults.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No tests run yet. Click the buttons above to start testing.
            </p>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success
                      ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
                      : 'bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-semibold ${
                      result.success
                        ? 'text-success-900 dark:text-success-400'
                        : 'text-error-900 dark:text-error-400'
                    }`}>
                      {result.test}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className={`text-sm ${
                    result.success
                      ? 'text-success-800 dark:text-success-300'
                      : 'text-error-800 dark:text-error-300'
                  }`}>
                    {result.success ? (
                      <pre className="whitespace-pre-wrap overflow-x-auto text-xs">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    ) : (
                      <div>Error: {result.error}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}