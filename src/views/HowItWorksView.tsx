import React from 'react';
import {
  Cpu,
  Compass,
  Eye,
  Layers,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { NavView } from '../components/Navbar';

interface HowItWorksViewProps {
  onNavigate: (view: NavView) => void;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#0B0F17] p-4 sm:p-6 lg:p-8 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-300">
            <Cpu className="h-3.5 w-3.5" />
            <span>AI Multi-Spectral Parallax Architecture</span>
          </div>
          <h1 className="mt-3 text-3xl sm:text-5xl font-black text-white">
            How RoadSetu AI Verifies Road Repairs
          </h1>
          <p className="mt-4 text-base text-slate-300 leading-relaxed">
            In municipal road governance, millions of rupees are lost to "ghost repairs"—contractors submitting recycled photos of unrelated roads to claim public funds. RoadSetu AI solves this with 4 neural verification algorithms.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => onNavigate('verification')}
              className="rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-cyan-400 transition-colors"
            >
              Open AI Verification Center
            </button>
            <button
              onClick={() => onNavigate('map')}
              className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              View Live City Map
            </button>
          </div>
        </div>

        {/* 4 Pillars of Verification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-6 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              1. Spatial RTK & Azimuth Match
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every citizen and contractor photo contains hardware-level geolocation metadata and compass heading azimuth. RoadSetu AI validates that the contractor took the post-repair photo within &lt;1.5 meters of the original crater and within 15° of camera heading.
            </p>
            <div className="rounded-lg bg-slate-950 p-2.5 font-mono text-[11px] text-cyan-300">
              Tolerance: Δ &lt; 1.5m • Camera Azimuth Match: &gt;85%
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/80 p-6 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              2. Asphalt Texture & Compaction AI
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Convolutional filters examine aggregate granulation, bitumen density, and boundary compaction. The neural net detects whether fresh hot-mix asphalt was actually laid, distinguishing authentic roller compaction from superficial dirt fills.
            </p>
            <div className="rounded-lg bg-slate-950 p-2.5 font-mono text-[11px] text-emerald-300">
              Granular Bitumen Density Index: Pass &gt; 90%
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 p-6 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Eye className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              3. Perspective & Parallax Analysis
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Using epipolar geometry, the system reconstructs the 3D plane of the road surface. Kerb lines, road camber angles, and vanishing points must mathematically match the perspective of the initial reported crater.
            </p>
            <div className="rounded-lg bg-slate-950 p-2.5 font-mono text-[11px] text-amber-300">
              Epipolar Vanishing Point Congruence: &gt;88%
            </div>
          </div>

          <div className="rounded-2xl border border-teal-500/30 bg-slate-900/80 p-6 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              4. Surrounding Visual Anchor Points
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Feature-matching algorithms triangulate static surroundings: utility poles, tree trunks, shop signages, lane markings, and drainage grates. If the contractor photographs a different road, background anchor points fail immediately.
            </p>
            <div className="rounded-lg bg-slate-950 p-2.5 font-mono text-[11px] text-teal-300">
              Multi-Point Anchor Correlation: &gt;92%
            </div>
          </div>
        </div>

        {/* Anti-Fraud Flow Step by Step */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-bold text-white">
            Civic Payout Clearance Decision Logic
          </h2>

          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-start space-x-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-300 text-sm block">
                  Scenario A: Valid Repair (Composite Score &gt; 85%)
                </strong>
                <p className="mt-1 leading-relaxed">
                  GPS coordinates match within 0.9 meters, background distribution box and curb drainage triangulated, new bitumen compaction confirmed. Payment invoice is automatically approved for disbursal, and the complaint is permanently sealed on the public ledger.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-xl border border-rose-500/30 bg-rose-950/20 p-4">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-300 text-sm block">
                  Scenario B: Fraud Attempt Flagged (Composite Score &lt; 85%)
                </strong>
                <p className="mt-1 leading-relaxed">
                  Contractor uploads a photo taken 7.8 km away or reuses an old archive image. The parallax angle differs by 48.2°, zero anchor landmarks align, and the system flags a "CRITICAL FRAUD ALERT". The invoice is frozen, a municipal penalty strike is logged, and the complaint is escalated to the Chief City Engineer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
