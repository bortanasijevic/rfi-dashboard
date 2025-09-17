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
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">RFI Dashboard</h1>
          <p className="text-muted-foreground">
            Track and manage Request for Information (RFI) items
          </p>
        </div>
        
        <RfiTable 
          data={data} 
          onRefresh={fetchDataWithTimestamp}
          onDataRefresh={refreshDataOnly}
          lastUpdated={lastRefreshTime || lastUpdated}
        />
      </div>
    </div>
  );
}