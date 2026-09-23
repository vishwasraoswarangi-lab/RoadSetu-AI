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

  const [selectedPreviewComplaint, setSelectedPreviewComplaint] = useState(
    complaints[0] || {
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
        before:
          'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=60',
      },
      estimatedRepairDays: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">

      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)',
          backgroundSize: '70px 70px',
        }}
      />

      {/* Soft blue background glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-blue-100/60 blur-[120px]" />

      <div className="pointer-events-none absolute top-[500px] -left-40 h-[400px] w-[500px] rounded-full bg-yellow-100/50 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">

        {/* Top Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 shadow-sm">
            <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />

            <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Civic Infrastructure Accountability Engine
            </span>

            <span className="text-slate-300">|</span>

            <span className="text-xs font-medium text-emerald-600">
              Smart City Live Operations
            </span>
          </div>
        </div>

        {/* Hero */}
        <div className="mx-auto mt-8 max-w-4xl text-center">

          <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            Report it. Track it.{' '}
            <span className="text-blue-600">
              Verify it.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg font-normal leading-relaxed text-slate-600 sm:text-xl">
            Traditional municipal portals only log complaints.{' '}
            <strong className="font-semibold text-slate-900">
              RoadSetu AI
            </strong>{' '}
            uses computer vision, parallax geometry, and geotagged asset
            cross-referencing to cryptographically verify every road repair
            before municipal funds are disbursed.
          </p>

          <p className="mt-3 text-sm font-medium text-blue-600">
            “RoadSetu AI doesn’t just track repairs. It verifies them.”
          </p>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">

            <button
              onClick={() => onNavigate('report')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95"
            >
              <FilePlus className="h-4 w-4" />
              <span>Report a Pothole</span>
            </button>

            <button
              onClick={() => onNavigate('verification')}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-6 py-3 text-sm font-semibold text-blue-700 transition-all hover:bg-blue-100"
            >
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span>Explore AI Verification</span>
            </button>

            <button
              onClick={() => onNavigate('map')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:bg-slate-50"
            >
              <Compass className="h-4 w-4 text-blue-600" />
              <span>Live City Map</span>
            </button>

            <button
              onClick={() => onNavigate('accountability')}
              className="inline-flex items-center gap-2 rounded-xl border border-yellow-300 bg-yellow-50 px-5 py-3 text-sm font-semibold text-yellow-800 transition-all hover:bg-yellow-100"
            >
              <BarChart3 className="h-4 w-4 text-yellow-600" />
              <span>Public Accountability</span>
            </button>

          </div>
        </div>

        {/* Live Counters */}
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Reported
            </span>

            <div className="mt-2 font-mono text-3xl font-black text-slate-900 sm:text-4xl">
              {stats.totalReported.toLocaleString()}
            </div>

            <div className="mt-1 flex items-center text-xs text-blue-600">
              <span className="mr-1">●</span>
              Geotagged citizen submissions
            </div>
          </div>

          <div className="rounded-2xl border border-yellow-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Repairs Claimed
            </span>

            <div className="mt-2 font-mono text-3xl font-black text-slate-900 sm:text-4xl">
              {stats.totalRepaired.toLocaleString()}
            </div>

            <div className="mt-1 flex items-center text-xs text-yellow-700">
              <span className="mr-1">●</span>
              Contractor asphalt patches
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              AI-Verified Repairs
            </span>

            <div className="mt-2 font-mono text-3xl font-black text-slate-900 sm:text-4xl">
              {stats.totalVerified.toLocaleString()}
            </div>

            <div className="mt-1 flex items-center text-xs text-emerald-600">
              <span className="mr-1">●</span>
              Parallax & texture matched
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Verification Accuracy
            </span>

            <div className="mt-2 font-mono text-3xl font-black text-slate-900 sm:text-4xl">
              {stats.avgConfidence}%
            </div>

            <div className="mt-1 flex items-center text-xs text-blue-600">
              <span className="mr-1">●</span>
              Zero false contractor payouts
            </div>
          </div>

        </div>

        {/* Interactive Live City Map Preview */}
        <div className="mt-20">

          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600">
                <Compass className="h-4 w-4" />
                <span>Live Municipal Surveillance Grid</span>
              </div>

              <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                Active Smart Road Network Telemetry
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Real-time geotagged potholes with human-readable corridor mapping.
              </p>
            </div>

            <button
              onClick={() => onNavigate('map')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              <span>Launch Full Interactive Map</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

          </div>

          {/* Map Preview */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

              {/* Interactive Vector Road Canvas */}
              <div className="relative flex h-[360px] flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-4 lg:col-span-2">

                <svg
                  className="absolute inset-0 h-full w-full opacity-70"
                  viewBox="0 0 600 360"
                >

                  <defs>
                    <pattern
                      id="roadGrid"
                      width="40"
                      height="40"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="#CBD5E1"
                        strokeWidth="0.8"
                      />
                    </pattern>
                  </defs>

                  <rect
                    width="100%"
                    height="100%"
                    fill="url(#roadGrid)"
                  />

                  {/* Roads */}
                  <path
                    d="M 50 40 Q 220 180 550 140"
                    stroke="#2563EB"
                    strokeWidth="3.5"
                    fill="none"
                    strokeDasharray="6 3"
                  />

                  <path
                    d="M 120 320 C 260 220 340 120 480 50"
                    stroke="#16A34A"
                    strokeWidth="2.5"
                    fill="none"
                  />

                  <path
                    d="M 80 180 Q 300 240 520 280"
                    stroke="#0EA5E9"
                    strokeWidth="2"
                    fill="none"
                  />

                  {/* Complaint Nodes */}
                  {complaints.slice(0, 5).map((c, i) => {

                    const coords = [
                      { x: 180, y: 120 },
                      { x: 420, y: 145 },
                      { x: 260, y: 230 },
                      { x: 350, y: 90 },
                      { x: 130, y: 260 },
                    ][i] || { x: 200, y: 200 };

                    const isSelected =
                      selectedPreviewComplaint?.id === c.id;

                    const color =
                      c.status === 'verified'
                        ? '#16A34A'
                        : c.status === 'suspicious'
                        ? '#E11D48'
                        : c.severity === 'Critical'
                        ? '#DC2626'
                        : '#F59E0B';

                    return (
                      <g
                        key={c.id}
                        className="cursor-pointer transition-all"
                        onClick={() =>
                          setSelectedPreviewComplaint(c)
                        }
                      >

                        <circle
                          cx={coords.x}
                          cy={coords.y}
                          r={isSelected ? '14' : '9'}
                          fill={color}
                          opacity={isSelected ? '0.35' : '0.2'}
                        >
                          <animate
                            attributeName="r"
                            values={
                              isSelected
                                ? '10;18;10'
                                : '7;12;7'
                            }
                            dur="2.5s"
                            repeatCount="indefinite"
                          />
                        </circle>

                        <circle
                          cx={coords.x}
                          cy={coords.y}
                          r="5.5"
                          fill={color}
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />

                      </g>
                    );
                  })}

                </svg>

                {/* Map Overlay */}
                <div className="relative z-10 flex items-center justify-between">

                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>
                      Sector: Thane Metropolitan Corridor (SH-42)
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-blue-600">
                    Click any pulsating node to inspect
                  </div>

                </div>

                {/* Legend */}
                <div className="relative z-10 flex flex-wrap gap-2 text-[10px] text-slate-600">

                  <span className="flex items-center gap-1 rounded bg-white px-2 py-1 border border-slate-200 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span>Critical / Unresolved</span>
                  </span>

                  <span className="flex items-center gap-1 rounded bg-white px-2 py-1 border border-slate-200 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span>Under Repair</span>
                  </span>

                  <span className="flex items-center gap-1 rounded bg-white px-2 py-1 border border-slate-200 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span>AI-Verified</span>
                  </span>

                  <span className="flex items-center gap-1 rounded bg-white px-2 py-1 border border-slate-200 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span>Suspicious / Fraud Alert</span>
                  </span>

                </div>

              </div>

              {/* Inspector Card */}
              {selectedPreviewComplaint && (
                <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                  <div>

                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">

                      <span className="font-mono text-xs font-bold text-blue-600">
                        {selectedPreviewComplaint.id}
                      </span>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          selectedPreviewComplaint.status === 'verified'
                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                            : selectedPreviewComplaint.status === 'suspicious'
                            ? 'border border-rose-200 bg-rose-50 text-rose-700'
                            : 'border border-yellow-200 bg-yellow-50 text-yellow-700'
                        }`}
                      >
                        {selectedPreviewComplaint.status.replace('_', ' ')}
                      </span>

                    </div>

                    {/* Location */}
                    <div className="mt-3">

                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Location
                      </span>

                      <h4 className="mt-0.5 text-sm font-bold text-slate-900">
                        {selectedPreviewComplaint.location.road}
                      </h4>

                      {selectedPreviewComplaint.location.landmark && (
                        <p className="text-xs font-medium text-blue-600">
                          {selectedPreviewComplaint.location.landmark}
                        </p>
                      )}

                      <p className="text-xs text-slate-500">
                        {selectedPreviewComplaint.location.city},{' '}
                        {selectedPreviewComplaint.location.state}
                      </p>

                    </div>

                    {/* Hazard Score */}
                    <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2.5">

                      <div>
                        <span className="text-[10px] uppercase text-slate-500">
                          Civic Hazard
                        </span>

                        <p className="font-mono text-base font-bold text-rose-600">
                          {selectedPreviewComplaint.hazardScore}/100
                        </p>
                      </div>

                      <div className="text-right">

                        <span className="text-[10px] uppercase text-slate-500">
                          Priority
                        </span>

                        <p className="text-xs font-semibold text-yellow-700">
                          {selectedPreviewComplaint.priority}
                        </p>

                      </div>

                    </div>

                    <p className="mt-3 line-clamp-2 text-xs text-slate-600">
                      {selectedPreviewComplaint.description}
                    </p>

                  </div>

                  <div className="mt-4 flex gap-2 border-t border-slate-200 pt-3">

                    <button
                      onClick={() => onNavigate('verification')}
                      className="flex-1 rounded-lg border border-blue-200 bg-blue-50 py-2 text-center text-xs font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      Inspect Verification
                    </button>

                    <button
                      onClick={() => onNavigate('map')}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      Full Map
                    </button>

                  </div>

                </div>
              )}

            </div>
          </div>
        </div>

        {/* Civic Lifecycle */}
        <div className="mt-24">

          <div className="mx-auto mb-12 max-w-2xl text-center">

            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              End-to-End Civic Integrity Pipeline
            </span>

            <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
              From Citizen Report to Verified Payout
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Eliminating contractor ghost repairs and fake photo disbursements
              through 6 stages of verifiable truth.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">

            {[
              {
                step: '01',
                title: 'Citizen Report',
                desc: 'Citizen snaps crater photo. Reverse-geocoding extracts human road name + GPS signature.',
                color: 'text-blue-700',
                border: 'border-blue-200',
              },
              {
                step: '02',
                title: 'AI Analysis',
                desc: 'Computer vision calculates crater depth, dimensional volume, and P1-P3 severity.',
                color: 'text-blue-700',
                border: 'border-blue-200',
              },
              {
                step: '03',
                title: 'Smart Routing',
                desc: 'Dispatched to specific municipal zone engineer with auto SLA countdown clock.',
                color: 'text-yellow-700',
                border: 'border-yellow-200',
              },
              {
                step: '04',
                title: 'Contractor Fix',
                desc: 'Asphalt crew completes compaction & submits high-resolution post-repair evidence.',
                color: 'text-yellow-700',
                border: 'border-yellow-200',
              },
              {
                step: '05',
                title: 'AI Verification',
                desc: 'Cross-analyzes parallax angle, aggregate compaction, and landmark triangulation.',
                color: 'text-emerald-700',
                border: 'border-emerald-200',
              },
              {
                step: '06',
                title: 'Accountability',
                desc: 'Public dashboard logs audit trail. Contractor invoice approved only upon score > 85%.',
                color: 'text-blue-700',
                border: 'border-blue-200',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl border ${item.border} bg-white p-4 shadow-sm transition-shadow hover:shadow-md`}
              >

                <span className="font-mono text-xs font-bold text-slate-400">
                  {item.step}
                </span>

                <h4 className={`mt-2 text-sm font-bold ${item.color}`}>
                  {item.title}
                </h4>

                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  {item.desc}
                </p>

              </div>
            ))}

          </div>
        </div>

        {/* Fraud Prevention */}
        <div className="mt-20 rounded-2xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm sm:p-8">

          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">

            <div className="max-w-2xl space-y-2">

              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300 bg-white px-3 py-1 text-xs font-bold text-yellow-800">

                <AlertTriangle className="h-3.5 w-3.5 text-yellow-600" />

                <span>FRAUD ALERT PREVENTION CASE STUDY</span>

              </div>

              <h3 className="text-2xl font-bold text-slate-900">
                How RoadSetu AI Caught a ₹4.8 Lakh Contractor Fraud
              </h3>

              <p className="text-sm leading-relaxed text-slate-600">

                In complaint{' '}

                <code className="font-mono text-blue-600">
                  JS-PTH-2026-00389
                </code>
                , a contractor submitted a repair photo from{' '}

                <span className="font-semibold text-rose-600">
                  Eastern Express Highway
                </span>{' '}

                to claim payment for a pothole reported on{' '}

                <span className="font-semibold text-blue-600">
                  Ghodbunder Road
                </span>{' '}

                (7.8 km away). RoadSetu AI flagged the 48.2° parallax anomaly
                and landmark mismatch in 1.4 seconds.

              </p>

            </div>

            <button
              onClick={() => onNavigate('verification')}
              className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700"
            >
              Inspect Verification Engine
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
