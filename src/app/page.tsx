'use client';

import { useState, useEffect } from 'react';
import { RfiTable } from '@/components/RfiTable';
import { type RfiRow } from '@/types/rfi';
import { getLastUpdatedTimestamp } from '@/lib/date';

export default function Home() {
  const [data, setData] = useState<RfiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('Loading...');
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('');

  // Load saved refresh time on component mount
  useEffect(() => {
    const savedRefreshTime = localStorage.getItem('rfi-last-refresh-time');
    if (savedRefreshTime) {
      setLastRefreshTime(savedRefreshTime);
    }
  }, []);

  const fetchData = async (cleanupNotes = false) => {
    try {
      setLoading(true);
      const headers: Record<string, string> = {};
      if (cleanupNotes) {
        headers['x-cleanup-notes'] = 'true';
      }
      
      const response = await fetch('/api/rfis', {
        cache: 'no-store',
        headers,
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const result = await response.json();
      setData(result.rows);
      // Only update lastUpdated on initial load, not on subsequent fetches
      if (!lastRefreshTime) {
        setLastUpdated(getLastUpdatedTimestamp(result.rows));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
      setLastUpdated('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  // Function specifically for the refresh button (updates timestamp)
  const fetchDataWithTimestamp = async () => {
    await fetchData(true); // Include cleanup
    const newRefreshTime = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    setLastRefreshTime(newRefreshTime);
    // Save to localStorage so it persists across page reloads
    localStorage.setItem('rfi-last-refresh-time', newRefreshTime);
  };

  // Separate function for refreshing data without updating timestamp
  const refreshDataOnly = async () => {
    try {
      const response = await fetch('/api/rfis', {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const result = await response.json();
      setData(result.rows);
      // Don't update lastUpdated timestamp for note-only refreshes
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    <div className="min-h-screen bg-[var(--domaco-light-gray)]">
      {/* Header with company branding */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-8">
            <img 
              src="/images/Domaco-Encocorp-Projects-1.png" 
              alt="Domaco-Encocorp" 
              className="h-20 w-auto"
            />
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-bold tracking-tight text-[var(--domaco-gray)] mb-1">RFI Dashboard</h1>
              <p className="text-[var(--domaco-gray)] text-lg font-medium">
                Request for Information Management System
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
        
          <RfiTable 
            data={data} 
            onRefresh={fetchDataWithTimestamp}
            onDataRefresh={refreshDataOnly}
            lastUpdated={lastRefreshTime || lastUpdated}
          />
        </div>
      </div>
    </div>
  );
}