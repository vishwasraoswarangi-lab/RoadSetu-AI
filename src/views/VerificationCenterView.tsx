import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Cpu,
  Layers,
  MapPin,
  Download,
  Copy,
  Check,
  Sliders,
  Compass,
  FileCheck,
  Lock,
  Eye,
  Upload,
  Loader2,
  ChevronDown,
  XCircle,
  HelpCircle,
  RefreshCw,
  Sparkles,
  Ban,
  DollarSign,
  AlertOctagon,
  Clock,
} from 'lucide-react';
import { useComplaints } from '../context/ComplaintsContext';
import { Complaint, VerificationResult } from '../types';
import { NavView } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { runMultiStageVerification } from '../lib/verificationEngine';

interface VerificationCenterViewProps {
  onNavigate: (view: NavView) => void;
  selectedComplaintId?: string | null;
}

// Preset evidence images for testing verification scenarios
const TEST_SCENARIOS = [
  {
    id: 'test-cake',
    label: 'Test 1: Unrelated Cake / Food (Scenario 1)',
    badge: 'Expected: REJECTED',
    badgeColor: 'text-rose-400 border-rose-500/40 bg-rose-950/40',
    description: 'A dessert/cake image submitted as repair evidence.',
    afterUrl: 'https://images.unsplash.com/photo-1578985545062-699281a80e14?auto=format&fit=crop&w=1000&q=80',
    notes: 'Contractor uploaded celebration cake image.',
  },
  {
    id: 'test-indoor',
    label: 'Test 2: Living Room / Furniture (Scenario 2)',
    badge: 'Expected: REJECTED',
    badgeColor: 'text-rose-400 border-rose-500/40 bg-rose-950/40',
    description: 'Indoor living room couch photo.',
    afterUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80',
    notes: 'Contractor submitted interior domestic photo.',
  },
  {
    id: 'test-mismatched-road',
    label: 'Test 3: Mismatched Street (Scenario 3)',
    badge: 'Expected: SUSPICIOUS',
    badgeColor: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
    description: 'Different rural dirt path with mismatched kerbs and coordinates.',
    afterUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1000&q=80',
    notes: 'Repair claimed on a different highway segment.',
  },
  {
    id: 'test-valid-asphalt',
    label: 'Test 4: Genuine Compacted Asphalt (Scenario 4)',
    badge: 'Expected: VERIFIED',
    badgeColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
    description: 'Fresh smooth bitumen hot-mix patch at the same road segment.',
    afterUrl: '/assets/repaired_road_after.jpg',
    notes: 'Surface re-paved and compacted with 40mm bituminous concrete overlay.',
  },
];

