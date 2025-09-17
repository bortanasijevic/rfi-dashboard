'use client';

import { useState, useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, ExternalLink, Mail, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type RfiRow } from '@/types/rfi';
import { formatDate, getDaysLateStyling } from '@/lib/date';
import { NoteCell } from '@/components/NoteCell';

interface RfiTableProps {
  data: RfiRow[];
  onRefresh: (cleanupNotes?: boolean) => void;
  onDataRefresh?: () => void; // For note updates without timestamp change
  lastUpdated: string;
}

const columnHelper = createColumnHelper<RfiRow>();

export function RfiTable({ data, onRefresh, onDataRefresh, lastUpdated }: RfiTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handlePowerfulRefresh = async () => {
    setIsRefreshing(true);
    try {
      // 1) Ask backend to run the exporter
      const response = await fetch('/api/refresh', {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'x-refresh-key': process.env.NEXT_PUBLIC_REFRESH_KEY || '',
        },
      });

      const result = await response.json();
      
      if (!result.ok) {
        console.error('Exporter failed:', result);
        alert(`Exporter failed: ${result.stderr || 'Unknown error'}`);
        return;
      }

      console.log('Exporter completed successfully');
      
      // 2) Re-fetch /api/rfis with cleanup and update timestamp
      await onRefresh();
    } catch (error) {
      console.error('Refresh error:', error);
      alert('Failed to refresh data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const columns = useMemo<ColumnDef<RfiRow, unknown>[]>(
    () => [
      columnHelper.accessor('number', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 lg:px-3"
          >
            Number
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ getValue }) => (
          <div className="font-medium">{getValue()}</div>
        ),
      }),
      columnHelper.accessor('subject', {
        header: 'Subject',
        cell: ({ getValue }) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[300px] truncate">
                  {getValue()}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[400px]">{getValue()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      }),
      columnHelper.accessor('ball_in_court', {
        header: 'Ball in Court',
        cell: ({ getValue }) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[200px] truncate">
                  {getValue()}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[300px]">{getValue()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      }),
      columnHelper.accessor('due_date', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 lg:px-3"
          >
            Due Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ getValue }) => (
          <div>{formatDate(getValue())}</div>
        ),
      }),
      columnHelper.accessor('days_late', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 lg:px-3"
          >
            Days Late
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ getValue }) => {
          const daysLate = getValue();
          const styling = getDaysLateStyling(daysLate);
          return (
            <div className={`px-2 py-1 rounded text-sm font-medium ${styling}`}>
              {daysLate}
            </div>
          );
        },
      }),
      columnHelper.accessor('last_change_of_court', {
        header: 'Last Change of Court',
        cell: ({ getValue }) => (
          <div className="text-sm">
            {getValue() === 'N/A' ? (
              <span className="text-muted-foreground">N/A</span>
            ) : (
              formatDate(getValue())
            )}
          </div>
        ),
      }),
      columnHelper.accessor('days_in_court', {
        header: 'Days in Court',
        cell: ({ getValue }) => (
          <div className={getValue() === 'N/A' ? 'text-muted-foreground' : ''}>
            {getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('notes', {
        header: 'Notes',
        cell: ({ getValue, row }) => (
          <NoteCell 
            value={getValue() || ''}
            rfiNumber={row.original.number}
            rfiSubject={row.original.subject}
            onSave={async (note) => {
              // After saving note, refresh data without updating timestamp
              if (onDataRefresh) {
                await onDataRefresh();
              } else {
                await onRefresh();
              }
            }}
          />
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(row.original.link, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open in Procore</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(row.original.mailto_reminder, '_blank')}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Craft Email</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Remove pagination - show all rows
    // getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    globalFilterFn: (row, columnId, value) => {
      const searchValue = value.toLowerCase();
      const number = row.getValue('number') as string;
      const subject = row.getValue('subject') as string;
      const ballInCourt = row.getValue('ball_in_court') as string;
      const notes = row.getValue('notes') as string;
      
      return (
        number.toLowerCase().includes(searchValue) ||
        subject.toLowerCase().includes(searchValue) ||
        ballInCourt.toLowerCase().includes(searchValue) ||
        notes.toLowerCase().includes(searchValue)
      );
    },
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search RFIs..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            Last refreshed: {lastUpdated}
          </div>
          <Button 
            onClick={handlePowerfulRefresh} 
            variant="outline" 
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Running Exporter...' : 'Run Exporter & Refresh'}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Show total count */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {table.getFilteredRowModel().rows.length} entries
        </div>
      </div>
    </div>
  );
}
