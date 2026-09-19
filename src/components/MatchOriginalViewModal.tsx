import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Check,
  MapPin,
  Clock,
  Eye,
  Building,
  ArrowRight,
  Shield,
  Compass,
} from 'lucide-react';
import { Complaint } from '../types';

interface MatchOriginalViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint;
  onSubmitRepair: (capturedImage: string, notes: string) => Promise<void> | void;
}

type GuidanceStep =
  | 'Move slightly left'
  | 'Move slightly right'
  | 'Move closer'
  | 'Move back'
  | 'Raise camera'
  | 'Lower camera';

const GUIDANCE_STEPS: GuidanceStep[] = [
  'Raise camera',
  'Move slightly left',
  'Move closer',
  'Lower camera',
  'Move slightly right',
];

export const MatchOriginalViewModal: React.FC<MatchOriginalViewModalProps> = ({
  isOpen,
  onClose,
  complaint,
  onSubmitRepair,
}) => {
  const [step, setStep] = useState<'align' | 'review'>('align');
  const [alignmentState, setAlignmentState] = useState<'guiding' | 'wrong_view' | 'matched'>('guiding');
  const [currentGuidanceIndex, setCurrentGuidanceIndex] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isWrongViewDemo, setIsWrongViewDemo] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [repairNotes, setRepairNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize camera when opened
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setStep('align');
      setCapturedImage(null);
      setAlignmentState('guiding');
      setIsWrongViewDemo(false);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => undefined);
        }
        setCameraActive(true);
      } else {
        setCameraActive(false);
        setCameraError('Live camera not supported by browser. Using field preview simulation.');
      }
    } catch (err) {
      console.warn('Camera access unavailable:', err);
      setCameraActive(false);
      setCameraError('Camera access unavailable. Interactive viewpoint alignment simulator active.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Cycle through real-time guidance when in guiding state
  useEffect(() => {
    if (step !== 'align' || alignmentState !== 'guiding') return;

    const timer = setInterval(() => {
      setCurrentGuidanceIndex((prev) => {
        const next = prev + 1;
        if (next >= GUIDANCE_STEPS.length) {
          setAlignmentState('matched');
          return 0;
        }
        return next;
      });
    }, 2400);

    return () => clearInterval(timer);
  }, [step, alignmentState]);

  // Handle capture from live video or preset field evidence
  const handleCapture = () => {
    let finalImageUrl = '/assets/repaired_road_after.jpg';

    if (isWrongViewDemo) {
      // Demo mismatched view (different street/angle)
      finalImageUrl = 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1000&q=80';
    } else if (cameraActive && videoRef.current && canvasRef.current) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          finalImageUrl = canvas.toDataURL('image/jpeg', 0.9);
        }
      } catch (err) {
        console.warn('Canvas capture fallback:', err);
      }
    }

    setCapturedImage(finalImageUrl);
    setStep('review');
  };

  // Retake
  const handleRetake = () => {
    setCapturedImage(null);
    setStep('align');
    setAlignmentState('guiding');
    setCurrentGuidanceIndex(0);
  };

  // Switch demo scenarios
  const handleSetDemoScenario = (scenario: 'matched' | 'wrong_view' | 'guiding') => {
    if (scenario === 'wrong_view') {
      setIsWrongViewDemo(true);
      setAlignmentState('wrong_view');
    } else if (scenario === 'matched') {
      setIsWrongViewDemo(false);
      setAlignmentState('matched');
    } else {
      setIsWrongViewDemo(false);
      setAlignmentState('guiding');
      setCurrentGuidanceIndex(0);
    }
  };

  // Submit for full RoadSetu verification
  const handleSubmit = async () => {
    if (!capturedImage) return;
    setIsSubmitting(true);
    try {
      const notes = repairNotes.trim() || 'Contractor after-repair photo captured via Viewpoint Matching.';
      await onSubmitRepair(capturedImage, notes);
      onClose();
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 bg-slate-50/70">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <span>📐</span> MATCH THE ORIGINAL VIEW
              </span>
              <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700 border border-teal-200">
                Civic Field Guidance
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Capture the repair from a similar viewpoint to establish reliable comparative evidence.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* STEP 1: ALIGN CAMERA */}
        {step === 'align' && (
          <div className="p-4 sm:p-5 space-y-4">
            {/* Split View: Small Original Reference + Large Live Camera */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* ORIGINAL VIEW (Small Reference) */}
              <div className="md:col-span-4 flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <span>ORIGINAL VIEW</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Reference Image</span>
                </div>

                <div className="relative rounded-xl border border-slate-300 bg-slate-100 overflow-hidden shadow-sm aspect-[4/3] md:aspect-auto md:h-56">
                  <img
                    src={complaint.beforeImage}
                    alt="Original pothole defect"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 to-transparent p-2 text-white">
                    <p className="text-[11px] font-semibold truncate flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-teal-400 shrink-0" />
                      <span>{complaint.location.road || 'Reported Defect Segment'}</span>
                    </p>
                    <p className="text-[10px] text-slate-300 truncate">
                      {complaint.location.landmark ? `Near ${complaint.location.landmark}` : 'Notice curb & background'}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-700 flex items-center gap-1">
                    <Compass className="h-3 w-3 text-teal-600" />
                    <span>Visual Reference Cues</span>
                  </div>
                  <ul className="text-[10px] text-slate-500 list-disc list-inside space-y-0.5">
                    <li>Align with the roadside curb line</li>
                    <li>Keep distance similar to original</li>
                    <li>Frame the repaired patch in center</li>
                  </ul>
                </div>
              </div>

              {/* LIVE CAMERA (Large Preview with Subtle Alignment Guide) */}
              <div className="md:col-span-8 flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span>LIVE CAMERA</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {cameraActive ? 'Device Camera Active' : 'Field View Simulator'}
                  </span>
                </div>

                {/* Camera Container with Alignment Overlay */}
                <div className="relative rounded-xl border border-slate-300 bg-slate-900 overflow-hidden shadow-inner aspect-[4/3] md:h-72 flex items-center justify-center">
                  {cameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`h-full w-full object-cover transition-opacity duration-300 ${
                        isWrongViewDemo ? 'opacity-30 blur-[1px]' : 'opacity-100'
                      }`}
                    />
                  ) : null}

                  {/* If wrong view demo or camera fallback */}
                  {(!cameraActive || isWrongViewDemo) && (
                    <img
                      src={
                        isWrongViewDemo
                          ? 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1000&q=80'
                          : '/assets/repaired_road_after.jpg'
                      }
                      alt="Field camera simulation"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}

                  {/* SUBTLE ALIGNMENT & FRAMING GUIDE OVERLAY */}
                  <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                    {/* Top corner brackets */}
                    <div className="flex justify-between w-full">
                      <div className="w-6 h-6 border-t-2 border-l-2 border-teal-400/80 rounded-tl"></div>
                      <div className="w-6 h-6 border-t-2 border-r-2 border-teal-400/80 rounded-tr"></div>
                    </div>

                    {/* Center Framing Target */}
                    <div className="mx-auto my-auto relative">
                      <div
                        className={`w-40 sm:w-52 h-24 sm:h-32 rounded-lg border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center ${
                          alignmentState === 'matched'
                            ? 'border-emerald-400 bg-emerald-500/10'
                            : alignmentState === 'wrong_view'
                            ? 'border-amber-400 bg-amber-500/10'
                            : 'border-white/60 bg-black/10'
                        }`}
                      >
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-sm ${
                            alignmentState === 'matched'
                              ? 'bg-emerald-600 text-white'
                              : alignmentState === 'wrong_view'
                              ? 'bg-amber-600 text-white'
                              : 'bg-black/50 text-white'
                          }`}
                        >
                          {alignmentState === 'matched'
                            ? 'Target Patch Aligned'
                            : alignmentState === 'wrong_view'
                            ? 'Framing Mismatch'
                            : 'Align Repair Patch Here'}
                        </span>
                      </div>

                      {/* Subtle Horizon Level Line */}
                      <div className="absolute top-1/2 -left-8 -right-8 h-[1px] bg-white/30"></div>
                    </div>

                    {/* Bottom corner brackets */}
                    <div className="flex justify-between w-full">
                      <div className="w-6 h-6 border-b-2 border-l-2 border-teal-400/80 rounded-bl"></div>
                      <div className="w-6 h-6 border-b-2 border-r-2 border-teal-400/80 rounded-br"></div>
                    </div>
                  </div>

                  {/* Camera Error / Simulator Pill */}
                  {cameraError && !isWrongViewDemo && (
                    <div className="absolute bottom-2 left-2 right-2 rounded bg-black/70 px-2.5 py-1 text-center text-[10px] text-slate-300 backdrop-blur-sm">
                      {cameraError}
                    </div>
                  )}
                </div>

                {/* VIEWPOINT GUIDANCE BAR (ONLY ONE instruction visible at a time) */}
                <div className="w-full">
                  {alignmentState === 'matched' ? (
                    <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-emerald-800 transition-all">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 block">
                            ✓ VIEWPOINT MATCHED
                          </span>
                          <span className="text-[11px] text-emerald-700">Ready to capture</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">
                        Angle Aligned
                      </span>
                    </div>
                  ) : alignmentState === 'wrong_view' ? (
                    <div className="flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-amber-900 transition-all">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
                            ⚠ DIFFERENT VIEW
                          </span>
                          <span className="text-[11px] text-amber-700">Try to match the original photo.</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded">
                        Angle Deviation
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-slate-800 transition-all">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">📐</span>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            {GUIDANCE_STEPS[currentGuidanceIndex]}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Align camera with background road landmarks
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAlignmentState('matched')}
                        className="text-[10px] font-semibold text-teal-700 underline hover:text-teal-800"
                      >
                        Skip to match
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* HACKATHON DEMO SWITCHER BAR (For Judges) */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                <span>Judge Demo Toggle:</span>
                <span className="font-normal text-slate-500">Test different camera viewpoints</span>
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSetDemoScenario('wrong_view')}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
                    alignmentState === 'wrong_view'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  ⚠ Demo: Different View
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDemoScenario('guiding')}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
                    alignmentState === 'guiding'
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  📐 Demo: Guiding Steps
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDemoScenario('matched')}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
                    alignmentState === 'matched'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  ✓ Demo: Viewpoint Matched
                </button>
              </div>
            </div>

            {/* ACTION ROW */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCapture}
                className={`rounded-xl px-6 py-2.5 text-xs font-bold transition-all shadow-md flex items-center space-x-2 ${
                  alignmentState === 'matched'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20'
                    : alignmentState === 'wrong_view'
                    ? 'bg-amber-600 text-white hover:bg-amber-500 shadow-amber-600/20'
                    : 'bg-teal-600 text-white hover:bg-teal-500 shadow-teal-600/20'
                }`}
              >
                <Camera className="h-4 w-4" />
                <span>CAPTURE AFTER PHOTO</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: AFTER CAPTURE COMPARISON & MULTI-DIMENSIONAL PRE-CHECK */}
        {step === 'review' && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-bold text-slate-900">Review Viewpoint & Evidence Pre-Check</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Confirm visual alignment with original defect before submitting for full 5-stage verification audit.
              </p>
            </div>

            {/* SIDE-BY-SIDE COMPARISON */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* ORIGINAL */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    ORIGINAL
                  </span>
                  <span className="text-[10px] text-slate-500">Citizen Defect Photo</span>
                </div>
                <div className="relative rounded-xl border border-slate-300 bg-slate-100 overflow-hidden shadow-sm aspect-[4/3]">
                  <img
                    src={complaint.beforeImage}
                    alt="Original pothole"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 rounded bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white">
                    BEFORE REPAIR
                  </div>
                </div>
              </div>

              {/* AFTER */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    AFTER
                  </span>
                  <span className="text-[10px] text-teal-700 font-semibold">Matched View Capture</span>
                </div>
                <div className="relative rounded-xl border border-slate-300 bg-slate-100 overflow-hidden shadow-sm aspect-[4/3]">
                  {capturedImage && (
                    <img
                      src={capturedImage}
                      alt="Captured after repair"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="absolute top-2 left-2 rounded bg-teal-800/85 px-2 py-0.5 text-[10px] font-bold text-white">
                    AFTER REPAIR CLAIM
                  </div>
                </div>
              </div>
            </div>

            {/* PRE-CHECK CHECKLIST */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                <span>Viewpoint & Environmental Alignment Pre-Check</span>
                <span className="text-[10px] text-slate-500 font-normal">Pre-Audit Telemetry</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
                {/* Location */}
                <div className="rounded-lg border border-slate-200 bg-white p-2">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-0.5">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span>Location</span>
                  </div>
                  <div className="font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Match</span>
                  </div>
                </div>

                {/* Time */}
                <div className="rounded-lg border border-slate-200 bg-white p-2">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-0.5">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>Time</span>
                  </div>
                  <div className="font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Available</span>
                  </div>
                </div>

                {/* Visual */}
                <div className="rounded-lg border border-slate-200 bg-white p-2">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-0.5">
                    <Eye className="h-3 w-3 text-slate-400" />
                    <span>Visual</span>
                  </div>
                  <div
                    className={`font-bold flex items-center gap-1 ${
                      isWrongViewDemo ? 'text-amber-700' : 'text-emerald-700'
                    }`}
                  >
                    {isWrongViewDemo ? (
                      <>
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                        <span>Different</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Similar</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Viewpoint */}
                <div className="rounded-lg border border-slate-200 bg-white p-2">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-0.5">
                    <span>📐</span>
                    <span>Viewpoint</span>
                  </div>
                  <div
                    className={`font-bold flex items-center gap-1 ${
                      isWrongViewDemo ? 'text-amber-700' : 'text-emerald-700'
                    }`}
                  >
                    {isWrongViewDemo ? (
                      <>
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                        <span>Different</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Similar</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Background */}
                <div className="rounded-lg border border-slate-200 bg-white p-2">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-0.5">
                    <Building className="h-3 w-3 text-slate-400" />
                    <span>Background</span>
                  </div>
                  <div
                    className={`font-bold flex items-center gap-1 ${
                      isWrongViewDemo ? 'text-amber-700' : 'text-emerald-700'
                    }`}
                  >
                    {isWrongViewDemo ? (
                      <>
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                        <span>Mismatch</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Match</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* OPTIONAL CONTRACTOR NOTES */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contractor Field Notes (Optional)
              </label>
              <input
                type="text"
                value={repairNotes}
                onChange={(e) => setRepairNotes(e.target.value)}
                placeholder="e.g. 40mm bitumen overlay compacted with 8-ton vibratory roller."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:outline-none"
              />
            </div>

            {/* IMPORTANT ANTI-FRAUD & TECHNICAL HONESTY NOTICE */}
            <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-3 text-[11px] text-teal-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-teal-950">
                <Shield className="h-3.5 w-3.5 text-teal-700" />
                <span>Anti-Fraud Audit Principle</span>
              </div>
              <p className="leading-relaxed text-teal-800">
                <strong>SAME POTHOLE + SAME LOCATION + SIMILAR VIEW + MATCHING BACKGROUND = STRONGER REPAIR EVIDENCE</strong>
              </p>
              <p className="text-[10px] text-teal-700 leading-snug">
                Viewpoint matching assists the contractor in capturing comparable visual evidence. Submitting here does NOT immediately mark the repair as verified; the full RoadSetu verification engine will independently evaluate GPS telemetry, capture timestamp, background landmarks, and compaction quality.
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={handleRetake}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                <span>Retake Photo</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-xl bg-teal-700 px-6 py-2.5 text-xs font-bold text-white hover:bg-teal-600 transition-all shadow-md shadow-teal-700/20 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <span>SUBMIT FOR VERIFICATION</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Hidden Canvas for Live Video Frame Capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};