export const VerificationCenterView: React.FC<VerificationCenterViewProps> = ({
  onNavigate,
  selectedComplaintId,
}) => {
  const { complaints, getComplaintById, updateComplaintStatus } = useComplaints();
  const { user, showToast } = useAuth();

  // Find targeted complaint or fallback to first available
  const initialComplaint =
    (selectedComplaintId && getComplaintById(selectedComplaintId)) ||
    complaints.find((c) => c.verification || c.afterImage) ||
    complaints[0];

  const [activeComplaint, setActiveComplaint] = useState<Complaint | undefined>(initialComplaint);
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [isCopiedHash, setIsCopiedHash] = useState(false);
  const [isSimulatingAuditExport, setIsSimulatingAuditExport] = useState(false);

  // After-image and audit state
  const [currentAfterImage, setCurrentAfterImage] = useState<string>(
    activeComplaint?.afterImage || ''
  );
  const [repairNotes, setRepairNotes] = useState<string>(activeComplaint?.contractorNotes || '');
  const [isVerifyingWithAi, setIsVerifyingWithAi] = useState(false);
  const [activeVerification, setActiveVerification] = useState<VerificationResult | null>(
    activeComplaint?.verification || null
  );
  const afterFileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if active complaint changes
  useEffect(() => {
    if (selectedComplaintId) {
      const found = getComplaintById(selectedComplaintId);
      if (found) {
        setActiveComplaint(found);
        setCurrentAfterImage(found.afterImage || '');
        setActiveVerification(found.verification || null);
        setRepairNotes(found.contractorNotes || '');
      }
    } else if (!activeComplaint && complaints.length > 0) {
      setActiveComplaint(complaints[0]);
      setCurrentAfterImage(complaints[0].afterImage || '');
      setActiveVerification(complaints[0].verification || null);
    }
  }, [selectedComplaintId, complaints]);

  if (!activeComplaint) {
    return (
      <div className="min-h-screen bg-[#0B0F17] p-8 text-slate-100 flex items-center justify-center">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center max-w-md">
          <ShieldCheck className="h-12 w-12 text-cyan-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white">No Complaints Available</h2>
          <p className="text-xs text-slate-400 mt-2">
            Submit a road defect report first to test multi-stage repair verification.
          </p>
          <button
            onClick={() => onNavigate('report')}
            className="mt-5 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400"
          >
            Report a Road Defect
          </button>
        </div>
      </div>
    );
  }

  // File upload handler
  const handleAfterImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCurrentAfterImage(result);
      setActiveVerification(null);
      showToast('Custom repair image loaded. Click "Run 5-Stage AI Audit" to evaluate.', 'info');
    };
    reader.readAsDataURL(file);
  };

  // Run the multi-stage verification pipeline
  const executeVerification = async (imageToVerify: string, notes = repairNotes) => {
    if (!imageToVerify) {
      showToast('Please select or upload an after-repair image first.', 'error');
      return;
    }

    setIsVerifyingWithAi(true);
    try {
      const result = await runMultiStageVerification({
        complaint: activeComplaint,
        afterImage: imageToVerify,
        contractorNotes: notes,
      });

      setActiveVerification(result);

      // Save result to complaint in context & Firestore
      const newStatus =
        result.status === 'verified'
          ? 'verified'
          : result.status === 'rejected'
          ? 'suspicious'
          : 'repair_claimed';

      await updateComplaintStatus(activeComplaint.id, newStatus, {
        afterImage: imageToVerify,
        contractorNotes: notes,
        verification: result,
      });

      setActiveComplaint((prev) =>
        prev
          ? {
              ...prev,
              afterImage: imageToVerify,
              contractorNotes: notes,
              status: newStatus,
              verification: result,
            }
          : undefined
      );

      if (result.status === 'verified') {
        showToast('VERIFIED: Repair confirmed authentic! Disbursal cleared.', 'success');
      } else if (result.status === 'rejected') {
        showToast(
          `REJECTED: ${result.rejectionReason || 'Semantic mismatch detected.'}`,
          'error'
        );
      } else {
        showToast('AUDIT FLAGGED: Inconclusive repair evidence. Flagged for review.', 'info');
      }
    } catch (err) {
      console.error('Verification error:', err);
      showToast('Verification pipeline error. Please retry.', 'error');
    } finally {
      setIsVerifyingWithAi(false);
    }
  };

  // Preset scenario selector
  const handleSelectScenario = (scenario: (typeof TEST_SCENARIOS)[0]) => {
    setCurrentAfterImage(scenario.afterUrl);
    setRepairNotes(scenario.notes);
    executeVerification(scenario.afterUrl, scenario.notes);
  };

  // Identical image test
  const handleTestIdenticalImage = () => {
    if (!activeComplaint.beforeImage) return;
    setCurrentAfterImage(activeComplaint.beforeImage);
    setRepairNotes('Contractor resubmitted identical before photo.');
    executeVerification(activeComplaint.beforeImage, 'Contractor resubmitted identical before photo.');
  };

  // Audit Certificate PDF export
  const handleExportCertificate = () => {
    setIsSimulatingAuditExport(true);
    setTimeout(() => {
      setIsSimulatingAuditExport(false);
      showToast(`Audit Certificate generated: RoadSetu-Audit-${activeComplaint.id}.pdf`, 'success');
    }, 1200);
  };

  // Copy hash
  const handleCopyHash = () => {
    if (!activeVerification?.cryptographicHash) return;
    navigator.clipboard.writeText(activeVerification.cryptographicHash);
    setIsCopiedHash(true);
    showToast('Cryptographic SHA-256 hash copied to clipboard.', 'success');
    setTimeout(() => setIsCopiedHash(false), 2500);
  };

  const isVerified = activeVerification?.status === 'verified';
  const isRejected = activeVerification?.status === 'rejected';
  const isComparisonValid = activeVerification ? activeVerification.isComparisonValid !== false : true;
  const hasAfterImage = Boolean(currentAfterImage);

  return (
    <div className="min-h-screen bg-[#0B0F17] p-4 sm:p-6 lg:p-8 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Multi-Stage Forensic Visual Audit Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
              AI Repair Verification Center
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict multi-gate visual & environmental audit comparing citizen defect telemetry against contractor completion claims.
            </p>
          </div>

          {/* Complaint Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Select Report:</span>
            <div className="relative">
              <select
                value={activeComplaint.id}
                onChange={(e) => {
                  const found = getComplaintById(e.target.value);
                  if (found) {
                    setActiveComplaint(found);
                    setCurrentAfterImage(found.afterImage || '');
                    setActiveVerification(found.verification || null);
                    setRepairNotes(found.contractorNotes || '');
                  }
                }}
                className="appearance-none rounded-xl border border-slate-700 bg-slate-900 py-2 pl-3 pr-8 text-xs font-bold text-cyan-300 focus:border-cyan-500 focus:outline-none"
              >
                {complaints.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.id} - {c.location.road} ({c.status})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Selected Complaint Overview Strip */}
        <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold text-cyan-400 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30">
              {activeComplaint.id}
            </span>
            <div>
              <div className="text-sm font-bold text-white flex items-center space-x-2">
                <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                <span>{activeComplaint.location.road}</span>
                {activeComplaint.location.landmark && (
                  <span className="text-xs text-slate-400 font-normal">
                    ({activeComplaint.location.landmark})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {activeComplaint.location.city} • Defect:{' '}
                <strong className="text-slate-200">{activeComplaint.defectType}</strong> • Severity:{' '}
                <strong className="text-rose-300">{activeComplaint.severity}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase border ${
                isVerified
                  ? 'border-emerald-500/40 bg-emerald-950/80 text-emerald-300'
                  : isRejected
                  ? 'border-rose-500/40 bg-rose-950/80 text-rose-300'
                  : activeVerification
                  ? 'border-amber-500/40 bg-amber-950/80 text-amber-300'
                  : 'border-slate-700 bg-slate-800 text-slate-400'
              }`}
            >
              {isVerified
                ? 'VERIFIED: VALID REPAIR'
                : isRejected
                ? 'REJECTED: INVALID REPAIR'
                : activeVerification
                ? 'SUSPICIOUS / NEEDS REVIEW'
                : 'AWAITING REPAIR EVIDENCE'}
            </span>

            {activeVerification && (
              <button
                onClick={handleExportCertificate}
                disabled={isSimulatingAuditExport}
                className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-cyan-400" />
                <span>{isSimulatingAuditExport ? 'Generating PDF...' : 'Export Audit PDF'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Acceptance Test Scenario Bar */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase text-white tracking-wider">
                Interactive Acceptance Testing Console (Run Test Scenarios)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Click any scenario below to immediately test the multi-stage verification pipeline:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {TEST_SCENARIOS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectScenario(s)}
                disabled={isVerifyingWithAi}
                className="flex flex-col text-left p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-cyan-500/50 hover:bg-slate-900 transition-all group"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                    {s.label.split('(')[0]}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block w-fit mb-1 ${s.badgeColor}`}
                >
                  {s.badge}
                </span>
                <span className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                  {s.description}
                </span>
              </button>
            ))}

            {/* Test 5: Identical Image Fraud */}
            <button
              type="button"
              onClick={handleTestIdenticalImage}
              disabled={isVerifyingWithAi}
              className="flex flex-col text-left p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-cyan-500/50 hover:bg-slate-900 transition-all group"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                  Test 5: Identical Defect
                </span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block w-fit mb-1 text-rose-400 border-rose-500/40 bg-rose-950/40">
                Expected: REJECTED (0%)
              </span>
              <span className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                Contractor submits identical damaged pothole photo.
              </span>
            </button>
          </div>
        </div>

        {/* Upload Custom Evidence Drawer */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Upload className="h-4 w-4 text-cyan-400" />
              <span>Or Upload Custom Repair Photo</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Upload any image to test the gatekeeper classifier (cake, living room, or road patch).
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-5">
              <input
                type="file"
                ref={afterFileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleAfterImageUpload}
              />
              <button
                type="button"
                onClick={() => afterFileInputRef.current?.click()}
                className="w-full flex items-center justify-center space-x-2 rounded-xl border border-dashed border-cyan-500/40 bg-slate-950 p-2.5 text-center hover:bg-slate-900 transition-colors"
              >
                <Upload className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-semibold text-cyan-300">
                  {currentAfterImage ? 'Choose Different File' : 'Upload Post-Repair Photo'}
                </span>
              </button>
            </div>

            <div className="sm:col-span-4">
              <input
                type="text"
                value={repairNotes}
                onChange={(e) => setRepairNotes(e.target.value)}
                placeholder="Contractor repair execution notes..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              >
              </input>
            </div>

            <div className="sm:col-span-3">
              <button
                type="button"
                onClick={() => executeVerification(currentAfterImage)}
                disabled={!currentAfterImage || isVerifyingWithAi}
                className="w-full rounded-xl bg-cyan-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 flex items-center justify-center space-x-2 transition-colors shadow-md shadow-cyan-500/20"
              >
                {isVerifyingWithAi ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Executing 5-Stage Audit...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Run 5-Stage AI Audit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* COMPARISON INVALID WARNING BANNER (Shows when image is not a road, e.g. cake) */}
        {!isComparisonValid && activeVerification && (
          <div className="rounded-2xl border-2 border-rose-500 bg-rose-950/40 p-4 text-rose-200 space-y-2 shadow-2xl">
            <div className="flex items-center space-x-2">
              <AlertOctagon className="h-5 w-5 text-rose-400 shrink-0" />
              <span className="text-sm font-black uppercase text-rose-300 tracking-wider">
                COMPARISON INVALID: IMAGE MISMATCH DETECTED
              </span>
            </div>
            <p className="text-xs text-rose-200 leading-relaxed font-medium">
              {activeVerification.rejectionReason ||
                'The post-repair photo does not depict municipal road infrastructure. AI verification has failed and contractor payout is strictly locked.'}
            </p>
            {activeVerification.fraudFlags && activeVerification.fraudFlags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeVerification.fraudFlags.map((flag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 rounded bg-rose-900/80 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30"
                  >
                    <Ban className="h-3 w-3" />
                    <span>{flag}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Split Comparison Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Layers className="h-4 w-4 text-cyan-400" />
                <span>Visual Audit Comparison</span>
              </span>

              {hasAfterImage && (
                <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-1 text-xs">
                  <button
                    onClick={() => setViewMode('slider')}
                    className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      viewMode === 'slider' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Split Slider
                  </button>
                  <button
                    onClick={() => setViewMode('side-by-side')}
                    className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      viewMode === 'side-by-side' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Side-by-Side
                  </button>
                </div>
              )}
            </div>

            {!hasAfterImage ? (
              // Empty State: Awaiting Repair Image
              <div className="h-[380px] sm:h-[440px] w-full rounded-2xl border border-dashed border-amber-500/30 bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-amber-950/40 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Clock className="h-8 w-8 text-amber-400" />
                </div>
                <div className="max-w-md">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-2">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Awaiting Post-Repair Evidence</span>
                  </div>
                  <h3 className="text-base font-bold text-white">No Repair Photo Uploaded Yet</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Contractor has not attached post-repair evidence for this road segment. Both the defect image and legitimate repair evidence are required for multi-stage visual verification.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    onClick={() => handleSelectScenario(TEST_SCENARIOS[0])}
                    className="rounded-xl border border-rose-500/40 bg-rose-950/30 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-900/40"
                  >
                    Test 1: Cake (Mismatch)
                  </button>
                  <button
                    onClick={() => handleSelectScenario(TEST_SCENARIOS[3])}
                    className="rounded-xl bg-cyan-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
                  >
                    Test 4: Genuine Road Patch
                  </button>
                </div>
              </div>
            ) : viewMode === 'slider' ? (
              <div className="relative h-[380px] sm:h-[440px] w-full select-none overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
                {/* AFTER Image (Background - Post-Repair Claim) */}
                <img
                  src={currentAfterImage}
                  alt="Post-repair claim"
                  className="absolute inset-0 h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* AFTER Label */}
                <div
                  className={`absolute top-4 right-4 z-10 rounded-lg border px-3 py-1 text-xs font-bold backdrop-blur-md shadow-lg flex items-center space-x-1.5 ${
                    !isComparisonValid
                      ? 'border-rose-500/60 bg-rose-950/90 text-rose-300'
                      : isVerified
                      ? 'border-emerald-500/40 bg-slate-950/85 text-emerald-400'
                      : 'border-amber-500/40 bg-slate-950/85 text-amber-400'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      !isComparisonValid ? 'bg-rose-400 animate-ping' : isVerified ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  ></span>
                  <span>
                    {!isComparisonValid ? 'POST-REPAIR CLAIM (NON-ROAD DETECTED)' : 'POST-REPAIR CLAIM'}
                  </span>
                </div>

                {/* BEFORE Image (Clipped Overlay - Original Defect) */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <img
                    src={activeComplaint.beforeImage}
                    alt="Original reported road crater defect"
                    className="absolute inset-0 h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 z-10 rounded-lg border border-rose-500/40 bg-slate-950/85 px-3 py-1 text-xs font-bold text-rose-400 backdrop-blur-md shadow-lg flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-400"></span>
                    <span>ORIGINAL DEFECT (REPORTED ROAD)</span>
                  </div>
                </div>

                {/* Draggable Divider Line */}
                <div
                  className="absolute inset-y-0 z-20 w-1 bg-cyan-400 shadow-[0_0_15px_#06B6D4] pointer-events-none"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400 text-slate-950 shadow-xl ring-4 ring-cyan-500/30">
                    <span className="text-xs font-black">↔</span>
                  </div>
                </div>

                {/* Interactive Range Input */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="absolute inset-0 z-30 opacity-0 cursor-ew-resize w-full h-full"
                  aria-label="Drag to compare before and after repair"
                />

                {/* Bottom Bar Info */}
                <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs backdrop-blur-md">
                  <div className="text-slate-300">
                    <span className="text-cyan-400 font-mono font-bold">{sliderPosition}%</span>{' '}
                    <span className="text-slate-400">split • Slide to inspect transition</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-300 flex items-center space-x-1">
                    {!isComparisonValid ? (
                      <span className="text-rose-400 font-bold flex items-center space-x-1">
                        <AlertOctagon className="h-3.5 w-3.5" />
                        <span>Semantic Disparity</span>
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold flex items-center space-x-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Multi-Spectral Alignment Active</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Side by side view
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-[380px] sm:h-[440px]">
                <div className="relative rounded-2xl border border-rose-500/30 overflow-hidden bg-slate-950">
                  <img
                    src={activeComplaint.beforeImage}
                    alt="Original reported road crater defect"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 rounded-lg bg-slate-950/85 px-2.5 py-1 text-xs font-bold text-rose-400 border border-rose-500/40 flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-400"></span>
                    <span>ORIGINAL DEFECT (ROAD)</span>
                  </div>
                </div>

                <div
                  className={`relative rounded-2xl overflow-hidden bg-slate-950 border ${
                    !isComparisonValid ? 'border-rose-500' : 'border-emerald-500/30'
                  }`}
                >
                  <img
                    src={currentAfterImage}
                    alt="Post-repair claim"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div
                    className={`absolute top-3 right-3 rounded-lg px-2.5 py-1 text-xs font-bold border flex items-center space-x-1.5 ${
                      !isComparisonValid
                        ? 'bg-rose-950/90 text-rose-300 border-rose-500'
                        : 'bg-slate-950/85 text-emerald-400 border-emerald-500/40'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        !isComparisonValid ? 'bg-rose-400' : 'bg-emerald-400'
                      }`}
                    ></span>
                    <span>
                      {!isComparisonValid ? 'POST-REPAIR CLAIM (INVALID)' : 'POST-REPAIR CLAIM'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Score, 5 Verification Stages & Disbursal */}
          <div className="lg:col-span-5 space-y-4">
            {/* Score Card */}
            <div
              className={`rounded-2xl border p-5 shadow-2xl backdrop-blur-md ${
                !activeVerification
                  ? 'border-slate-800 bg-slate-900/80'
                  : isVerified
                  ? 'border-emerald-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30'
                  : 'border-rose-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  AI Forensic Verification Score
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase border ${
                    !activeVerification
                      ? 'border-slate-700 bg-slate-800 text-slate-400'
                      : isVerified
                      ? 'border-emerald-500/50 bg-emerald-950/80 text-emerald-300'
                      : 'border-rose-500/50 bg-rose-950/80 text-rose-300'
                  }`}
                >
                  {!activeVerification ? 'NOT ANALYZED' : isVerified ? 'VERIFIED' : 'REJECTED / SUSPICIOUS'}
                </span>
              </div>

              <div className="mt-4 flex items-baseline space-x-3">
                <span
                  className={`font-mono text-5xl font-black ${
                    !activeVerification
                      ? 'text-slate-500 text-3xl'
                      : isVerified
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {!activeVerification ? 'N/A' : `${activeVerification.overallScore}%`}
                </span>
                <span className="text-xs text-slate-400">
                  {!activeVerification
                    ? 'Awaiting After Image Upload'
                    : isVerified
                    ? 'Verified Authentic Repair (>80%)'
                    : 'Disqualification Threshold Triggered (<50%)'}
                </span>
              </div>

              {activeVerification && (
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full transition-all duration-700 ${
                      isVerified ? 'bg-emerald-400' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.max(activeVerification.overallScore, 4)}%` }}
                  />
                </div>
              )}

              {/* Payout Status Banner */}
              <div className="mt-4 border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400">Contractor Escrow Disbursal:</span>
                <span
                  className={`font-bold ${
                    isVerified ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isVerified ? '✓ Cleared for Disbursal (₹45,000)' : '✕ Disbursal Frozen (₹0 Cleared)'}
                </span>
              </div>
            </div>

            {/* 5-STAGE FORENSIC AUDIT BREAKDOWN */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
                <span>5-Stage Verification Pipeline</span>
                <span className="text-[10px] text-slate-500 font-normal">Strict Gated Audit</span>
              </div>

              {activeVerification?.stages ? (
                <>
                  {/* Stage 1: Validity Check */}
                  <div
                    className={`rounded-xl border p-3 text-xs transition-colors ${
                      activeVerification.stages.validity.passed
                        ? 'border-slate-800 bg-slate-900/80'
                        : 'border-rose-500/40 bg-rose-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-200 flex items-center space-x-2">
                        {activeVerification.stages.validity.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-400" />
                        )}
                        <span>Stage 1: Image Validity & Format</span>
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          activeVerification.stages.validity.passed ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {activeVerification.stages.validity.score}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-6">
                      {activeVerification.stages.validity.details}
                    </p>
                  </div>

                  {/* Stage 2: Semantic & Scene Consistency (CRITICAL GATEKEEPER) */}
                  <div
                    className={`rounded-xl border p-3 text-xs transition-colors ${
                      activeVerification.stages.semanticConsistency.passed
                        ? 'border-slate-800 bg-slate-900/80'
                        : 'border-rose-500/60 bg-rose-950/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-200 flex items-center space-x-2">
                        {activeVerification.stages.semanticConsistency.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-400" />
                        )}
                        <span>Stage 2: Semantic & Scene Consistency</span>
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          activeVerification.stages.semanticConsistency.passed
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {activeVerification.stages.semanticConsistency.score}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 pl-6">
                      {activeVerification.stages.semanticConsistency.details}
                    </p>
                    {activeVerification.stages.semanticConsistency.detectedScene2 && (
                      <div className="mt-1.5 pl-6 flex items-center space-x-2 text-[10px]">
                        <span className="text-slate-400">Classified as:</span>
                        <span
                          className={`font-mono px-2 py-0.5 rounded border ${
                            activeVerification.stages.semanticConsistency.passed
                              ? 'text-emerald-300 bg-emerald-950/60 border-emerald-500/40'
                              : 'text-rose-300 bg-rose-950/60 border-rose-500/40'
                          }`}
                        >
                          {activeVerification.stages.semanticConsistency.detectedScene2}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Stage 3: Location & Spatial Environment */}
                  <div
                    className={`rounded-xl border p-3 text-xs transition-colors ${
                      activeVerification.stages.locationEnvironment.passed
                        ? 'border-slate-800 bg-slate-900/80'
                        : 'border-rose-500/40 bg-rose-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-200 flex items-center space-x-2">
                        {activeVerification.stages.locationEnvironment.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-400" />
                        )}
                        <span>Stage 3: Location & Spatial Environment</span>
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          activeVerification.stages.locationEnvironment.passed
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {activeVerification.stages.locationEnvironment.score}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-6">
                      {activeVerification.stages.locationEnvironment.details}
                    </p>
                  </div>

                  {/* Stage 4: Perspective & Landmark Alignment */}
                  <div
                    className={`rounded-xl border p-3 text-xs transition-colors ${
                      activeVerification.stages.landmarkPerspective.passed
                        ? 'border-slate-800 bg-slate-900/80'
                        : 'border-rose-500/40 bg-rose-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-200 flex items-center space-x-2">
                        {activeVerification.stages.landmarkPerspective.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-400" />
                        )}
                        <span>Stage 4: Perspective & Landmark Alignment</span>
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          activeVerification.stages.landmarkPerspective.passed
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {activeVerification.stages.landmarkPerspective.score}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-6">
                      {activeVerification.stages.landmarkPerspective.details}
                    </p>
                  </div>

                  {/* Stage 5: Defect Change & Compaction */}
                  <div
                    className={`rounded-xl border p-3 text-xs transition-colors ${
                      activeVerification.stages.changeDetection.passed
                        ? 'border-slate-800 bg-slate-900/80'
                        : 'border-rose-500/40 bg-rose-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-200 flex items-center space-x-2">
                        {activeVerification.stages.changeDetection.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-400" />
                        )}
                        <span>Stage 5: Defect Change & Compaction Quality</span>
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          activeVerification.stages.changeDetection.passed
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {activeVerification.stages.changeDetection.score}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-6">
                      {activeVerification.stages.changeDetection.details}
                    </p>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-center text-xs text-slate-500">
                  5-stage verification breakdown will appear once repair imagery is analyzed.
                </div>
              )}
            </div>

            {/* Cryptographic SHA-256 Ledger Hash Card */}
            {activeVerification?.cryptographicHash && (
              <div className="rounded-xl border border-cyan-500/30 bg-slate-950 p-3.5 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-cyan-400 flex items-center space-x-1.5">
                    <Lock className="h-3.5 w-3.5" />
                    <span>SHA-256 Audit Digest</span>
                  </span>
                  <button
                    onClick={handleCopyHash}
                    className="rounded p-1 text-slate-400 hover:text-white"
                    title="Copy SHA-256 Hash"
                  >
                    {isCopiedHash ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <div className="rounded-lg bg-slate-900 p-2 font-mono text-[10px] text-slate-300 break-all select-all">
                  {activeVerification.cryptographicHash}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                  <span>Timestamp: {new Date(activeVerification.timestamp || Date.now()).toLocaleDateString()}</span>
                  <span>Forensic Audit Ledger</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
