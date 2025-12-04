'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { UnifiedQuote } from '@/lib/finance/types';
import { Search, ArrowUp, ArrowDown } from 'lucide-react';
import { useWidgetData } from '@/hooks/useWidgetData';

interface StockTableWidgetProps {
  symbols: string[];
  refreshInterval?: number;
  onRemove?: () => void;
  onConfigure?: () => void;
}

type SortField = 'symbol' | 'name' | 'price' | 'change' | 'changePercent';
type SortDirection = 'asc' | 'desc';

export const StockTableWidget: React.FC<StockTableWidgetProps> = ({
  symbols,
  refreshInterval = 60000,
  onRemove,
  onConfigure,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('symbol');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const itemsPerPage = 5;

  // Fetch data for each symbol
  const results = symbols.map(symbol =>
    useWidgetData<UnifiedQuote>({
      provider: 'finnhub',
      endpoint: 'quote',
      symbol,
      refreshIntervalMs: refreshInterval,
    })
  );

  const loading = results.some(r => r.loading);
  const error = results.find(r => r.error)?.error || null;
  const stocks = results.map(r => r.data).filter((d): d is UnifiedQuote => d !== null);

  // Update last updated time when data changes
  React.useEffect(() => {
    if (!loading && stocks.length > 0) {
      setLastUpdated(new Date());
    }
  }, [loading, stocks.length]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUp className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-blue-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-blue-400" />
    );
  };

  const sortedStocks = useMemo(() => {
    const sorted = [...stocks].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'name') {
        aVal = (a.name || a.symbol).toLowerCase();
        bVal = (b.name || b.symbol).toLowerCase();
      }

      if (typeof aVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  }, [stocks, sortField, sortDirection]);

  const filteredStocks = sortedStocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stock.name && stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  const paginatedStocks = filteredStocks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRefresh = () => {
    setLastUpdated(new Date());
    // The useWidgetData hook will handle the actual refresh
  };

  return (
    <Card
      title="Stock Table"
      onRemove={onRemove}
      onConfigure={onConfigure}
      onRefresh={handleRefresh}
      loading={loading}
      error={error || undefined}
      lastUpdated={lastUpdated}
    >
      <div className="space-y-4">
        {/* Search & Stats */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search table..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>{filteredStocks.length} of {stocks.length} items</span>
            <span className="px-2 py-1 bg-gray-700/50 rounded">{refreshInterval / 1000}s</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th
                  className="text-left py-2 px-3 text-gray-400 font-medium text-sm cursor-pointer hover:text-gray-300 group"
                  onClick={() => handleSort('symbol')}
                >
                  <div className="flex items-center gap-1">
                    Symbol
                    <SortIcon field="symbol" />
                  </div>
                </th>
                <th
                  className="text-left py-2 px-3 text-gray-400 font-medium text-sm cursor-pointer hover:text-gray-300 group"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Company
                    <SortIcon field="name" />
                  </div>
                </th>
                <th
                  className="text-right py-2 px-3 text-gray-400 font-medium text-sm cursor-pointer hover:text-gray-300 group"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Price
                    <SortIcon field="price" />
                  </div>
                </th>
                <th
                  className="text-right py-2 px-3 text-gray-400 font-medium text-sm cursor-pointer hover:text-gray-300 group"
                  onClick={() => handleSort('change')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Change
                    <SortIcon field="change" />
                  </div>
                </th>
                <th
                  className="text-right py-2 px-3 text-gray-400 font-medium text-sm cursor-pointer hover:text-gray-300 group"
                  onClick={() => handleSort('changePercent')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Change %
                    <SortIcon field="changePercent" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedStocks.map((stock) => (
                <tr
                  key={stock.symbol}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                >
                  <td className="py-3 px-3 font-semibold text-white">{stock.symbol}</td>
                  <td className="py-3 px-3 text-gray-300 text-sm">{stock.name || '-'}</td>
                  <td className="py-3 px-3 text-right text-white">${stock.price.toFixed(2)}</td>
                  <td className={`py-3 px-3 text-right ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                  </td>
                  <td className={`py-3 px-3 text-right font-medium ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm text-white transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm text-white transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};
