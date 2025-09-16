'use client';

import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { DemoRfiTable } from '@/components/DemoRfiTable';
import { type RfiRow } from '@/types/rfi';
import { getLastUpdatedTimestamp } from '@/lib/date';

const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'rfi2024demo';

export function ProtectedDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [data, setData] = useState<RfiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('Loading...');

  // Check if user is already authenticated (session storage)
  useEffect(() => {
    const authStatus = sessionStorage.getItem('rfi-dashboard-auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = (password: string) => {
    if (password === DEMO_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError('');
      sessionStorage.setItem('rfi-dashboard-auth', 'true');
    } else {
      setLoginError('Incorrect password. Please try again.');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rfis', {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const result = await response.json();
      setData(result.rows);
      setLastUpdated(getLastUpdatedTimestamp(result.rows));
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
      setLastUpdated('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} error={loginError} />;
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading RFI data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">RFI Dashboard</h1>
            <p className="text-muted-foreground">
              Track and manage Request for Information (RFI) items
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              Demo Version - Data updates hourly
            </p>
            <button
              onClick={() => {
                sessionStorage.removeItem('rfi-dashboard-auth');
                setIsAuthenticated(false);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Sign Out
            </button>
          </div>
        </div>
        
        {/* Demo version - no refresh button */}
        <DemoRfiTable 
          data={data} 
          lastUpdated={lastUpdated}
        />
      </div>
    </div>
  );
}
