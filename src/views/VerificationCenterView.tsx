import React, { useEffect, useRef, useState } from 'react';
import {
  AlertOctagon,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Download,
  FileCheck,
  Loader2,
  Lock,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Upload,
  XCircle,
} from 'lucide-react';

import { useComplaints } from '../context/ComplaintsContext';
import { Complaint, VerificationResult } from '../types';
import { NavView } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { runMultiStageVerification } from '../lib/verificationEngine';
import { MatchOriginalViewModal } from '../components/MatchOriginalViewModal';

interface VerificationCenterViewProps {
  onNavigate: (view: NavView) => void;
  selectedComplaintId?: string | null;
}

const TEST_SCENARIOS = [
  {
    id: 'test-cake',
    label: 'Unrelated Food',
    badge: 'REJECTED',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Unrelated cake or food image.',
    afterUrl:
      'https://images.unsplash.com/photo-1578985545062-699281a80e14?auto=format&fit=crop&w=1000&q=80',
    notes: 'Contractor uploaded unrelated celebration cake image.',
  },
  {
    id: 'test-indoor',
    label: 'Indoor Furniture',
    badge: 'REJECTED',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Indoor living room image.',
    afterUrl:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80',
    notes: 'Contractor submitted an unrelated indoor image.',
  },
  {
    id: 'test-mismatched-road',
    label: 'Mismatched Road',
    badge: 'SUSPICIOUS',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Different road environment.',
    afterUrl:
      'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1000&q=80',
    notes: 'Repair claimed on a different road segment.',
  },
  {
    id: 'test-valid-asphalt',
    label: 'Valid Asphalt',
    badge: 'VERIFIED',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Fresh compacted asphalt repair.',
    afterUrl: '/assets/repaired_road_after.jpg',
    notes:
      'Surface re-paved and compacted with bituminous concrete overlay.',
  },
];

export const VerificationCenterView: React.FC<
  VerificationCenterViewProps
