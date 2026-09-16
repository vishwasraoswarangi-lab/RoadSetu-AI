import React, { useState, useRef } from 'react';
import {
  Building2, Filter, Search, CheckCircle2, AlertTriangle, Clock, Truck, ShieldCheck,
  RefreshCw, ExternalLink, DollarSign, Award, Users, UploadCloud, FileCheck, Zap,
  BarChart3, SlidersHorizontal, ChevronRight, MapPin, Check, X, Camera,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { useComplaints } from '../context/ComplaintsContext';
import { useAuth } from '../context/AuthContext';
import { Complaint, ComplaintStatus } from '../types';
import { NavView } from '../components/Navbar';

interface MunicipalAdminViewProps {
  onNavigate: (view: NavView) => void;
  onSelectComplaintForVerification?: (complaint: Complaint) => void;
}

const DEFAULT_AFTER_REPAIRS = ['/assets/repaired_road_after.jpg', '/assets/road_patch_clean.jpg'];
const COLORS = ['#06B6D4', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6'];

export const MunicipalAdminView: React.FC<MunicipalAdminViewProps> = ({ onNavigate, onSelectComplaintForVerification }) => {
  const { complaints, updateComplaintStatus, stats } = useComplaints();
  const { user, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState<'triage' | 'verification' | 'analytics' | 'contractors'>('triage');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [evidenceModalComplaint, setEvidenceModalComplaint] = useState<Complaint | null>(null);
  const [evidenceImage, setEvidenceImage] = useState<string>(DEFAULT_AFTER_REPAIRS[0]);
  const [contractorName, setContractorName] = useState<string>('');
  const [repairNotes, setRepairNotes] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAuthority = user?.role === 'municipal_officer' || user?.role === 'admin' || user?.role === 'authority';
  const pendingTriageCount = complaints.filter(c => c.status === 'reported' || c.status === 'ai_analyzed').length;
  const inRepairCount = complaints.filter(c => c.status === 'repair_in_progress').length;
  const awaitingVerificationCount = complaints.filter(c => c.status === 'repair_claimed' || (c.status === 'repair_in_progress' && c.afterImage)).length;
  const verifiedCount = complaints.filter(c => c.status === 'verified').length;
  const suspiciousCount = complaints.filter(c => c.status === 'suspicious').length;
  const totalProtectedFunds = stats.fraudBlockedAmount || (suspiciousCount * 28500) + (verifiedCount * 14500);

  const filtered = complaints.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = c.id.toLowerCase().includes(q) || c.location.road.toLowerCase().includes(q) || c.department.toLowerCase().includes(q) || c.location.city.toLowerCase().includes(q);
    const matchesWard = selectedWard === 'all' || c.department.includes(selectedWard);
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
    return matchesSearch && matchesWard && matchesStatus;
  });

  const handleStatusUpdate = async (complaint: Complaint, status: ComplaintStatus) => {
    try {
      await updateComplaintStatus(complaint.id, status);
      showToast(`Report ${complaint.id} updated.`, 'success');
    } catch (error) {
      console.error('Status update failed:', error);
      showToast('Could not update this report.', 'error');
    }
  };

  if (!isAuthority) {
    return <div className="mx-auto max-w-3xl p-8 text-center"><ShieldCheck className="mx-auto mb-4 h-12 w-12 text-amber-400" /><h2 className="text-xl font-black text-white">Authority access required</h2><p className="mt-2 text-sm text-slate-400">Sign in with a provisioned municipal authority account to access this hub.</p><button onClick={() => onNavigate('dashboard')} className="mt-5 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950">Return to portal</button></div>;
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300"><Building2 className="h-3.5 w-3.5" />Authority Hub</div><h1 className="text-3xl font-black text-white">Municipal Operations</h1><p className="mt-1 text-sm text-slate-400">Live reports, repair workflow and verification queue.</p></div><button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-bold text-slate-200 hover:bg-white/5"><RefreshCw className="h-4 w-4" />Refresh</button></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[['Pending Triage', pendingTriageCount, Clock], ['In Repair', inRepairCount, Truck], ['Awaiting Verification', awaitingVerificationCount, FileCheck], ['Verified', verifiedCount, CheckCircle2], ['Protected Funds', `₹${Math.round(totalProtectedFunds).toLocaleString('en-IN')}`, ShieldCheck]].map(([label, value, Icon]: any) => <div key={String(label)} className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><Icon className="mb-3 h-5 w-5 text-cyan-300" /><div className="text-2xl font-black text-white">{value}</div><div className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</div></div>)}
      </div>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap gap-2"><button onClick={() => setActiveTab('triage')} className={`rounded-lg px-3 py-2 text-sm font-bold ${activeTab === 'triage' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:bg-white/5'}`}>Triage</button><button onClick={() => setActiveTab('verification')} className={`rounded-lg px-3 py-2 text-sm font-bold ${activeTab === 'verification' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:bg-white/5'}`}>Verification</button><button onClick={() => setActiveTab('analytics')} className={`rounded-lg px-3 py-2 text-sm font-bold ${activeTab === 'analytics' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:bg-white/5'}`}>Analytics</button><button onClick={() => setActiveTab('contractors')} className={`rounded-lg px-3 py-2 text-sm font-bold ${activeTab === 'contractors' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:bg-white/5'}`}>Contractors</button></div>
        {activeTab === 'triage' && <><div className="mb-4 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" /><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search live reports" className="w-full rounded-lg border border-white/10 bg-black/20 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-cyan-500/50" /></div><select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="rounded-lg border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white"><option value="all">All statuses</option>{['reported','ai_analyzed','routed','assigned','repair_in_progress','repair_claimed','verified','suspicious','closed'].map(s => <option key={s} value={s}>{s.replaceAll('_',' ')}</option>)}</select></div><div className="space-y-3">{filtered.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">No live reports match the filters.</div> : filtered.slice(0, 50).map(c => <div key={c.id} className="rounded-xl border border-white/10 bg-black/10 p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><div className="text-sm font-black text-white">{c.id}</div><div className="mt-1 text-sm text-slate-300">{c.location.formattedAddress || `${c.location.road}, ${c.location.city}`}</div><div className="mt-2 text-xs text-slate-500">{c.description}</div></div><div className="flex items-start gap-2"><span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold uppercase text-slate-300">{c.status.replaceAll('_',' ')}</span><button onClick={() => onSelectComplaintForVerification?.(c)} className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/5" title="Open verification"><ExternalLink className="h-4 w-4" /></button></div></div><div className="mt-3 flex flex-wrap gap-2">{c.status !== 'repair_in_progress' && c.status !== 'verified' && <button onClick={() => handleStatusUpdate(c, 'repair_in_progress')} className="rounded-lg bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-300">Mark in repair</button>}{c.status === 'repair_in_progress' && <button onClick={() => handleStatusUpdate(c, 'repair_claimed')} className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-300">Mark repair claimed</button>}</div></div>)}</div></>}
        {activeTab === 'verification' && <div className="rounded-xl border border-white/10 p-5"><h2 className="font-black text-white">Repair verification queue</h2><p className="mt-1 text-sm text-slate-400">Reports with claimed repairs can be opened in the verification center.</p><div className="mt-4 space-y-2">{complaints.filter(c => c.status === 'repair_claimed' || c.afterImage).map(c => <button key={c.id} onClick={() => onSelectComplaintForVerification?.(c)} className="flex w-full items-center justify-between rounded-lg bg-white/[0.03] p-3 text-left hover:bg-white/[0.06]"><span><span className="block text-sm font-bold text-white">{c.id}</span><span className="text-xs text-slate-500">{c.location.formattedAddress}</span></span><ChevronRight className="h-4 w-4 text-slate-500" /></button>)}</div></div>}
        {activeTab === 'analytics' && <div className="grid gap-5 lg:grid-cols-2"><div className="h-72 rounded-xl border border-white/10 p-4"><ResponsiveContainer width="100%" height="100%"><BarChart data={[{name:'Reported',value:pendingTriageCount},{name:'Repair',value:inRepairCount},{name:'Verified',value:verifiedCount},{name:'Suspicious',value:suspiciousCount}]}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" /></BarChart></ResponsiveContainer></div><div className="h-72 rounded-xl border border-white/10 p-4"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{name:'Pending',value:pendingTriageCount},{name:'Repair',value:inRepairCount},{name:'Verified',value:verifiedCount},{name:'Suspicious',value:suspiciousCount}]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label><Cell /> <Cell /> <Cell /> <Cell /></Pie></PieChart></ResponsiveContainer></div></div>}
        {activeTab === 'contractors' && <div className="rounded-xl border border-white/10 p-5"><h2 className="font-black text-white">Contractor workflow</h2><p className="mt-1 text-sm text-slate-400">Contractor evidence and payout decisions should be based on live repair records and verification results.</p></div>}
      </div>
      {evidenceModalComplaint && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111827] p-5"><button onClick={() => setEvidenceModalComplaint(null)} className="float-right text-slate-400"><X /></button><h3 className="font-black text-white">Repair evidence — {evidenceModalComplaint.id}</h3><p className="mt-2 text-sm text-slate-400">Upload a real post-repair image instead of selecting a demo asset.</p><input ref={fileInputRef} type="file" accept="image/*" className="mt-4 block w-full text-sm text-slate-300" onChange={e => { const f=e.target.files?.[0]; if(f){setEvidenceImage(URL.createObjectURL(f));}}} /><input value={contractorName} onChange={e=>setContractorName(e.target.value)} placeholder="Contractor name" className="mt-3 w-full rounded-lg border border-white/10 bg-black/20 p-2 text-sm text-white" /><textarea value={repairNotes} onChange={e=>setRepairNotes(e.target.value)} placeholder="Repair notes" className="mt-3 w-full rounded-lg border border-white/10 bg-black/20 p-2 text-sm text-white" /><button onClick={() => { setEvidenceModalComplaint(null); showToast('Evidence captured locally. Connect storage to persist the image.', 'info'); }} className="mt-4 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-black text-slate-950">Save evidence</button></div></div>}
    </div>
  );
};
