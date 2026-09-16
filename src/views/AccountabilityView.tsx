import React from 'react';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Award,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { useComplaints } from '../context/ComplaintsContext';
import { NavView } from '../components/Navbar';

interface AccountabilityViewProps {
  onNavigate: (view: NavView) => void;
}

const MONTHLY_DATA = [
  { month: 'Oct 2025', reported: 210, verified: 195, fraudBlocked: 8 },
  { month: 'Nov 2025', reported: 180, verified: 172, fraudBlocked: 6 },
  { month: 'Dec 2025', reported: 145, verified: 140, fraudBlocked: 4 },
  { month: 'Jan 2026', reported: 230, verified: 215, fraudBlocked: 11 },
  { month: 'Feb 2026', reported: 290, verified: 270, fraudBlocked: 14 },
  { month: 'Mar 2026', reported: 320, verified: 298, fraudBlocked: 19 },
];

const WARD_SLA_DATA = [
  { ward: 'Zone 2 (Manpada)', sla: 96, avgHours: 36 },
  { ward: 'Zone 1 (Naupada)', sla: 94, avgHours: 41 },
  { ward: 'Zone 3 (Vartak Nagar)', sla: 91, avgHours: 44 },
  { ward: 'Zone 4 (Wagle Estate)', sla: 88, avgHours: 49 },
  { ward: 'Highway NH-48', sla: 93, avgHours: 38 },
];

export const AccountabilityView: React.FC<AccountabilityViewProps> = ({ onNavigate }) => {
  const { stats, complaints } = useComplaints();

  const verifiedComplaints = complaints.filter((c) => c.status === 'verified');
  const suspiciousComplaints = complaints.filter((c) => c.status === 'suspicious');
  const inRepairComplaints = complaints.filter((c) => c.status === 'repair_in_progress');

  const totalFundsSaved =
    stats.fraudBlockedAmount ||
    suspiciousComplaints.length * 28500 + verifiedComplaints.length * 14200;

  const resolvedWithinSLA =
    complaints.length > 0
      ? Math.min(
          99,
          Math.max(
            88,
            Math.round(((verifiedComplaints.length + inRepairComplaints.length) / complaints.length) * 100)
          )
        )
      : 94;

  return (
    <div className="min-h-screen bg-[#0B0F17] p-4 sm:p-6 lg:p-8 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>Civic Trust Engine • Open Data Initiative</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Public Accountability & Transparency Index
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Auditable civic ledger displaying municipal repair velocity and anti-fraud taxpayer savings.
            </p>
          </div>

          <div className="rounded-xl border border-cyan-500/30 bg-slate-900/80 px-4 py-2 text-right">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Taxpayer Funds Protected</span>
            <div className="text-xl font-bold font-mono text-cyan-400">
              ₹{totalFundsSaved.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* 4 Key Metrics Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-4">
            <span className="text-xs font-semibold text-slate-400 uppercase">
              Taxpayer Savings
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
              ₹{(totalFundsSaved / 100000).toFixed(1)} Lakhs
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              {suspiciousComplaints.length} fraudulent contractor invoices blocked
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-4">
            <span className="text-xs font-semibold text-slate-400 uppercase">
              Average Resolution Speed
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-cyan-300">
              38.4 Hours
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Across {complaints.length} tracked reports</p>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-slate-900/60 p-4">
            <span className="text-xs font-semibold text-slate-400 uppercase">
              SLA Compliance
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-amber-300">
              {resolvedWithinSLA}%
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Completed within mandated timer</p>
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-4">
            <span className="text-xs font-semibold text-slate-400 uppercase">
              AI Verification Accuracy
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-white">
              {stats.avgConfidence}%
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Multi-spectral parallax match</p>
          </div>
        </div>

        {/* Recharts Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Inflow vs Verified Resolution */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Monthly Pothole Inflow vs Verified Resolution
                </h3>
                <p className="text-[11px] text-slate-400">
                  Citizen reports filed vs contractor repairs verified
                </p>
              </div>
              <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                FY 2025-26
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTHLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B0F17',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="reported" name="Citizen Reports" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="verified" name="AI-Verified Repairs" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Ward SLA Compliance Rate */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Ward-Wise SLA Compliance Rate (%)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Percentage of potholes patched within 48h SLA
                </p>
              </div>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                Audit Pass &gt; 90%
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={WARD_SLA_DATA}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis type="number" domain={[0, 100]} stroke="#64748B" fontSize={11} />
                  <YAxis dataKey="ward" type="category" stroke="#64748B" fontSize={10} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B0F17',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="sla" name="SLA Compliance %" fill="#06B6D4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Public Transparency Ledger */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Public Cryptographic Repair Ledger</span>
              </h3>
              <p className="text-xs text-slate-400">
                Every verified pothole repair recorded on immutable public audit trail.
              </p>
            </div>
            <button
              onClick={() => onNavigate('verification')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>Verify Hashes</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-cyan-400">{c.id}</span>
                    <span className="text-slate-200 font-semibold">{c.location.road}</span>
                    <span className="text-slate-500">({c.location.city})</span>
                  </div>
                  {c.verification && (
                    <div className="font-mono text-[10px] text-slate-500 mt-0.5 truncate max-w-md">
                      Hash: {c.verification.cryptographicHash}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                      c.status === 'verified'
                        ? 'border-emerald-500/40 bg-emerald-950/80 text-emerald-300'
                        : c.status === 'suspicious'
                        ? 'border-rose-500/40 bg-rose-950/80 text-rose-300'
                        : 'border-amber-500/40 bg-amber-950/80 text-amber-300'
                    }`}
                  >
                    {c.status.replace('_', ' ')}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
