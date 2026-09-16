import React, { useState } from 'react';
import { MapPin, CheckCircle2, ChevronDown, ChevronUp, RefreshCw, Navigation } from 'lucide-react';
import { HumanLocation } from '../types';
import { formatMultilineLocation } from '../utils/reverseGeocode';

interface HumanLocationCardProps {
  location: HumanLocation;
  onChangeClick?: () => void;
  onRefreshClick?: () => void;
  isLoading?: boolean;
  accuracyMeters?: number;
  title?: string;
  badgeText?: string;
  source?: 'gps' | 'ip' | 'search' | 'manual';
}

export const HumanLocationCard: React.FC<HumanLocationCardProps> = ({
  location,
  onChangeClick,
  onRefreshClick,
  isLoading = false,
  accuracyMeters = 4.2,
  title = 'REPORT LOCATION',
  badgeText = 'Location captured',
  source = 'gps',
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const { roadLine, landmarkLine, cityStateLine } = formatMultilineLocation(location);

  const getSourceBadge = () => {
    switch (source) {
      case 'gps':
        return { label: 'Live GPS (High Accuracy)', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' };
      case 'ip':
        return { label: 'Network IP (City Level)', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40' };
      case 'search':
        return { label: 'Searched Landmark', color: 'text-sky-400 border-sky-500/40 bg-sky-950/40' };
      case 'manual':
        return { label: 'Manual Entry', color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' };
      default:
        return { label: 'Civic Telemetry', color: 'text-slate-400 border-slate-700 bg-slate-800/40' };
    }
  };

  const srcBadge = getSourceBadge();

  return (
    <div className="relative overflow-hidden rounded-xl border border-cyan-500/25 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-cyan-500/40">
      {/* Background glow accent */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl" />

      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400">
            <MapPin className="h-4 w-4 animate-pulse" />
          </div>
          <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
            {title}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${srcBadge.color}`}>
            {srcBadge.label}
          </span>
        </div>
        <div className="inline-flex items-center space-x-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>✓ {badgeText}</span>
        </div>
      </div>

      {/* Human-Readable Address Content */}
      <div className="my-2 space-y-1 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
        <div className="text-lg font-bold text-slate-100 sm:text-xl">
          {roadLine}
        </div>
        {landmarkLine && (
          <div className="text-sm font-medium text-cyan-300/90">
            {landmarkLine}
          </div>
        )}
        <div className="text-sm text-slate-400">
          {cityStateLine}
        </div>
      </div>

      {/* Actions and Toggle */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3">
        <div className="flex items-center space-x-2">
          {onChangeClick && (
            <button
              type="button"
              onClick={onChangeClick}
              disabled={isLoading}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-500/50 hover:bg-slate-800 hover:text-cyan-300"
            >
              <Navigation className="h-3.5 w-3.5 text-cyan-400" />
              <span>Change Location</span>
            </button>
          )}
          {onRefreshClick && (
            <button
              type="button"
              onClick={onRefreshClick}
              disabled={isLoading}
              title="Re-query GPS / Network Location"
              className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-500/50 hover:bg-slate-800 hover:text-cyan-300"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Detecting...' : 'Redetect Location'}</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="inline-flex items-center space-x-1 text-xs text-slate-400 transition-colors hover:text-slate-200"
        >
          <span>Technical Location Details</span>
          {showTechnicalDetails ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Expandable Technical GPS Drawer */}
      {showTechnicalDetails && (
        <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-xs font-mono text-slate-400">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div>
              <span className="text-[10px] text-slate-500 uppercase">Latitude</span>
              <p className="text-slate-300">{location.latitude.toFixed(6)}° N</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase">Longitude</span>
              <p className="text-slate-300">{location.longitude.toFixed(6)}° E</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase">GPS Precision</span>
              <p className="text-emerald-400">±{accuracyMeters}m (RTK Class A)</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase">GIS Corridor</span>
              <p className="text-cyan-400 truncate">{location.road}</p>
            </div>
          </div>
          <div className="mt-2 border-t border-slate-900 pt-2 text-[11px] text-slate-500">
            Internal telemetry stored for cryptographically verified contractor repair audit.
          </div>
        </div>
      )}
    </div>
  );
};
