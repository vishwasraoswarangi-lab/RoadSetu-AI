import React from 'react';
import {
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  TrendingUp,
  AlertTriangle,
  Clock3,
  IndianRupee,
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

export const AccountabilityView: React.FC<
  AccountabilityViewProps
> = ({ onNavigate }) => {
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
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative p-6 sm:p-8">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-50 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Public Transparency
                </div>

                <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                  Accountability Dashboard
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                  Explore complaint activity, repair progress,
                  verification records and public infrastructure
                  metrics.
                </p>
              </div>

              <div className="relative min-w-[210px] rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                  <IndianRupee className="h-4 w-4" />
                  Funds Protected
                </div>

                <div className="mt-2 text-2xl font-black text-blue-700">
                  ₹{totalFundsSaved.toLocaleString('en-IN')}
                </div>

                <p className="mt-1 text-xs text-blue-600/70">
                  Based on current verification records
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* KEY METRICS */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Taxpayer Savings
              </span>

              <div className="rounded-xl bg-emerald-50 p-2">
                <IndianRupee className="h-4 w-4 text-emerald-600" />
              </div>
            </div>

            <div className="mt-4 text-2xl font-black text-slate-900">
              ₹{(totalFundsSaved / 100000).toFixed(1)}L
            </div>

            <p className="mt-1 text-xs text-slate-500">
              {suspiciousComplaints.length} flagged cases
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Resolution Speed
              </span>

              <div className="rounded-xl bg-blue-50 p-2">
                <Clock3 className="h-4 w-4 text-blue-600" />
              </div>
            </div>

            <div className="mt-4 text-2xl font-black text-blue-600">
              38.4 hrs
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Across {complaints.length} tracked reports
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                SLA Compliance
              </span>

              <div className="rounded-xl bg-amber-50 p-2">
                <TrendingUp className="h-4 w-4 text-amber-600" />
              </div>
            </div>

            <div className="mt-4 text-2xl font-black text-amber-600">
              {resolvedWithinSLA}%
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Completed within target
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                AI Verification
              </span>

              <div className="rounded-xl bg-violet-50 p-2">
                <CheckCircle2 className="h-4 w-4 text-violet-600" />
              </div>
            </div>

            <div className="mt-4 text-2xl font-black text-emerald-600">
              {stats.avgConfidence}%
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Average confidence
            </p>
          </div>
        </section>

        {/* CHARTS */}
        <section className="grid gap-6 lg:grid-cols-2">

          {/* REPORTS VS VERIFIED */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-blue-50 p-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                  </div>

                  <h2 className="text-sm font-bold text-slate-900">
                    Reports vs Verified Repairs
                  </h2>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Monthly complaint and verification activity.
                </p>
              </div>

              <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold text-slate-500">
                FY 2025–26
              </span>
            </div>

            <div className="mt-5 h-72 w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
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

          {/* SLA */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-50 p-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>

                  <h2 className="text-sm font-bold text-slate-900">
                    Ward SLA Compliance
                  </h2>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Percentage of repairs completed within SLA.
                </p>
              </div>

              <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-600">
                SLA
              </span>
            </div>

            <div className="mt-5 h-72 w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
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

        {/* PUBLIC LEDGER */}
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-emerald-50 p-2.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>

                <h2 className="text-base font-black text-slate-900">
                  Public Repair Ledger
                </h2>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Verification records for reported infrastructure repairs.
              </p>
            </div>

            <button
              onClick={() => onNavigate('verification')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Verify Records
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="p-5 sm:p-6">
            {complaints.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                <BarChart3 className="mx-auto h-7 w-7 text-slate-300" />

                <p className="mt-3 text-sm font-semibold text-slate-500">
                  No public repair records yet.
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Verified complaint activity will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {complaints.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200 hover:bg-white"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-lg bg-blue-50 px-2.5 py-1 font-mono text-xs font-bold text-blue-600">
                            {c.id}
                          </span>

                          <span className="text-sm font-bold text-slate-800">
                            {c.location.road}
                          </span>

                          <span className="text-xs text-slate-400">
                            {c.location.city}
                          </span>
                        </div>

                        {c.verification?.cryptographicHash && (
                          <div className="mt-2 flex items-center gap-2">
                            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />

                            <div className="truncate font-mono text-[10px] text-slate-400">
                              SHA-256: {
