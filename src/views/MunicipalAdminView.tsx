import React, { useState, useRef } from 'react';
import {
  Building2,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Truck,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  DollarSign,
  Award,
  Users,
  UploadCloud,
  FileCheck,
  Zap,
  BarChart3,
  SlidersHorizontal,
  ChevronRight,
  MapPin,
  Check,
  X,
  Camera,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useComplaints } from '../context/ComplaintsContext';
import { useAuth } from '../context/AuthContext';
import { Complaint, ComplaintStatus } from '../types';
import { NavView } from '../components/Navbar';

interface MunicipalAdminViewProps {
  onNavigate: (view: NavView) => void;
  onSelectComplaintForVerification?: (complaint: Complaint) => void;
}

const DEFAULT_AFTER_REPAIRS = [
  '/assets/repaired_road_after.jpg',
  '/assets/road_patch_clean.jpg',
];

const COLORS = ['#06B6D4', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6'];

export const MunicipalAdminView: React.FC<MunicipalAdminViewProps> = ({
  onNavigate,
  onSelectComplaintForVerification,
}) => {
  const { complaints, updateComplaintStatus, stats } = useComplaints();
  const { user, showToast, switchRole, loginAsDemo } = useAuth();

  const [activeTab, setActiveTab] = useState<'triage' | 'verification' | 'analytics' | 'contractors'>('triage');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Repair Evidence Upload Modal State
  const [evidenceModalComplaint, setEvidenceModalComplaint] = useState<Complaint | null>(null);
  const [evidenceImage, setEvidenceImage] = useState<string>(DEFAULT_AFTER_REPAIRS[0]);
  const [contractorName, setContractorName] = useState<string>('Thane Infrastructure Solutions (Jetpatcher #4)');
  const [repairNotes, setRepairNotes] = useState<string>('Hot-mix asphalt overlay applied with 10-ton vibrating roller compaction.');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAuthority = user?.role === 'municipal_officer' || user?.role === 'admin';

  // Dynamic calculations from live Firestore reports
  const pendingTriageCount = complaints.filter(
    (c) => c.status === 'reported' || c.status === 'ai_analyzed'
  ).length;
  const inRepairCount = complaints.filter((c) => c.status === 'repair_in_progress').length;
  const awaitingVerificationCount = complaints.filter(
    (c) => c.status === 'repair_claimed' || (c.status === 'repair_in_progress' && c.afterImage)
  ).length;
  const verifiedCount = complaints.filter((c) => c.status === 'verified').length;
  const suspiciousCount = complaints.filter((c) => c.status === 'suspicious').length;

  const totalProtectedFunds = stats.fraudBlockedAmount || (suspiciousCount * 28500) + (verifiedCount * 14500);

  // Filtered complaints for triage table
  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.road.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesWard = selectedWard === 'all' || c.department.includes(selectedWard);
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;

    return matchesSearch && matchesWard && matchesStatus;
  });

  const handleAction = async (complaintId: string, action: string) => {
    try {
      if (action === 'dispatch') {
        const res = await fetch('/api/authority/status-update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': user?.role || '',
          },
          body: JSON.stringify({ complaintId, newStatus: 'repair_in_progress' }),
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.error || '403 Forbidden: Authority credentials required.', 'error');
          return;
        }
        updateComplaintStatus(complaintId, 'repair_in_progress');
        showToast(`Pothole Jetpatcher Unit dispatched to ${complaintId}!`, 'success');
      } else if (action === 'reverify') {
        showToast(`AI Re-Verification pipeline triggered for ${complaintId}.`, 'info');
      } else if (action === 'approve') {
        const comp = complaints.find((c) => c.id === complaintId);
        const res = await fetch('/api/authority/disburse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': user?.role || '',
          },
          body: JSON.stringify({
            complaintId,
            verificationScore: comp?.verification?.overallScore || 92,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.error || '403 Forbidden: Authority credentials required to release escrow.', 'error');
          return;
        }
        updateComplaintStatus(complaintId, 'verified');
        showToast(`Payment disbursal approved! Tx: ${data.transactionHash?.slice(0, 10)}...`, 'success');
      } else if (action === 'fraud') {
        const res = await fetch('/api/authority/status-update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': user?.role || '',
          },
          body: JSON.stringify({ complaintId, newStatus: 'suspicious' }),
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.error || '403 Forbidden: Authority credentials required.', 'error');
          return;
        }
        updateComplaintStatus(complaintId, 'suspicious');
        showToast(`Contractor penalized with strike! Complaint marked Suspicious.`, 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Authority action failed', 'error');
    }
  };

  const handleStatusChange = (complaintId: string, newStatus: ComplaintStatus) => {
    updateComplaintStatus(complaintId, newStatus);
    showToast(`Status updated to ${newStatus.replace('_', ' ')}`, 'info');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidenceImage(reader.result as string);
        showToast('Repair photo attached successfully.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEvidence = () => {
    if (!evidenceModalComplaint) return;
    updateComplaintStatus(evidenceModalComplaint.id, 'repair_claimed', {
      afterImage: evidenceImage,
      contractorClaimed: true,
      description: `${evidenceModalComplaint.description}\n[Contractor Update]: ${repairNotes}`,
    });
    showToast(`Repair evidence attached for ${evidenceModalComplaint.id}. Ready for AI Verification.`, 'success');
    setEvidenceModalComplaint(null);
  };

  // Dynamic Chart Data from live reports
  const wardBreakdownMap: { [key: string]: number } = {};
  complaints.forEach((c) => {
    const key = c.department.replace('Municipal Road Engineering - ', '') || 'Zone 2';
    wardBreakdownMap[key] = (wardBreakdownMap[key] || 0) + 1;
  });
  const wardChartData = Object.keys(wardBreakdownMap).map((k) => ({
    ward: k,
    reports: wardBreakdownMap[k],
  }));

  const severityData = [
    { name: 'Critical', value: complaints.filter((c) => c.severity === 'Critical').length || 1 },
    { name: 'High', value: complaints.filter((c) => c.severity === 'High').length || 2 },
    { name: 'Medium', value: complaints.filter((c) => c.severity === 'Medium').length || 1 },
    { name: 'Low', value: complaints.filter((c) => c.severity === 'Low').length || 1 },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F17] p-4 sm:p-6 lg:p-8 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top RBAC Permission Banner */}
        {!isAuthority && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-950/30 p-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Authority Hub • Public Read-Only Audit Mode
                </div>
                <p className="text-xs text-slate-300">
                  You are viewing municipal operations as a Citizen. Switch to Authority to dispatch crews, upload repair evidence, or disburse funds.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => switchRole('municipal_officer')}
                className="flex items-center space-x-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow hover:bg-amber-400 transition-all"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Switch to Authority Persona</span>
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Building2 className="h-4 w-4" />
              <span>Municipal Operations Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Authority Hub: Road Triage & Disbursal Engine
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Supervise real-time incoming citizen reports, dispatch jetpatcher units, upload repair evidence, and clear verified contractor payments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAuthority && (
              <span className="inline-flex items-center space-x-1.5 rounded-full border border-amber-500/40 bg-amber-950/60 px-3 py-1.5 text-xs font-bold text-amber-300">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Executive Engineer (Zone 2)</span>
              </span>
            )}
            <span className="inline-flex items-center space-x-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-3 py-1.5 text-xs font-bold text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>{complaints.length} Total Reports Synced</span>
            </span>
          </div>
        </div>

        {/* 5 Key Metric Cards (Derived from live Firestore reports) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-rose-500/20 bg-slate-900/60 p-4 shadow">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-300">
              Pending Triage
            </span>
            <div className="mt-2 font-mono text-3xl font-bold text-rose-400">
              {pendingTriageCount}
            </div>
            <p className="mt-1 text-[10px] text-slate-400">Awaiting municipal review</p>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-slate-900/60 p-4 shadow">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
              Active Repairs
            </span>
            <div className="mt-2 font-mono text-3xl font-bold text-amber-400">
              {inRepairCount}
            </div>
            <p className="mt-1 text-[10px] text-slate-400">Jetpatcher crew dispatched</p>
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-4 shadow">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
              Awaiting Verification
            </span>
            <div className="mt-2 font-mono text-3xl font-bold text-cyan-400">
              {awaitingVerificationCount}
            </div>
            <p className="mt-1 text-[10px] text-slate-400">Repairs claimed by contractor</p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-4 shadow">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
              Verified & Disbursed
            </span>
            <div className="mt-2 font-mono text-3xl font-bold text-emerald-400">
              {verifiedCount}
            </div>
            <p className="mt-1 text-[10px] text-slate-400">AI parallax certified</p>
          </div>

          <div className="col-span-2 md:col-span-1 rounded-2xl border border-purple-500/20 bg-slate-900/60 p-4 shadow">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-300">
              Funds Protected
            </span>
            <div className="mt-2 font-mono text-2xl sm:text-3xl font-bold text-purple-300">
              ₹{(totalProtectedFunds / 100000).toFixed(1)}L
            </div>
            <p className="mt-1 text-[10px] text-slate-400">{suspiciousCount} fraud claims blocked</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('triage')}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'triage'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="h-3.5 w-3.5" />
            <span>Incoming Reports & Triage ({complaints.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'verification'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Verification Center ({awaitingVerificationCount} Claims)</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Municipal SLA & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('contractors')}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'contractors'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Contractor Governance & Escrow</span>
          </button>
        </div>

        {/* TAB 1: INCOMING REPORTS & TRIAGE */}
        {activeTab === 'triage' && (
          <div className="space-y-4">
            {/* Filters and Search Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search complaint, road, city, or zone..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="all">All Zones / Wards</option>
                  <option value="Zone 2">Zone 2 (Manpada / Majiwada)</option>
                  <option value="Zone 1">Zone 1 (Naupada / Kopri)</option>
                  <option value="Zone 3">Zone 3 (Vartak Nagar)</option>
                  <option value="Highway">Metropolitan Highway NH-48</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="reported">Pending Triage</option>
                  <option value="repair_in_progress">Crew Dispatched (In Progress)</option>
                  <option value="repair_claimed">Repair Claimed (Awaiting Verification)</option>
                  <option value="verified">Verified & Disbursed</option>
                  <option value="suspicious">Flagged Suspicious</option>
                </select>

                <button
                  onClick={() => onNavigate('report')}
                  className="flex items-center space-x-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30 transition-colors"
                >
                  <span>+ Test Report</span>
                </button>
              </div>
            </div>

            {/* Triage Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-3.5">Complaint & Location</th>
                      <th className="px-4 py-3.5">Defect / Hazard</th>
                      <th className="px-4 py-3.5">Status & SLA</th>
                      <th className="px-4 py-3.5">Evidence (Before / After)</th>
                      <th className="px-4 py-3.5">Status Control</th>
                      <th className="px-4 py-3.5 text-right">Municipal Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-slate-500 text-xs">
                          No reports match your selected filters.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                          {/* Complaint & Location */}
                          <td className="px-4 py-3.5">
                            <div className="font-mono font-bold text-cyan-400">{c.id}</div>
                            <div className="text-slate-100 font-medium">{c.location.road}</div>
                            <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                              <span>
                                {c.location.landmark ? `${c.location.landmark}, ` : ''}
                                {c.location.city}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Reporter: {c.userName || 'Citizen'} •{' '}
                              {new Date(c.createdAt).toLocaleDateString()}
                            </div>
                          </td>

                          {/* Defect / Hazard */}
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                c.severity === 'Critical'
                                  ? 'bg-rose-950/80 text-rose-400 border border-rose-500/40'
                                  : c.severity === 'High'
                                  ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                                  : 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/40'
                              }`}
                            >
                              {c.severity} ({c.hazardScore}/100)
                            </span>
                            <div className="text-[11px] text-slate-300 mt-1 font-medium">
                              {c.defectType || 'Pothole'}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">{c.priority}</div>
                          </td>

                          {/* Status & SLA */}
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                                c.status === 'verified'
                                  ? 'border-emerald-500/40 bg-emerald-950/80 text-emerald-300'
                                  : c.status === 'repair_in_progress'
                                  ? 'border-amber-500/40 bg-amber-950/80 text-amber-300'
                                  : c.status === 'repair_claimed'
                                  ? 'border-cyan-500/40 bg-cyan-950/80 text-cyan-300'
                                  : c.status === 'suspicious'
                                  ? 'border-rose-500/40 bg-rose-950/80 text-rose-300'
                                  : 'border-slate-600 bg-slate-800 text-slate-300'
                              }`}
                            >
                              <span>{c.status.replace('_', ' ')}</span>
                            </span>
                            <div className="flex items-center space-x-1 text-amber-300 font-mono text-[11px] mt-1.5">
                              <Clock className="h-3 w-3" />
                              <span>{c.estimatedRepairDays * 24}h SLA Timer</span>
                            </div>
                          </td>

                          {/* Evidence (Before / After Images) */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center space-x-2">
                              {/* Before Image */}
                              <div className="relative group">
                                <img
                                  src={c.beforeImage}
                                  alt="Before"
                                  className="h-10 w-10 rounded-lg object-cover border border-slate-700"
                                />
                                <span className="absolute -bottom-1 -right-1 rounded bg-slate-900 px-1 text-[8px] font-bold text-slate-400 border border-slate-700">
                                  BF
                                </span>
                              </div>

                              {/* After Image or Add Evidence */}
                              {c.afterImage ? (
                                <div className="relative group">
                                  <img
                                    src={c.afterImage}
                                    alt="After"
                                    className="h-10 w-10 rounded-lg object-cover border border-emerald-500/50"
                                  />
                                  <span className="absolute -bottom-1 -right-1 rounded bg-emerald-950 px-1 text-[8px] font-bold text-emerald-400 border border-emerald-500/40">
                                    AF
                                  </span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEvidenceModalComplaint(c);
                                    setEvidenceImage(DEFAULT_AFTER_REPAIRS[0]);
                                  }}
                                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-slate-700 hover:border-cyan-400 bg-slate-800/60 text-slate-400 hover:text-cyan-300 transition-colors"
                                  title="Attach Repair Evidence (After Photo)"
                                >
                                  <Camera className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Status Dropdown Control */}
                          <td className="px-4 py-3.5">
                            <select
                              value={c.status}
                              onChange={(e) =>
                                handleStatusChange(c.id, e.target.value as ComplaintStatus)
                              }
                              className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-cyan-500"
                            >
                              <option value="reported">Pending Triage</option>
                              <option value="repair_in_progress">Dispatched (In Progress)</option>
                              <option value="repair_claimed">Repair Claimed</option>
                              <option value="verified">Verified & Closed</option>
                              <option value="suspicious">Suspicious Fraud</option>
                            </select>
                          </td>

                          {/* Municipal Actions */}
                          <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                            {c.status === 'reported' && (
                              <button
                                onClick={() => handleAction(c.id, 'dispatch')}
                                className="rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/30"
                              >
                                Dispatch Crew
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setEvidenceModalComplaint(c);
                                setEvidenceImage(c.afterImage || DEFAULT_AFTER_REPAIRS[0]);
                              }}
                              className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:text-cyan-300 hover:border-cyan-500"
                            >
                              {c.afterImage ? 'Edit Evidence' : '+ After Photo'}
                            </button>

                            <button
                              onClick={() => {
                                if (onSelectComplaintForVerification) {
                                  onSelectComplaintForVerification(c);
                                }
                                onNavigate('verification');
                              }}
                              className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/30"
                            >
                              Verify AI
                            </button>

                            {c.verification?.status === 'suspicious' && (
                              <button
                                onClick={() => handleAction(c.id, 'fraud')}
                                className="rounded-lg bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/30"
                              >
                                Strike
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VERIFICATION CENTER OVERVIEW */}
        {activeTab === 'verification' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
                  AI Multi-Spectral Verification Engine
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  Parallax Visual Comparison & Invoice Clearance
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Inspect road defect repairs side-by-side using the visual parallax slider. Gemini AI computes asphalt texture continuity, edge compaction, and geotag matches before escrow release.
                </p>
              </div>

              <button
                onClick={() => onNavigate('verification')}
                className="flex items-center space-x-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow hover:bg-cyan-400 transition-all shrink-0"
              >
                <span>Open Full Verification Center</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {complaints.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                      <span className="font-mono text-xs font-bold text-cyan-400">{c.id}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase border ${
                          c.verification?.status === 'verified'
                            ? 'border-emerald-500/40 bg-emerald-950 text-emerald-300'
                            : c.verification?.status === 'suspicious'
                            ? 'border-rose-500/40 bg-rose-950 text-rose-300'
                            : 'border-slate-700 bg-slate-800 text-slate-400'
                        }`}
                      >
                        {c.verification?.status || 'Awaiting Verification'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Before (Damaged)</span>
                        <img
                          src={c.beforeImage}
                          alt="Before"
                          className="h-24 w-full rounded-lg object-cover border border-slate-800"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">After (Repaired)</span>
                        {c.afterImage ? (
                          <img
                            src={c.afterImage}
                            alt="After"
                            className="h-24 w-full rounded-lg object-cover border border-slate-800"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="h-24 w-full rounded-lg border border-dashed border-amber-500/30 bg-amber-950/20 flex flex-col items-center justify-center p-2 text-center">
                            <Clock className="h-4 w-4 text-amber-400 mb-1" />
                            <span className="text-[10px] font-medium text-amber-300">Awaiting post-repair evidence</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-xs font-medium text-slate-200 truncate">{c.location.road}</div>
                    <div className="text-[11px] text-slate-400">{c.location.city}</div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      {c.verification ? `${c.verification.overallScore}% AI Match` : 'Ready to verify'}
                    </span>
                    <button
                      onClick={() => {
                        if (onSelectComplaintForVerification) {
                          onSelectComplaintForVerification(c);
                        }
                        onNavigate('verification');
                      }}
                      className="rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-3 py-1 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30"
                    >
                      Inspect Parallax
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MUNICIPAL SLA & ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart: Ward-wise distribution */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
                <h3 className="text-sm font-bold text-white mb-1">
                  Active Complaints by Municipal Ward / Zone
                </h3>
                <p className="text-[11px] text-slate-400 mb-4">
                  Calculated dynamically from live citizen submissions
                </p>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={wardChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="ward" stroke="#64748B" fontSize={10} />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0B0F17',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          fontSize: '11px',
                        }}
                      />
                      <Bar dataKey="reports" name="Reports" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart: Severity Breakdown */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
                <h3 className="text-sm font-bold text-white mb-1">
                  Defect Severity Distribution
                </h3>
                <p className="text-[11px] text-slate-400 mb-4">
                  Categorized by AI Vision hazard scoring model
                </p>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {severityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0B0F17',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          fontSize: '11px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center space-x-4 text-xs">
                  {severityData.map((d, i) => (
                    <div key={d.name} className="flex items-center space-x-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-slate-300">{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CONTRACTOR GOVERNANCE */}
        {activeTab === 'contractors' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Thane Infrastructure Solutions
                  </span>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    Grade A Contractor
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-white">96.4% Pass Rate</div>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                  <span>384 Repairs Completed</span>
                  <span className="text-emerald-400">0 Fraud Strikes</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Apex Bitumen Infra Ltd
                  </span>
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                    Under Monitoring
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-amber-300">82.1% Pass Rate</div>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                  <span>192 Repairs Completed</span>
                  <span className="text-amber-400">1 Warning Issued</span>
                </div>
              </div>

              <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Metropolitan Highway Contractors
                  </span>
                  <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400">
                    SUSPENDED
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-rose-400">41.8% Pass Rate</div>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                  <span>54 Repairs Claimed</span>
                  <span className="text-rose-400 font-bold">2 Fraud Strikes (Blacklisted)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REPAIR EVIDENCE UPLOAD MODAL */}
        {evidenceModalComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700 bg-[#0E1524] shadow-2xl p-6 sm:p-8">
              <button
                onClick={() => setEvidenceModalComplaint(null)}
                className="absolute top-5 right-5 rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <Camera className="h-4 w-4" />
                <span>Upload Repair Evidence</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                Attach Repaired Road Photo for {evidenceModalComplaint.id}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {evidenceModalComplaint.location.road}, {evidenceModalComplaint.location.city}
              </p>

              <div className="mt-5 space-y-4">
                {/* Preview Image */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Repaired Surface Evidence (After Photo)
                  </label>
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-slate-700 bg-slate-900">
                    <img
                      src={evidenceImage}
                      alt="Repaired evidence preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-3 right-3 flex items-center space-x-1.5 rounded-xl bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950 shadow hover:bg-cyan-400"
                    >
                      <UploadCloud className="h-3.5 w-3.5" />
                      <span>Choose File</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Preset Quality Repair Images */}
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">
                    Or select pre-verified sample asphalt repair:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {DEFAULT_AFTER_REPAIRS.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEvidenceImage(img)}
                        className={`relative h-16 rounded-xl overflow-hidden border transition-all ${
                          evidenceImage === img
                            ? 'border-cyan-400 ring-2 ring-cyan-500/50'
                            : 'border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <img src={img} alt="sample" className="h-full w-full object-cover" />
                        {evidenceImage === img && (
                          <div className="absolute top-1 right-1 rounded-full bg-cyan-500 p-0.5 text-slate-950">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contractor Name */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Contractor Unit & Jetpatcher ID
                  </label>
                  <input
                    type="text"
                    value={contractorName}
                    onChange={(e) => setContractorName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 px-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                {/* Repair Notes */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Work Execution Notes
                  </label>
                  <textarea
                    rows={2}
                    value={repairNotes}
                    onChange={(e) => setRepairNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 px-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveEvidence}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 py-3 text-xs font-bold text-slate-950 shadow-lg hover:brightness-110 transition-all"
                >
                  Save Evidence & Mark Repair Claimed
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
