'use client';

import { useState, useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, ExternalLink, Mail, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { formatDate, formatDateTime, getDaysLateStyling } from '@/lib/date';

interface RfiTableProps {
  data: RfiRow[];
  onRefresh: () => void;
  lastUpdated: string;
}

const columnHelper = createColumnHelper<RfiRow>();

export function RfiTable({ data, onRefresh, lastUpdated }: RfiTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<RfiRow>[]>(
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
              formatDateTime(getValue())
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
                    onClick={() => window.open(row.original.mailto_reminder, '_self')}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send Email</p>
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
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    globalFilterFn: (row, columnId, value) => {
      const searchValue = value.toLowerCase();
      const number = row.getValue('number') as string;
      const subject = row.getValue('subject') as string;
      const ballInCourt = row.getValue('ball_in_court') as string;
      
      return (
        number.toLowerCase().includes(searchValue) ||
        subject.toLowerCase().includes(searchValue) ||
        ballInCourt.toLowerCase().includes(searchValue)
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
            Last updated: {lastUpdated}
          </div>
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
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

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          of {table.getFilteredRowModel().rows.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
