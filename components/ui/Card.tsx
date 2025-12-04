import React from 'react';
import { X, RefreshCw } from 'lucide-react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  onRemove?: () => void;
  onConfigure?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
  error?: string;
  lastUpdated?: Date;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  className = '',
  onRemove,
  onConfigure,
  onRefresh,
  loading,
  error,
  lastUpdated,
}) => {
  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-xl overflow-hidden ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50 bg-gray-800/30">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <div className="flex gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-1.5 hover:bg-gray-700/50 rounded-lg transition-colors"
                title="Refresh"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            {onConfigure && (
              <button
                onClick={onConfigure}
                className="p-1.5 hover:bg-gray-700/50 rounded-lg transition-colors"
                title="Configure"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
            {onRemove && (
              <button
                onClick={onRemove}
                className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                title="Remove"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            )}
          </div>
        </div>
      )}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-400 text-center py-8">
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          children
        )}
      </div>
      {lastUpdated && !loading && !error && (
        <div className="px-4 py-2 border-t border-gray-700/50 bg-gray-800/20">
          <p className="text-xs text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};
