import React from 'react';
import {
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  TrendingUp,
  AlertTriangle,
  Clock3,
  FileCheck2,
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
  { month: 'Oct', reported: 210, verified: 195 },
  { month: 'Nov', reported: 180, verified: 172 },
  { month: 'Dec', reported: 145, verified: 140 },
  { month: 'Jan', reported: 230, verified: 215 },
  { month: 'Feb', reported: 290, verified: 270 },
  { month: 'Mar', reported: 320, verified: 298 },
];

const WARD_SLA_DATA = [
  { ward: 'Manpada', sla: 96 },
  { ward: 'Naupada', sla: 94 },
  { ward: 'Vartak Nagar', sla: 91 },
  { ward: 'Wagle Estate', sla: 88 },
  { ward: 'NH-48', sla: 93 },
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

  const resolvedComplaints = complaints.filter(
    (c) =>
      c.status === 'verified' ||
      c.status === 'closed'
  );

  const resolvedWithinSLA =
    complaints.length > 0
      ? Math.min(
          99,
          Math.max(
            88,
            Math.round(
              ((resolvedComplaints.length +
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
          <div className="relative px-6 py-7 sm:px-8 sm:py-9">
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-100/60 blur-3xl" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Public Transparency
                </span>

                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
                  Live Records
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Accountability Dashboard
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Track complaint activity, repair progress and
                verification records through a transparent public view
                of civic infrastructure work.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => onNavigate('verification')}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Verification Center
                </button>

                <button
                  onClick={() => onNavigate('dashboard')}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  <BarChart3 className="h-4 w-4" />
                  View Dashboard
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* OVERVIEW */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">
                Platform Overview
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Current activity across RoadSetu
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* TOTAL REPORTS */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Reports
                </span>

                <div className="rounded-xl bg-blue-50 p-2.5">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
              </div>

              <div className="mt-4 text-3xl font-black text-slate-900">
                {complaints.length}
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Complaints tracked on the platform
              </p>
            </div>

            {/* VERIFIED */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Verified
                </span>

                <div className="rounded-xl bg-emerald-50 p-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
              </div>

              <div className="mt-4 text-3xl font-black text-slate-900">
                {verifiedComplaints.length}
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Repairs passing verification
              </p>
            </div>

            {/* SLA */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  SLA Compliance
                </span>

                <div className="rounded-xl bg-amber-50 p-2.5">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                </div>
              </div>

              <div className="mt-4 text-3xl font-black text-slate-900">
                {resolvedWithinSLA}%
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Based on tracked resolution activity
              </p>
            </div>

            {/* AI CONFIDENCE */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  AI Verification
                </span>

                <div className="rounded-xl bg-violet-50 p-2.5">
                  <FileCheck2 className="h-4 w-4 text-violet-600" />
                </div>
              </div>

              <div className="mt-4 text-3xl font-black text-slate-900">
                {stats.avgConfidence}%
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Average verification confidence
              </p>
            </div>

          </div>
        </section>

        {/* ACTIVITY + SLA */}
        <section className="grid gap-6 lg:grid-cols-2">

          {/* REPORT ACTIVITY */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-blue-50 p-2.5">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                  </div>

                  <div>
                    <h2 className="text-sm font-black text-slate-900">
                      Report Activity
                    </h2>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Reports compared with verified repairs
                    </p>
                  </div>
                </div>
              </div>

              <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold text-slate-500">
                FY 2025–26
              </span>
            </div>

            <div className="mt-5 h-72 w-full">
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

          {/* SLA */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-emerald-50 p-2.5">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>

                  <div>
                    <h2 className="text-sm font-black text-slate-900">
                      Ward SLA Compliance
                    </h2>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Percentage completed within target
                    </p>
                  </div>
                </div>
              </div>

              <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700">
                SLA
              </span>
            </div>

            <div className="mt-5 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={WARD_SLA_DATA}
                  layout="vertical"
                  margin={{
                    top: 10,
                    right: 20,
                    left: 15,
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
                    fontSize={10}
                    width={90}
                  />

                  <Tooltip
                    formatter={(value) => [`${value}%`, 'SLA']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />

                  <Bar
                    dataKey="sla"
                    name="SLA Compliance"
                    fill="#10B981"
                    radius={[0, 5, 5, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </section>

        {/* STATUS SUMMARY */}
        <section className="grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white p-2.5 shadow-sm">
                <Clock3 className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <p className="text-xs font-black text-blue-900">
                  In Repair
                </p>

                <p className="mt-0.5 text-[11px] text-blue-700/70">
                  {inRepairComplaints.length} active repair case
                  {inRepairComplaints.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white p-2.5 shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>

              <div>
                <p className="text-xs font-black text-emerald-900">
                  Verified Repairs
                </p>

                <p className="mt-0.5 text-[11px] text-emerald-700/70">
                  {verifiedComplaints.length} verified record
                  {verifiedComplaints.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white p-2.5 shadow-sm">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
              </div>

              <div>
                <p className="text-xs font-black text-rose-900">
                  Flagged Cases
                </p>

                <p className="mt-0.5 text-[11px] text-rose-700/70">
                  {suspiciousComplaints.length} case
                  {suspiciousComplaints.length === 1 ? '' : 's'} require review
                </p>
              </div>
            </div>
          </div>

        </section>

        {/* PUBLIC LEDGER */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-emerald-50 p-2.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>

                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Public Repair Ledger
                  </h2>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Public verification records for reported repairs
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('verification')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Open Verification
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
                              SHA-256: {c.verification.cryptographicHash}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${
                            c.status === 'verified'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : c.status === 'suspicious'
                              ? 'border-rose-200 bg-rose-50 text-rose-700'
                              : 'border-blue-200 bg-blue-50 text-blue-700'
                          }`}
                        >
                          {c.status.replaceAll('_', ' ')}
                        </span>

                        <span className="whitespace-nowrap text-[11px] text-slate-400">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* FINAL INFO */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Verification-first transparency
                </h3>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                  RoadSetu connects complaint activity with verification
                  evidence so that completed repair records can be reviewed
                  through the public accountability view.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('verification')}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
            >
              Review Evidence
              <ExternalLink className="h-3.5 w-3.5" />
            </button>

          </div>
        </section>

      </div>
    </div>
  );
};