> = ({ onNavigate, selectedComplaintId }) => {
  const {
    complaints,
    getComplaintById,
    updateComplaintStatus,
  } = useComplaints();

  const { showToast } = useAuth();

  const initialComplaint =
    (selectedComplaintId &&
      getComplaintById(selectedComplaintId)) ||
    complaints.find((c) => c.verification || c.afterImage) ||
    complaints[0];

  const [activeComplaint, setActiveComplaint] =
    useState<Complaint | undefined>(initialComplaint);

  const [currentAfterImage, setCurrentAfterImage] =
    useState<string>(initialComplaint?.afterImage || '');

  const [repairNotes, setRepairNotes] = useState<string>(
    initialComplaint?.contractorNotes || ''
  );

  const [activeVerification, setActiveVerification] =
    useState<VerificationResult | null>(
      initialComplaint?.verification || null
    );

  const [sliderPosition, setSliderPosition] = useState(50);
  const [viewMode, setViewMode] =
    useState<'slider' | 'side-by-side'>('slider');

  const [isVerifyingWithAi, setIsVerifyingWithAi] =
    useState(false);

  const [isCopiedHash, setIsCopiedHash] = useState(false);

  const [isExporting, setIsExporting] = useState(false);

  const [isMatchModalOpen, setIsMatchModalOpen] =
    useState(false);

  const afterFileInputRef =
    useRef<HTMLInputElement>(null);

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
      const first = complaints[0];

      setActiveComplaint(first);
      setCurrentAfterImage(first.afterImage || '');
      setActiveVerification(first.verification || null);
      setRepairNotes(first.contractorNotes || '');
    }
  }, [selectedComplaintId, complaints]);

  if (!activeComplaint) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-900">
            No complaints available
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Submit a road defect report first to use repair
            verification.
          </p>

          <button
            onClick={() => onNavigate('report')}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Report a Road Defect
          </button>
        </div>
      </div>
    );
  }

  const executeVerification = async (
    imageToVerify: string,
    notes = repairNotes
  ) => {
    if (!imageToVerify) {
      showToast(
        'Please select or upload an after-repair image first.',
        'error'
      );
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

      const newStatus =
        result.status === 'verified'
          ? 'verified'
          : result.status === 'rejected'
          ? 'suspicious'
          : 'repair_claimed';

      await updateComplaintStatus(
        activeComplaint.id,
        newStatus,
        {
          afterImage: imageToVerify,
          contractorNotes: notes,
          verification: result,
        }
      );

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
        showToast(
          'Repair verified successfully.',
          'success'
        );
      } else if (result.status === 'rejected') {
        showToast(
          `Repair rejected: ${
            result.rejectionReason ||
            'Semantic mismatch detected.'
          }`,
          'error'
        );
      } else {
        showToast(
          'Repair evidence flagged for review.',
          'info'
        );
      }
    } catch (error) {
      console.error('Verification error:', error);

      showToast(
        'Verification pipeline error. Please retry.',
        'error'
      );
    } finally {
      setIsVerifyingWithAi(false);
    }
  };

  const handleAfterImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;

      setCurrentAfterImage(result);
      setActiveVerification(null);

      showToast(
        'Repair image loaded. Run the AI audit to evaluate it.',
        'info'
      );
    };

    reader.readAsDataURL(file);
  };

  const handleSelectScenario = (
    scenario: (typeof TEST_SCENARIOS)[0]
  ) => {
    setCurrentAfterImage(scenario.afterUrl);
    setRepairNotes(scenario.notes);

    executeVerification(
      scenario.afterUrl,
      scenario.notes
    );
  };

  const handleTestIdenticalImage = () => {
    if (!activeComplaint.beforeImage) return;

    const note =
      'Contractor resubmitted identical before photo.';

    setCurrentAfterImage(activeComplaint.beforeImage);
    setRepairNotes(note);

    executeVerification(
      activeComplaint.beforeImage,
      note
    );
  };

  const handleMatchViewSubmission = async (
    capturedImage: string,
    notes: string
  ) => {
    setCurrentAfterImage(capturedImage);
    setRepairNotes(notes);
    setIsMatchModalOpen(false);

    showToast(
      'Repair photo captured. Starting verification audit...',
      'info'
    );

    await executeVerification(
      capturedImage,
      notes
    );
  };

  const handleExportCertificate = () => {
    setIsExporting(true);

    setTimeout(() => {
      setIsExporting(false);

      showToast(
        `Audit Certificate generated: RoadSetu-Audit-${activeComplaint.id}.pdf`,
        'success'
      );
    }, 1200);
  };

  const handleCopyHash = () => {
    if (!activeVerification?.cryptographicHash) {
      return;
    }

    navigator.clipboard.writeText(
      activeVerification.cryptographicHash
    );

    setIsCopiedHash(true);

    showToast(
      'Cryptographic SHA-256 hash copied.',
      'success'
    );

    setTimeout(
      () => setIsCopiedHash(false),
      2500
    );
  };

  const isVerified =
    activeVerification?.status === 'verified';

  const isRejected =
    activeVerification?.status === 'rejected';

  const isComparisonValid = activeVerification
    ? activeVerification.isComparisonValid !== false
    : true;

  const hasAfterImage = Boolean(currentAfterImage);

  const stages = activeVerification?.stages
    ? [
        {
          number: 1,
          title: 'Image Validity & Format',
          data: activeVerification.stages.validity,
        },
        {
          number: 2,
          title: 'Semantic & Scene Consistency',
          data: activeVerification.stages
            .semanticConsistency,
        },
        {
          number: 3,
          title: 'Location & Spatial Environment',
          data: activeVerification.stages
            .locationEnvironment,
        },
        {
          number: 4,
          title: 'Perspective & Landmark Alignment',
          data: activeVerification.stages
            .landmarkPerspective,
        },
        {
          number: 5,
          title: 'Defect Change & Compaction Quality',
          data: activeVerification.stages
            .changeDetection,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                <ShieldCheck className="h-4 w-4" />
                <span>RoadSetu Verification Engine</span>
              </div>

              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                AI Repair Verification Center
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Compare the original road defect with the
                contractor's repair evidence using a
                multi-stage verification audit.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-500">
                Report
              </span>

              <div className="relative">
                <select
                  value={activeComplaint.id}
                  onChange={(e) => {
                    const found =
                      getComplaintById(e.target.value);

                    if (found) {
                      setActiveComplaint(found);
                      setCurrentAfterImage(
                        found.afterImage || ''
                      );
                      setActiveVerification(
                        found.verification || null
                      );
                      setRepairNotes(
                        found.contractorNotes || ''
                      );
                    }
                  }}
                  className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-9 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {complaints.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} — {c.location.road}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        </section>

        {/* COMPLAINT SUMMARY */}
        <section className="grid gap-4 md:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-2">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Selected complaint
                </p>

                <h2 className="mt-1 truncate text-base font-bold text-slate-900">
                  {activeComplaint.location.road}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {activeComplaint.location.city}
                  {activeComplaint.location.landmark
                    ? ` • ${activeComplaint.location.landmark}`
                    : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Defect
            </p>

            <p className="mt-2 text-sm font-bold text-slate-800">
              {activeComplaint.defectType}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Severity: {activeComplaint.severity}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Audit status
            </p>

            <div className="mt-2">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                  isVerified
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : isRejected
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : activeVerification
                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}
              >
                {isVerified
                  ? 'VERIFIED'
                  : isRejected
                  ? 'REJECTED'
                  : activeVerification
                  ? 'NEEDS REVIEW'
                  : 'AWAITING EVIDENCE'}
              </span>
            </div>
          </div>
        </section>

        {/* TEST CONSOLE */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Verification Test Console
                </h2>

                <p className="text-xs text-slate-500">
                  Test the existing verification pipeline with preset scenarios.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

            {TEST_SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                disabled={isVerifyingWithAi}
                onClick={() =>
                  handleSelectScenario(scenario)
                }
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <p className="text-sm font-bold text-slate-800">
                  {scenario.label}
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full border px-2 py-1 text-[10px] font-bold ${scenario.badgeClass}`}
                >
                  {scenario.badge}
                </span>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {scenario.description}
                </p>
              </button>
            ))}

            <button
              type="button"
              disabled={
                isVerifyingWithAi ||
                !activeComplaint.beforeImage
              }
              onClick={handleTestIdenticalImage}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <p className="text-sm font-bold text-slate-800">
                Identical Defect
              </p>

              <span className="mt-2 inline-flex rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700">
                REJECTED
              </span>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Contractor submits the original damaged-road photo.
              </p>
            </button>
          </div>
        </section>

        {/* EVIDENCE UPLOAD */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Upload className="h-4 w-4 text-blue-600" />
                Contractor Repair Evidence
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Upload an after-repair image or capture one using the original viewpoint.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <input
                ref={afterFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAfterImageUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() =>
                  afterFileInputRef.current?.click()
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
              >
                <Upload className="h-4 w-4" />
                Upload Image
              </button>

              <button
                type="button"
                onClick={() => setIsMatchModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
              >
                <MapPin className="h-4 w-4" />
                Match Original View
              </button>
            </div>
          </div>

          {hasAfterImage && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label className="text-xs font-semibold text-slate-600">
                Contractor notes
              </label>

              <textarea
                value={repairNotes}
                onChange={(e) =>
                  setRepairNotes(e.target.value)
                }
                rows={3}
                placeholder="Add repair evidence notes..."
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                disabled={isVerifyingWithAi}
                onClick={() =>
                  executeVerification(
                    currentAfterImage,
                    repairNotes
                  )
                }
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {isVerifyingWithAi ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running 5-Stage Audit...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Run 5-Stage AI Audit
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        {/* IMAGE COMPARISON + SCORE */}
        <section className="grid gap-6 lg:grid-cols-12">

          {/* IMAGE AREA */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Before / After Evidence
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Compare the reported defect with the repair claim.
                </p>
              </div>

              <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() =>
                    setViewMode('slider')
                  }
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    viewMode === 'slider'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  Slider
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setViewMode('side-by-side')
                  }
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    viewMode === 'side-by-side'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  Side by side
                </button>
              </div>
            </div>

            {hasAfterImage ? (
              <div className="mt-4">

                {viewMode === 'slider' ? (
                  <div className="relative h-[390px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">

                    <img
                      src={currentAfterImage}
                      alt="Post repair"
                      className="absolute inset-0 h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />

                    <div
                      className="absolute inset-y-0 left-0 overflow-hidden"
                      style={{
                        width: `${sliderPosition}%`,
                      }}
                    >
                      <img
                        src={activeComplaint.beforeImage}
                        alt="Original defect"
                        className="h-full w-full object-cover"
                        style={{
                          width: `${10000 / Math.max(sliderPosition, 1)}%`,
                          maxWidth: 'none',
                        }}
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div
                      className="absolute inset-y-0 z-20 w-0.5 bg-white shadow"
                      style={{
                        left: `${sliderPosition}%`,
                      }}
                    />

                    <div
                      className="absolute top-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${sliderPosition}%`,
                      }}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-white shadow-lg">
                        ↔
                      </div>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPosition}
                      onChange={(e) =>
                        setSliderPosition(
                          Number(e.target.value)
                        )
                      }
                      className="absolute inset-0 z-40 h-full w-full cursor-ew-resize opacity-0"
                      aria-label="Compare before and after"
                    />

                    <span className="absolute left-3 top-3 z-20 rounded-lg bg-slate-900/80 px-2.5 py-1.5 text-[10px] font-bold text-white">
                      ORIGINAL
                    </span>

                    <span className="absolute right-3 top-3 z-20 rounded-lg bg-blue-600/90 px-2.5 py-1.5 text-[10px] font-bold text-white">
                      AFTER REPAIR
                    </span>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">

                    <div className="overflow-hidden rounded-2xl border border-rose-200 bg-rose-50">
                      <div className="border-b border-rose-100 px-3 py-2 text-xs font-bold text-rose-700">
                        Original Defect
                      </div>

                      <img
                        src={activeComplaint.beforeImage}
                        alt="Original defect"
                        className="h-[330px] w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div
                      className={`overflow-hidden rounded-2xl border ${
                        isComparisonValid
                          ? 'border-emerald-200 bg-emerald-50'
                          : 'border-rose-200 bg-rose-50'
                      }`}
                    >
                      <div
                        className={`border-b px-3 py-2 text-xs font-bold ${
                          isComparisonValid
                            ? 'border-emerald-100 text-emerald-700'
                            : 'border-rose-100 text-rose-700'
                        }`}
                      >
                        After Repair
                      </div>

                      <img
                        src={currentAfterImage}
                        alt="Post repair"
                        className="h-[330px] w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Comparison alignment
                  </span>

                  <span
                    className={`font-semibold ${
                      isComparisonValid
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {isComparisonValid
                      ? 'Alignment detected'
                      : 'Semantic disparity detected'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex h-[390px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                <div className="text-center">
                  <Upload className="mx-auto h-9 w-9 text-slate-300" />

                  <p className="mt-3 text-sm font-semibold text-slate-600">
                    No repair evidence yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Upload an after-repair image to begin.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* SCORE */}
          <div className="space-y-4 lg:col-span-5">

            <div
              className={`rounded-3xl border bg-white p-6 shadow-sm ${
                isVerified
                  ? 'border-emerald-200'
                  : isRejected
                  ? 'border-rose-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    AI verification score
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-600">
                    Overall audit result
                  </p>
                </div>

                {activeVerification && (
                  isVerified ? (
                    <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                  ) : (
                    <XCircle className="h-7 w-7 text-rose-500" />
                  )
                )}
              </div>

              <div className="mt-6 flex items-end gap-2">
                <span
                  className={`text-5xl font-black tracking-tight ${
                    !activeVerification
                      ? 'text-slate-300'
                      : isVerified
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}
                >
                  {activeVerification
                    ? `${activeVerification.overallScore}%`
                    : 'N/A'}
                </span>

                {activeVerification && (
                  <span className="pb-2 text-xs font-medium text-slate-400">
                    overall score
                  </span>
                )}
              </div>

              {activeVerification && (
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isVerified
                        ? 'bg-emerald-500'
                        : 'bg-rose-500'
                    }`}
                    style={{
                      width: `${Math.max(
                        activeVerification.overallScore,
                        4
                      )}%`,
                    }}
                  />
                </div>
              )}

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Repair disbursal
                  </span>

                  <span
                    className={`font-bold ${
                      isVerified
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {isVerified
                      ? 'CLEARED'
                      : 'FROZEN'}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  {isVerified
                    ? 'Repair evidence passed the verification gates.'
                    : 'Payment remains blocked until valid evidence is confirmed.'}
                </p>
              </div>

              {activeVerification && (
                <button
                  type="button"
                  onClick={handleExportCertificate}
                  disabled={isExporting}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}

                  {isExporting
                    ? 'Generating Audit Certificate...'
                    : 'Export Audit Certificate'}
                </button>
              )}
            </div>

            {/* STAGES */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    5-Stage Verification
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Each verification gate is evaluated independently.
                  </p>
                </div>

                <FileCheck className="h-5 w-5 text-blue-600" />
              </div>

              <div className="mt-4 space-y-2.5">
                {stages.length > 0 ? (
                  stages.map((stage) => (
                    <div
                      key={stage.number}
                      className={`rounded-2xl border p-3 ${
                        stage.data.passed
                          ? 'border-slate-200 bg-slate-50'
                          : 'border-rose-200 bg-rose-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">

                        <div className="flex min-w-0 items-center gap-2.5">
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                              stage.data.passed
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-rose-100 text-rose-600'
                            }`}
                          >
                            {stage.data.passed ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800">
                              Stage {stage.number}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {stage.title}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 text-xs font-black ${
                            stage.data.passed
                              ? 'text-emerald-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {stage.data.score}%
                        </span>
                      </div>

                      <p className="mt-2 pl-9 text-[11px] leading-5 text-slate-500">
                        {stage.data.details}
                      </p>

                      {stage.number === 2 &&
                        stage.data.detectedScene2 && (
                          <div className="mt-2 ml-9 inline-flex rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600">
                            Detected scene:{' '}
                            {stage.data.detectedScene2}
                          </div>
                        )}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                    <Clock className="mx-auto h-6 w-6 text-slate-300" />

                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      Waiting for repair evidence
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      The five audit stages will appear after analysis.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* HASH */}
        {activeVerification?.cryptographicHash && (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5">
                  <Lock className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    SHA-256 Audit Digest
                  </h2>

                  <p className="text-xs text-slate-500">
                    Cryptographic verification record
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyHash}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
              >
                {isCopiedHash ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}

                {isCopiedHash
                  ? 'Copied'
                  : 'Copy Hash'}
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="break-all font-mono text-xs leading-6 text-slate-600">
                {activeVerification.cryptographicHash}
              </p>
            </div>

            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
              <Clock className="h-3.5 w-3.5" />

              <span>
                Timestamp:{' '}
                {new Date(
                  activeVerification.timestamp ||
                    Date.now()
                ).toLocaleString()}
              </span>
            </div>
          </section>
        )}

        {/* FOOTER NAVIGATION */}
        <div className="flex flex-wrap justify-between gap-3 pb-6">

          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Back to Dashboard
          </button>

          <button
            type="button"
            onClick={() => onNavigate('map')}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
          >
            <MapPin className="h-4 w-4" />
            View Complaint Map
          </button>
        </div>

        {/* MATCH ORIGINAL VIEW MODAL */}
        {activeComplaint && (
          <MatchOriginalViewModal
            isOpen={isMatchModalOpen}
            onClose={() =>
              setIsMatchModalOpen(false)
            }
            complaint={activeComplaint}
            onSubmitRepair={
              handleMatchViewSubmission
            }
          />
        )}
      </div>
    </div>
  );
};
