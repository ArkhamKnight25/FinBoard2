'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { fetchDynamicData, getValueByPath } from '@/lib/api/dynamicApi';

interface DynamicWidgetProps {
  title: string;
  apiUrl: string;
  selectedFields: string[];
  refreshInterval?: number;
  displayMode: 'card' | 'table' | 'list';
  onRemove?: () => void;
  onConfigure?: () => void;
}

export const DynamicWidget: React.FC<DynamicWidgetProps> = ({
  title,
  apiUrl,
  selectedFields,
  refreshInterval = 30000,
  displayMode = 'card',
  onRemove,
  onConfigure,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await fetchDynamicData(apiUrl, selectedFields);
      setData(result);
      setError(null);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [apiUrl, selectedFields, refreshInterval]);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      // Check if it looks like a price/currency
      if (value > 0 && value < 1000000) {
        return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      return value.toLocaleString();
    }
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return `[${value.length} items]`;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getFieldLabel = (field: string): string => {
    const parts = field.split('.');
    const lastPart = parts[parts.length - 1].replace('[]', '');
    return lastPart
      .split(/(?=[A-Z])/)
      .join(' ')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderCardView = () => {
    if (!data) return null;

    return (
      <div className="grid grid-cols-1 gap-3">
        {selectedFields.map((field, index) => {
          const value = data[field];
          const label = getFieldLabel(field);
          
          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <span className="text-sm text-gray-400">{label}</span>
              <span className="font-semibold text-white">{formatValue(value)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTableView = () => {
    if (!data) return null;

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 px-3 text-gray-400 font-medium text-sm">Field</th>
              <th className="text-right py-2 px-3 text-gray-400 font-medium text-sm">Value</th>
            </tr>
          </thead>
          <tbody>
            {selectedFields.map((field, index) => {
              const value = data[field];
              const label = getFieldLabel(field);
              
              return (
                <tr
                  key={index}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                >
                  <td className="py-2 px-3 text-gray-300 text-sm">{label}</td>
                  <td className="py-2 px-3 text-right text-white font-medium">{formatValue(value)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderListView = () => {
    if (!data) return null;

    return (
      <div className="space-y-2">
        {selectedFields.map((field, index) => {
          const value = data[field];
          const label = getFieldLabel(field);
          
          return (
            <div key={index} className="text-sm">
              <span className="text-gray-400">{label}: </span>
              <span className="text-white font-medium">{formatValue(value)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card
      title={title}
      onRemove={onRemove}
      onConfigure={onConfigure}
      onRefresh={fetchData}
      loading={loading}
      error={error || undefined}
      lastUpdated={lastUpdated}
    >
      {displayMode === 'card' && renderCardView()}
      {displayMode === 'table' && renderTableView()}
      {displayMode === 'list' && renderListView()}
    </Card>
  );
};
