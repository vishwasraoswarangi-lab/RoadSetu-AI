import React, { useState } from 'react';
import {
  ShieldAlert,
  Compass,
  FilePlus,
  BarChart3,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  MapPin,
  Cpu,
  Layers,
  Search,
  Eye,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { NavView } from '../components/Navbar';
import { useComplaints } from '../context/ComplaintsContext';
import { useAuth } from '../context/AuthContext';

interface LandingViewProps {
  onNavigate: (view: NavView) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate }) => {
  const { stats, complaints } = useComplaints();
  const { user } = useAuth();
  const [selectedPreviewComplaint, setSelectedPreviewComplaint] = useState(complaints[0] || {
    id: 'KL-PTH-2026-00142',
    description: 'Deep hazardous trench crater on main carriageway.',
    severity: 'Critical',
    hazardScore: 92,
    priority: 'P1 - Immediate Intervention',
    department: 'Zone 2 PWD',
    status: 'repair_in_progress',
    location: {
      road: 'Ghodbunder Road Express Corridor',
      landmark: 'Opposite Suraj Water Park',
      city: 'Thane',
      state: 'Maharashtra',
      latitude: 19.2684,
      longitude: 72.9642,
    },
    images: {
      before: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=60',
    },
    estimatedRepairDays: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return (
    <div className="relative min-h-screen bg-[#0B0F17] text-slate-100 overflow-hidden">
      {/* Subtle glowing road grid background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#06B6D4 1px, transparent 1px), linear-gradient(to right, #06B6D4 1px, transparent 1px), linear-gradient(to bottom, #06B6D4 1px, transparent 1px)`,
          backgroundSize: '40px 40px, 80px 80px, 80px 80px',
        }}
      />

      {/* Hero ambient radial gradient */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute top-96 -left-32 h-[400px] w-[500px] rounded-full bg-teal-500/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
        {/* Top Tagline Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center space-x-2 rounded-full border border-cyan-500/30 bg-slate-900/80 px-4 py-1.5 shadow-lg shadow-cyan-950/50 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-semibold tracking-wide text-cyan-300 uppercase">
              Civic Infrastructure Accountability Engine
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-mono text-emerald-400">Smart City Live Operations</span>
          </div>
        </div>

        {/* Cinematic Headline & Subtitle */}
        <div className="mt-8 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight">
            Report it. Track it.{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Verify it.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Traditional municipal portals only log complaints. <strong className="text-white font-semibold">RoadSetu AI</strong> uses computer vision, parallax geometry, and geotagged asset cross-referencing to cryptographically verify every road repair before municipal funds are disbursed.
          </p>

          <p className="mt-2 text-sm font-mono text-cyan-400">
            “RoadSetu AI doesn’t just track repairs. It verifies them.”
          </p>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => onNavigate('report')}
              className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:brightness-110 active:scale-95"
            >
              <FilePlus className="h-4 w-4" />
              <span>Report a Pothole</span>
            </button>

            <button
              onClick={() => onNavigate('verification')}
              className="inline-flex items-center space-x-2 rounded-xl border border-cyan-500/40 bg-slate-900/80 px-6 py-3 text-sm font-semibold text-cyan-300 backdrop-blur-md transition-all hover:border-cyan-400 hover:bg-slate-800"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Explore AI Verification</span>
            </button>

            <button
              onClick={() => onNavigate('map')}
              className="inline-flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-900/60 px-5 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Compass className="h-4 w-4 text-slate-400" />
              <span>Live City Map</span>
            </button>

            <button
              onClick={() => onNavigate('accountability')}
              className="inline-flex items-center space-x-2 rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-5 py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-900/40"
            >
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              <span>Public Accountability</span>
            </button>
          </div>
        </div>

        {/* Live Counters */}
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-5 backdrop-blur-md">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Reported
            </span>
            <div className="mt-2 text-3xl sm:text-4xl font-black text-slate-100 font-mono">
              {stats.totalReported.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center text-xs text-cyan-400">
              <span className="mr-1">●</span> Geotagged citizen submissions
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-slate-900/60 p-5 backdrop-blur-md">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Repairs Claimed
            </span>
            <div className="mt-2 text-3xl sm:text-4xl font-black text-amber-300 font-mono">
              {stats.totalRepaired.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center text-xs text-amber-400/90">
              <span className="mr-1">●</span> Contractor asphalt patches
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-5 backdrop-blur-md">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              AI-Verified Repairs
            </span>
            <div className="mt-2 text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
              {stats.totalVerified.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center text-xs text-emerald-400/90">
              <span className="mr-1">●</span> Parallax & texture matched
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-5 backdrop-blur-md">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Verification Accuracy
            </span>
            <div className="mt-2 text-3xl sm:text-4xl font-black text-cyan-300 font-mono">
              {stats.avgConfidence}%
            </div>
            <div className="mt-1 flex items-center text-xs text-cyan-400/90">
              <span className="mr-1">●</span> Zero false contractor payouts
            </div>
          </div>
        </div>

        {/* Interactive Live City Map Preview Section */}
        <div className="mt-20">
          <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                <Compass className="h-4 w-4" />
                <span>Live Municipal Surveillance Grid</span>
              </div>
              <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                Active Smart Road Network Telemetry
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time geotagged potholes with human-readable corridor mapping.
              </p>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              <span>Launch Full Interactive Map</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Map Preview Canvas */}
          <div className="relative rounded-2xl border border-cyan-500/30 bg-slate-950/90 p-4 shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Interactive Vector Road Canvas */}
              <div className="lg:col-span-2 relative h-[360px] rounded-xl border border-slate-800 bg-[#070A10] p-4 overflow-hidden flex flex-col justify-between">
                {/* SVG Smart Road Network Map */}
                <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 600 360">
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="roadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#roadGrid)" />

                  {/* Arterial Highway vectors (Ghodbunder Road, Eastern Express, Pokhran) */}
                  <path
                    d="M 50 40 Q 220 180 550 140"
                    stroke="#0284C7"
                    strokeWidth="3.5"
                    fill="none"
                    strokeDasharray="6 3"
                  />
                  <path
                    d="M 120 320 C 260 220 340 120 480 50"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  <path
                    d="M 80 180 Q 300 240 520 280"
                    stroke="#06B6D4"
                    strokeWidth="2"
                    fill="none"
                  />

                  {/* Nodes & connection vectors */}
                  {complaints.slice(0, 5).map((c, i) => {
                    const coords = [
                      { x: 180, y: 120 },
                      { x: 420, y: 145 },
                      { x: 260, y: 230 },
                      { x: 350, y: 90 },
                      { x: 130, y: 260 },
                    ][i] || { x: 200, y: 200 };

                    const isSelected = selectedPreviewComplaint?.id === c.id;
                    const color =
                      c.status === 'verified'
                        ? '#10B981'
                        : c.status === 'suspicious'
                        ? '#F43F5E'
                        : c.severity === 'Critical'
                        ? '#EF4444'
                        : '#F59E0B';

                    return (
                      <g
                        key={c.id}
                        className="cursor-pointer transition-all"
                        onClick={() => setSelectedPreviewComplaint(c)}
                      >
                        {/* Pulse Ring */}
                        <circle
                          cx={coords.x}
                          cy={coords.y}
                          r={isSelected ? '14' : '9'}
                          fill={color}
                          opacity={isSelected ? '0.35' : '0.2'}
                        >
                          <animate
                            attributeName="r"
                            values={isSelected ? '10;18;10' : '7;12;7'}
                            dur="2.5s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        {/* Center Pin */}
                        <circle
                          cx={coords.x}
                          cy={coords.y}
                          r="5.5"
                          fill={color}
                          stroke="#0B0F17"
                          strokeWidth="2"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Map Overlay Controls */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-2 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Sector: Thane Metropolitan Corridor (SH-42)</span>
                  </div>
                  <div className="text-[11px] font-mono text-cyan-400">
                    Click any pulsating node to inspect
                  </div>
                </div>

                {/* Bottom Legend */}
                <div className="relative z-10 flex flex-wrap gap-2 text-[10px] text-slate-400">
                  <span className="flex items-center space-x-1 rounded bg-slate-900/80 px-2 py-1 border border-slate-800">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span>Critical / Unresolved</span>
                  </span>
                  <span className="flex items-center space-x-1 rounded bg-slate-900/80 px-2 py-1 border border-slate-800">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Under Repair</span>
                  </span>
                  <span className="flex items-center space-x-1 rounded bg-slate-900/80 px-2 py-1 border border-slate-800">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>AI-Verified</span>
                  </span>
                  <span className="flex items-center space-x-1 rounded bg-slate-900/80 px-2 py-1 border border-slate-800">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span>Suspicious / Fraud Alert</span>
                  </span>
                </div>
              </div>

              {/* Node Inspector Preview Card (HUMAN-READABLE LOCATION) */}
              {selectedPreviewComplaint && (
                <div className="flex flex-col justify-between rounded-xl border border-cyan-500/25 bg-slate-900/90 p-4">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        {selectedPreviewComplaint.id}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          selectedPreviewComplaint.status === 'verified'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                            : selectedPreviewComplaint.status === 'suspicious'
                            ? 'bg-rose-950/80 text-rose-400 border border-rose-500/40'
                            : 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                        }`}
                      >
                        {selectedPreviewComplaint.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Human-Readable Address Display */}
                    <div className="mt-3">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Location
                      </span>
                      <h4 className="text-sm font-bold text-slate-100 mt-0.5">
                        {selectedPreviewComplaint.location.road}
                      </h4>
                      {selectedPreviewComplaint.location.landmark && (
                        <p className="text-xs text-cyan-300 font-medium">
                          {selectedPreviewComplaint.location.landmark}
                        </p>
                      )}
                      <p className="text-xs text-slate-400">
                        {selectedPreviewComplaint.location.city}, {selectedPreviewComplaint.location.state}
                      </p>
                    </div>

                    {/* Hazard score */}
                    <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase">Civic Hazard</span>
                        <p className="text-base font-mono font-bold text-rose-400">
                          {selectedPreviewComplaint.hazardScore}/100
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase">Priority</span>
                        <p className="text-xs font-semibold text-amber-300">
                          {selectedPreviewComplaint.priority}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-slate-300 line-clamp-2">
                      {selectedPreviewComplaint.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
                    <button
                      onClick={() => onNavigate('verification')}
                      className="flex-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 py-2 text-center text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30"
                    >
                      Inspect Verification
                    </button>
                    <button
                      onClick={() => onNavigate('map')}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200 hover:text-white"
                    >
                      Full Map
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Civic Lifecycle Flow Diagram */}
        <div className="mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              End-to-End Civic Integrity Pipeline
            </span>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              From Citizen Report to Verified Payout
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Eliminating contractor ghost repairs and fake photo disbursements through 6 stages of verifiable truth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                step: '01',
                title: 'Citizen Report',
                desc: 'Citizen snaps crater photo. Reverse-geocoding extracts human road name + GPS signature.',
                color: 'text-cyan-400',
                border: 'border-cyan-500/30',
              },
              {
                step: '02',
                title: 'AI Analysis',
                desc: 'Computer vision calculates crater depth, dimensional volume, and P1-P3 severity.',
                color: 'text-cyan-300',
                border: 'border-cyan-500/30',
              },
              {
                step: '03',
                title: 'Smart Routing',
                desc: 'Dispatched to specific municipal zone engineer with auto SLA countdown clock.',
                color: 'text-amber-400',
                border: 'border-amber-500/30',
              },
              {
                step: '04',
                title: 'Contractor Fix',
                desc: 'Asphalt crew completes compaction & submits high-resolution post-repair evidence.',
                color: 'text-amber-300',
                border: 'border-amber-500/30',
              },
              {
                step: '05',
                title: 'AI Verification',
                desc: 'Cross-analyzes parallax angle, aggregate compaction, and landmark triangulation.',
                color: 'text-emerald-400',
                border: 'border-emerald-500/40',
              },
              {
                step: '06',
                title: 'Accountability',
                desc: 'Public dashboard logs audit trail. Contractor invoice approved only upon score > 85%.',
                color: 'text-teal-300',
                border: 'border-teal-500/30',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl border ${item.border} bg-slate-900/60 p-4 backdrop-blur-sm`}
              >
                <span className="font-mono text-xs font-bold text-slate-500">{item.step}</span>
                <h4 className={`mt-2 text-sm font-bold ${item.color}`}>{item.title}</h4>
                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fraud Prevention Spotlight */}
        <div className="mt-20 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/30 via-slate-900/60 to-cyan-950/30 p-6 sm:p-8 backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-2 rounded-full border border-rose-500/40 bg-rose-950/60 px-3 py-1 text-xs font-bold text-rose-300">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                <span>FRAUD ALERT PREVENTION CASE STUDY</span>
              </div>
              <h3 className="text-2xl font-bold text-white">
                How RoadSetu AI Caught a ₹4.8 Lakh Contractor Fraud
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                In complaint <code className="text-cyan-300 font-mono">JS-PTH-2026-00389</code>, a contractor submitted a repair photo from <span className="text-rose-400 font-semibold">Eastern Express Highway</span> to claim payment for a pothole reported on <span className="text-cyan-400 font-semibold">Ghodbunder Road</span> (7.8 km away). RoadSetu AI flagged the 48.2° parallax anomaly and landmark mismatch in 1.4 seconds.
              </p>
            </div>

            <button
              onClick={() => onNavigate('verification')}
              className="shrink-0 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-5 py-3 text-xs font-bold text-slate-950 shadow-lg hover:brightness-110"
            >
              Inspect Verification Engine
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
