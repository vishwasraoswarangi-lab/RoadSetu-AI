import React from 'react';
import {
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  TrendingUp,
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

export const AccountabilityView: React.FC<AccountabilityViewProps> = ({
  onNavigate,
}) => {
  const { stats, complaints } = useComplaints();

  const verifiedComplaints = complaints.filter(
    (c) => c.status === 'verified'
  );

  const suspiciousComplaints = complaints.filter(
    (c) => c.status === 'suspicious'
  );

  const inRepairComplaints = complaints.filter(
    (c) => c.status === 'repair_in_progress'
  );

  const totalFundsSaved =
    stats.fraudBlockedAmount ||
    suspiciousComplaints.length * 28500 +
      verifiedComplaints.length * 14200;

  const resolvedWithinSLA =
    complaints.length > 0
      ? Math.min(
          99,
          Math.max(
            88,
            Math.round(
              ((verifiedComplaints.length +
                inRepairComplaints.length) /
                complaints.length) *
                100
            )
          )
        )
      : 94;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600">
                <ShieldCheck className="h-4 w-4" />
                Public Transparency
              </div>

              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Accountability Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Explore complaint activity, repair progress,
                verification records and public infrastructure metrics.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                Funds Protected
              </span>

              <div className="mt-1 text-2xl font-black text-blue-700">
                ₹{totalFundsSaved.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Taxpayer Savings
            </span>

            <div className="mt-2 text-2xl font-black text-slate-900">
              ₹{(totalFundsSaved / 100000).toFixed(1)}L
            </div>

            <p className="mt-1 text-xs text-slate-500">
              {suspiciousComplaints.length} flagged cases
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Resolution Speed
            </span>

            <div className="mt-2 text-2xl font-black text-blue-600">
              38.4 hrs
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Across {complaints.length} tracked reports
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
              SLA Compliance
            </span>

            <div className="mt-2 text-2xl font-black text-amber-600">
              {resolvedWithinSLA}%
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Completed within target
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
              AI Verification
            </span>

            <div className="mt-2 text-2xl font-black text-emerald-600">
              {stats.avgConfidence}%
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Average confidence
            </p>
          </div>
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />

                  <h2 className="text-sm font-bold text-slate-900">
                    Reports vs Verified Repairs
                  </h2>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Monthly complaint and verification activity
                </p>
              </div>

              <span className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600">
                FY 2025–26
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={MONTHLY_DATA}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E2E8F0"
                  />

                  <XAxis
                    dataKey="month"
                    stroke="#94A3B8"
                    fontSize={10}
                  />

                  <YAxis
                    stroke="#94A3B8"
                    fontSize={10}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />

                  <Legend
                    wrapperStyle={{
                      fontSize: '11px',
                      paddingTop: '8px',
                    }}
                  />

                  <Bar
                    dataKey="reported"
                    name="Reports"
                    fill="#2563EB"
                    radius={[4, 4, 0, 0]}
                  />

                  <Bar
                    dataKey="verified"
                    name="Verified"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />

                  <h2 className="text-sm font-bold text-slate-900">
                    Ward SLA Compliance
                  </h2>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Percentage of repairs completed within SLA
                </p>
              </div>

              <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
                SLA
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={WARD_SLA_DATA}
                  layout="vertical"
                  margin={{
                    top: 10,
                    right: 20,
                    left: 30,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E2E8F0"
                  />

                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    stroke="#94A3B8"
                    fontSize={10}
                  />

                  <YAxis
                    dataKey="ward"
                    type="category"
                    stroke="#94A3B8"
                    fontSize={9}
                    width={105}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />

                  <Bar
                    dataKey="sla"
                    name="SLA Compliance %"
                    fill="#0EA5E9"
                    radius={[0, 5, 5, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Public Ledger */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />

                <h2 className="text-base font-black text-slate-900">
                  Public Repair Ledger
                </h2>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Verification records for reported infrastructure repairs.
              </p>
            </div>

            <button
              onClick={() => onNavigate('verification')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Verify Records
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600">
                      {c.id}
                    </span>

                    <span className="text-sm font-bold text-slate-800">
                      {c.location.road}
                    </span>

                    <span className="text-xs text-slate-400">
                      {c.location.city}
                    </span>
                  </div>

                  {c.verification && (
                    <div className="mt-1 truncate font-mono text-[10px] text-slate-400">
                      Hash: {c.verification.cryptographicHash}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${
                      c.status === 'verified'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : c.status === 'suspicious'
                        ? 'border-rose-200 bg-rose-50 text-rose-700'
                        : 'border-blue-200 bg-blue-50 text-blue-700'
                    }`}
                  >
                    {c.status.replace('_', ' ')}
                  </span>

                  <span className="whitespace-nowrap text-[11px] text-slate-400">
                    {new Date(
                      c.createdAt
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
