'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Plus, Loader2, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { Widget, WidgetType } from '@/types';
import { testApiEndpoint } from '@/lib/api/dynamicApi';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (widget: Widget) => void;
}

type WidgetMode = 'preset' | 'custom';
type DisplayMode = 'card' | 'table' | 'list';

export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [mode, setMode] = useState<WidgetMode>('preset');
  const [selectedType, setSelectedType] = useState<WidgetType>('watchlist');
  const [title, setTitle] = useState('');
  
  // Preset widget states
  const [symbols, setSymbols] = useState('AAPL,MSFT,GOOGL');
  const [chartSymbol, setChartSymbol] = useState('AAPL');
  const [chartInterval, setChartInterval] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  // Custom API widget states
  const [apiUrl, setApiUrl] = useState('');
  const [refreshInterval, setRefreshInterval] = useState('30');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('card');
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [fieldSearch, setFieldSearch] = useState('');
  const [apiTestStatus, setApiTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [apiTestMessage, setApiTestMessage] = useState('');
  const [apiTestData, setApiTestData] = useState<any>(null);

  if (!isOpen) return null;

  const handleTestApi = async () => {
    if (!apiUrl) {
      setApiTestStatus('error');
      setApiTestMessage('Please enter an API URL');
      return;
    }

    setApiTestStatus('testing');
    setApiTestMessage('Testing API connection...');

    const result = await testApiEndpoint(apiUrl);

    if (result.success) {
      setApiTestStatus('success');
      setApiTestMessage(`API connection successful! ${result.fields?.length || 0} fields found.`);
      setAvailableFields(result.fields || []);
      setApiTestData(result.data);
    } else {
      setApiTestStatus('error');
      setApiTestMessage(result.error || 'Failed to connect to API');
      setAvailableFields([]);
    }
  };

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleAdd = () => {
    if (mode === 'custom') {
      if (!apiUrl || selectedFields.length === 0) {
        alert('Please test the API and select at least one field');
        return;
      }

      const widget: Widget = {
        id: `widget-${Date.now()}`,
        type: 'custom' as any,
        title: title || 'Custom Widget',
        position: { x: 0, y: 0, w: 4, h: 3 },
        config: {
          apiEndpoint: apiUrl,
          refreshInterval: parseInt(refreshInterval) * 1000,
          displayFields: selectedFields,
          displayMode,
        },
      };

      onAdd(widget);
      onClose();
      resetForm();
      return;
    }

    // Preset widget logic (existing)
    const baseWidget = {
      id: `widget-${Date.now()}`,
      type: selectedType,
      title: title || getDefaultTitle(selectedType),
      position: { x: 0, y: 0, w: 4, h: 3 },
    };

    let widget: Widget;

    switch (selectedType) {
      case 'watchlist':
      case 'table':
        widget = {
          ...baseWidget,
          config: {
            symbols: symbols.split(',').map(s => s.trim()),
            refreshInterval: 60000,
          },
        };
        break;
      case 'chart':
        widget = {
          ...baseWidget,
          config: {
            symbols: [chartSymbol],
            chartInterval,
            refreshInterval: 300000,
          },
        };
        break;
      case 'gainers':
        widget = {
          ...baseWidget,
          config: {
            refreshInterval: 120000,
          },
        };
        break;
      default:
        widget = {
          ...baseWidget,
          config: {},
        };
    }

    onAdd(widget);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setSymbols('AAPL,MSFT,GOOGL');
    setChartSymbol('AAPL');
    setChartInterval('daily');
    setApiUrl('');
    setRefreshInterval('30');
    setDisplayMode('card');
    setAvailableFields([]);
    setSelectedFields([]);
    setFieldSearch('');
    setApiTestStatus('idle');
    setApiTestMessage('');
    setApiTestData(null);
    setMode('preset');
  };

  const getDefaultTitle = (type: WidgetType) => {
    const titles: Record<WidgetType, string> = {
      watchlist: 'My Watchlist',
      table: 'Stock Table',
      chart: 'Stock Chart',
      gainers: 'Market Gainers',
      card: 'Finance Card',
      performance: 'Performance',
      custom: 'Custom Widget',
    };
    return titles[type];
  };

  const filteredFields = availableFields.filter(field =>
    field.toLowerCase().includes(fieldSearch.toLowerCase())
  );

  const getFieldValue = (field: string) => {
    if (!apiTestData) return '';
    const parts = field.split('.');
    let value = apiTestData;
    for (const part of parts) {
      if (part.includes('[]')) {
        const key = part.replace('[]', '');
        if (key) value = value?.[key];
        if (Array.isArray(value) && value.length > 0) {
          value = value[0];
        }
      } else {
        value = value?.[part];
      }
      if (value === undefined) return '';
    }
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
          <h2 className="text-2xl font-bold text-white">Add New Widget</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Widget Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode('preset')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  mode === 'preset'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 bg-gray-700/30 hover:border-gray-600'
                }`}
              >
                <div className="text-white font-medium">Preset Widgets</div>
                <div className="text-xs text-gray-400 mt-1">Stock market widgets</div>
              </button>
              <button
                onClick={() => setMode('custom')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  mode === 'custom'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 bg-gray-700/30 hover:border-gray-600'
                }`}
              >
                <div className="text-white font-medium">Custom API</div>
                <div className="text-xs text-gray-400 mt-1">Connect any API</div>
              </button>
            </div>
          </div>

          {/* Widget Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Widget Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={mode === 'custom' ? 'e.g., Bitcoin Price' : getDefaultTitle(selectedType)}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {mode === 'preset' ? (
            <>
              {/* Preset Widget Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Widget Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['watchlist', 'table', 'chart', 'gainers'] as WidgetType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedType === type
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-700 bg-gray-700/30 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-white font-medium capitalize text-sm">{type}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preset Configuration */}
              {(selectedType === 'watchlist' || selectedType === 'table') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stock Symbols (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={symbols}
                    onChange={(e) => setSymbols(e.target.value)}
                    placeholder="AAPL,MSFT,GOOGL,AMZN"
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {selectedType === 'chart' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Stock Symbol
                    </label>
                    <input
                      type="text"
                      value={chartSymbol}
                      onChange={(e) => setChartSymbol(e.target.value.toUpperCase())}
                      placeholder="AAPL"
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Chart Interval
                    </label>
                    <select
                      value={chartInterval}
                      onChange={(e) => setChartInterval(e.target.value as any)}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* Custom API Configuration */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://api.coinbase.com/v2/exchange-rates?currency=BTC"
                    className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <Button
                    onClick={handleTestApi}
                    disabled={apiTestStatus === 'testing'}
                    variant="primary"
                  >
                    {apiTestStatus === 'testing' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Test'
                    )}
                  </Button>
                </div>
                {apiTestStatus !== 'idle' && (
                  <div className={`mt-2 p-3 rounded-lg flex items-start gap-2 ${
                    apiTestStatus === 'success' ? 'bg-green-500/10 border border-green-500/30' :
                    apiTestStatus === 'error' ? 'bg-red-500/10 border border-red-500/30' :
                    'bg-blue-500/10 border border-blue-500/30'
                  }`}>
                    {apiTestStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />}
                    {apiTestStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />}
                    {apiTestStatus === 'testing' && <Loader2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5 animate-spin" />}
                    <span className={`text-sm ${
                      apiTestStatus === 'success' ? 'text-green-300' :
                      apiTestStatus === 'error' ? 'text-red-300' :
                      'text-blue-300'
                    }`}>
                      {apiTestMessage}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Refresh Interval (seconds)
                  </label>
                  <input
                    type="number"
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(e.target.value)}
                    min="10"
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Mode
                  </label>
                  <select
                    value={displayMode}
                    onChange={(e) => setDisplayMode(e.target.value as DisplayMode)}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="card">Card</option>
                    <option value="table">Table</option>
                    <option value="list">List</option>
                  </select>
                </div>
              </div>

              {/* Field Selection */}
              {apiTestStatus === 'success' && availableFields.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Fields to Display
                  </label>
                  
                  {/* Search Fields */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search fields..."
                      value={fieldSearch}
                      onChange={(e) => setFieldSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Available Fields */}
                  <div className="border border-gray-600 rounded-lg overflow-hidden">
                    <div className="bg-gray-700/30 px-3 py-2 border-b border-gray-600">
                      <span className="text-xs text-gray-400 font-medium">Available Fields</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredFields.map((field, index) => {
                        const value = getFieldValue(field);
                        const isSelected = selectedFields.includes(field);
                        
                        return (
                          <button
                            key={index}
                            onClick={() => handleFieldToggle(field)}
                            className={`w-full text-left px-3 py-2 hover:bg-gray-700/50 transition-colors border-b border-gray-700/30 ${
                              isSelected ? 'bg-purple-500/10' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-white font-medium truncate">{field}</div>
                                {value && (
                                  <div className="text-xs text-gray-400 truncate mt-0.5">
                                    {value.length > 50 ? value.substring(0, 50) + '...' : value}
                                  </div>
                                )}
                              </div>
                              {isSelected && (
                                <CheckCircle className="w-4 h-4 text-purple-400 ml-2 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Fields */}
                  {selectedFields.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-400 font-medium mb-2">
                        Selected Fields ({selectedFields.length})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedFields.map((field, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-300"
                          >
                            <span>{field}</span>
                            <button
                              onClick={() => handleFieldToggle(field)}
                              className="hover:text-purple-100"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-700 sticky bottom-0 bg-gray-800">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleAdd} className="flex-1">
            <Plus className="w-4 h-4 mr-2" />
            Add Widget
          </Button>
        </div>
      </div>
    </div>
  );
};
