'use client';

import React, { useState } from 'react';
import { useDashboardStore } from '@/lib/store/dashboardStore';
import { WatchlistWidget } from '@/components/widgets/WatchlistWidget';
import { MarketGainersWidget } from '@/components/widgets/MarketGainersWidget';
import { StockChartWidget } from '@/components/widgets/StockChartWidget';
import { StockTableWidget } from '@/components/widgets/StockTableWidget';
import { DynamicWidget } from '@/components/widgets/DynamicWidget';
import { AddWidgetModal } from '@/components/AddWidgetModal';
import { Button } from '@/components/ui/Button';
import { Plus, Moon, Sun, Download, Upload, Trash2 } from 'lucide-react';
import { Widget } from '@/types';

export const Dashboard: React.FC = () => {
  const { widgets, theme, addWidget, removeWidget, toggleTheme, exportConfig, importConfig, clearDashboard } = useDashboardStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleExport = () => {
    const config = exportConfig();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finboard-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const config = event.target?.result as string;
          importConfig(config);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const renderWidget = (widget: Widget) => {
    const commonProps = {
      onRemove: () => removeWidget(widget.id),
      onConfigure: () => {
        // TODO: Implement configuration modal
        console.log('Configure widget:', widget.id);
      },
    };

    switch (widget.type) {
      case 'watchlist':
        return (
          <WatchlistWidget
            key={widget.id}
            symbols={widget.config.symbols || []}
            {...commonProps}
          />
        );
      case 'gainers':
        return <MarketGainersWidget key={widget.id} {...commonProps} />;
      case 'chart':
        return (
          <StockChartWidget
            key={widget.id}
            symbol={widget.config.symbols?.[0] || 'AAPL'}
            interval={widget.config.chartInterval}
            {...commonProps}
          />
        );
      case 'table':
        return (
          <StockTableWidget
            key={widget.id}
            symbols={widget.config.symbols || []}
            {...commonProps}
          />
        );
      case 'custom':
        return (
          <DynamicWidget
            key={widget.id}
            title={widget.title}
            apiUrl={widget.config.apiEndpoint || ''}
            selectedFields={widget.config.displayFields || []}
            refreshInterval={widget.config.refreshInterval}
            displayMode={widget.config.displayMode || 'card'}
            {...commonProps}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-100 via-white to-gray-100'}`}>
      {/* Header */}
      <header className="border-b border-gray-700/50 bg-gray-800/30 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                FinBoard
              </h1>
              <p className="text-sm text-gray-400 mt-1">Your Customizable Finance Dashboard</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExport}
                title="Export Configuration"
              >
                <Download className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleImport}
                title="Import Configuration"
              >
                <Upload className="w-4 h-4" />
              </Button>
              
              {widgets.length > 0 && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all widgets?')) {
                      clearDashboard();
                    }
                  }}
                  title="Clear Dashboard"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Widget
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center">
                <Plus className="w-12 h-12 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">No Widgets Yet</h2>
              <p className="text-gray-400 max-w-md">
                Get started by adding your first widget to monitor stocks, view charts, and track market performance.
              </p>
              <Button onClick={() => setIsAddModalOpen(true)} size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Widget
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {widgets.map(renderWidget)}
            
            {/* Add Widget Placeholder Card */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="min-h-[300px] border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-200 flex flex-col items-center justify-center gap-4 group"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 group-hover:from-blue-500/30 group-hover:to-purple-600/30 flex items-center justify-center transition-all">
                <Plus className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                  Add Widget
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Click to add a new widget
                </p>
              </div>
            </button>
          </div>
        )}
      </main>

      {/* Add Widget Modal */}
      <AddWidgetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addWidget}
      />

      {/* Footer */}
      <footer className="border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-md mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 FinBoard. Built with Next.js, Tailwind CSS, and Zustand.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Powered by Finnhub API</span>
              <span>•</span>
              <span>{widgets.length} Active Widget{widgets.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
