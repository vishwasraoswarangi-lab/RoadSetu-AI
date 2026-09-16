import React, { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, ImagePlus, Loader2, Lock, MapPin, RefreshCw, ShieldCheck, Sparkles, Upload, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintsContext';
import { HumanLocation } from '../types';
import { getCurrentUserLocation, reverseGeocodeCoords } from '../utils/reverseGeocode';
import { apiFetch } from '../lib/apiClient';
import { NavView } from '../components/Navbar';

interface ReportFlowViewProps {
  onNavigate: (view: NavView) => void;
}

type Analysis = {
  defectType?: string;
  severity?: string;
  hazardScore?: number;
  confidence?: number;
  aiSummary?: string;
  recommendedAction?: string;
};

const emptyLocation: HumanLocation = {
  road: '', area: '', landmark: '', city: '', state: '', country: 'India',
  formattedAddress: '', latitude: 0, longitude: 0,
};

export const ReportFlowView: React.FC<ReportFlowViewProps> = ({ onNavigate }) => {
  const { user, openAuthModal, showToast } = useAuth();
  const { addComplaint, checkForDuplicates } = useComplaints();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<HumanLocation>(emptyLocation);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraPreview, setCameraPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [nearbyReports, setNearbyReports] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const detect = async () => {
      setLocationLoading(true);
      const result = await getCurrentUserLocation(true);
      if (!active) return;
      if (result.status === 'success' && result.coords) {
        try {
          const detected = await reverseGeocodeCoords(result.coords.latitude, result.coords.longitude);
          if (active) setLocation(detected);
        } catch {
          if (active) setLocation({ ...emptyLocation, city: result.city || '', state: result.region || '', country: result.country || 'India', formattedAddress: result.city || 'Current location', latitude: result.coords.latitude, longitude: result.coords.longitude });
        }
        setLocationError(null);
      } else {
        setLocationError(result.errorMessage || 'Location access was not available.');
      }
      if (active) setLocationLoading(false);
    };
    detect();
    return () => { active = false; streamRef.current?.getTracks().forEach(track => track.stop()); };
  }, []);

  const setImage = (dataUrl: string) => {
    setPhotoUrl(dataUrl);
    setBase64Image(dataUrl);
    setAnalysis(null);
    setSubmitted(false);
    setNearbyReports(null);
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please choose an image file.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const openCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      showToast('Live camera is not supported here. Use Upload Image instead.', 'info');
      cameraInputRef.current?.click();
      return;
    }
    setCameraLoading(true);
    setCameraPreview(null);
    try {
      streamRef.current?.getTracks().forEach(track => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => undefined);
        }
      });
    } catch (error) {
      const name = error instanceof DOMException ? error.name : '';
      const message = name === 'NotAllowedError' || name === 'SecurityError'
        ? 'Camera permission was denied. Allow camera access in your browser settings, then try again.'
        : name === 'NotFoundError'
          ? 'No camera was found on this device.'
          : name === 'NotReadableError'
            ? 'The camera is currently being used by another application.'
            : 'Unable to access the camera. You can use Upload Image instead.';
      showToast(message, 'info');
    } finally {
      setCameraLoading(false);
    }
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
    setCameraPreview(null);
  };

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
      showToast('Camera is still starting. Please wait a moment and try again.', 'info');
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const captured = canvas.toDataURL('image/jpeg', 0.9);
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setCameraPreview(captured);
    showToast('Image captured. Review it before using it.', 'success');
  };

  const retakePhoto = () => {
    setCameraPreview(null);
    void openCamera();
  };

  const useCapturedPhoto = () => {
    if (!cameraPreview) return;
    setImage(cameraPreview);
    setCameraPreview(null);
    setCameraOpen(false);
    showToast('Live road image selected.', 'success');
  };

  const refreshLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);
    const result = await getCurrentUserLocation(true);
    if (result.status === 'success' && result.coords) {
      try {
        setLocation(await reverseGeocodeCoords(result.coords.latitude, result.coords.longitude));
        showToast('Live location updated.', 'success');
      } catch {
        setLocation({ ...emptyLocation, city: result.city || '', state: result.region || '', country: result.country || 'India', formattedAddress: result.city || 'Current location', latitude: result.coords.latitude, longitude: result.coords.longitude });
      }
    } else {
      setLocationError(result.errorMessage || 'Unable to retrieve your location.');
    }
    setLocationLoading(false);
  };

  const analyzeAndSubmit = async () => {
    if (!photoUrl || !base64Image) {
      showToast('Capture or upload a road image first.', 'info');
      return;
    }
    if (!location.latitude || !location.longitude) {
      showToast('Add a valid location before submitting.', 'info');
      return;
    }
    if (!user) {
      openAuthModal('login');
      return;
    }

    const duplicate = checkForDuplicates(location.latitude, location.longitude);
    if (duplicate.hasDuplicate && duplicate.existingComplaint) {
      setNearbyReports(1);
      showToast('A nearby report already exists. Review it before creating another report.', 'info');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await apiFetch('/api/analyze-defect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Image, description, location }),
      });
      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new Error(errorBody || `AI analysis failed with HTTP ${response.status}.`);
      }
      const json = await response.json();
      const data: Analysis = json.data || json;
      if (!data?.defectType || !data?.severity) {
        throw new Error('AI analysis returned an incomplete result.');
      }
      const result: Analysis = {
        defectType: data.defectType,
        severity: data.severity,
        hazardScore: data.hazardScore,
        confidence: data.confidence,
        aiSummary: data.aiSummary,
        recommendedAction: data.recommendedAction,
      };
      setAnalysis(result);

      const created = await addComplaint({
        description: description.trim() || result.aiSummary || 'Road defect reported from image analysis.',
        location,
        beforeImage: photoUrl,
        severity: result.severity as any,
        defectType: result.defectType,
        hazardScore: result.hazardScore,
        confidence: result.confidence,
        aiSummary: result.aiSummary,
        recommendedAction: result.recommendedAction,
        estimatedRepairDays: result.severity === 'Critical' ? 1 : result.severity === 'High' ? 2 : 4,
        department: `${location.city || 'Municipal'} Road Engineering Division`,
      });
      setSubmitted(Boolean(created));
      showToast('Report submitted successfully.', 'success');
    } catch (error) {
      console.error('Road defect submission failed:', error);
      showToast(error instanceof Error ? error.message : 'Could not complete the report. Please try again.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!user) {
    return <div className="min-h-[80vh] flex items-center justify-center p-4"><div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/90 p-8 text-center shadow-2xl"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400"><Lock className="h-7 w-7" /></div><h1 className="text-2xl font-black text-white">Report a Road Defect</h1><p className="mt-2 text-sm text-slate-400">Sign in to submit a verified civic report with your image and location.</p><button onClick={() => openAuthModal('login')} className="mt-6 w-full rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300">Sign in to continue</button></div></div>;
  }

  return (
    <div className="min-h-[80vh] bg-[#0B0F17] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300"><Sparkles className="h-3.5 w-3.5" />AI-assisted road reporting</div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Report a Road Defect</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">Capture the road condition, confirm where it is, and let AI analyze the evidence.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl sm:p-6">
            <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-bold text-white">Road image</h2><p className="text-xs text-slate-500">Use a fresh photo or choose one from your device.</p></div><ShieldCheck className="h-5 w-5 text-emerald-400" /></div>

            {photoUrl ? <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-950"><img src={photoUrl} alt="Selected road condition" className="max-h-[430px] w-full object-cover" /><button onClick={() => { setPhotoUrl(null); setBase64Image(null); setAnalysis(null); }} aria-label="Remove selected image" className="absolute right-3 top-3 rounded-full border border-white/10 bg-slate-950/80 p-2 text-white backdrop-blur hover:bg-slate-900"><X className="h-4 w-4" /></button></div> : <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 px-6 text-center"><div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400"><ImagePlus className="h-8 w-8" /></div><h3 className="font-bold text-white">Add a clear road image</h3><p className="mt-1 max-w-sm text-xs text-slate-500">A visible road surface helps the AI identify the defect accurately.</p></div>}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button onClick={() => void openCamera()} disabled={cameraLoading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60">{cameraLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}Capture Live Image</button>
              <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"><Upload className="h-4 w-4" />Upload Image</button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
            </div>

            <label className="mt-5 block"><span className="text-xs font-semibold text-slate-300">What did you notice? <span className="font-normal text-slate-500">(optional)</span></span><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="e.g. Large pothole near the left lane after the junction..." className="mt-2 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500" /></label>
          </section>

          <aside className="space-y-5">
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl"><div className="flex items-start justify-between gap-3"><div><h2 className="text-base font-bold text-white">Location</h2><p className="mt-1 text-xs text-slate-500">Used to route the report to the right area.</p></div><MapPin className="h-5 w-5 text-cyan-400" /></div><div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">{locationLoading ? <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" />Detecting your location…</div> : location.formattedAddress ? <><p className="text-sm font-semibold text-white">{location.formattedAddress}</p><p className="mt-1 text-xs text-slate-500">{location.road}{location.area ? ` · ${location.area}` : ''}</p></> : <p className="text-sm text-amber-300">Location not available</p>}</div>{locationError && <p className="mt-3 text-xs text-amber-300">{locationError}</p>}<button onClick={refreshLocation} disabled={locationLoading} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"><RefreshCw className="h-3.5 w-3.5" />Use current location</button></section>

            <section className="rounded-3xl border border-cyan-500/20 bg-cyan-500/[0.04] p-5"><div className="flex items-center gap-2 text-cyan-300"><Sparkles className="h-4 w-4" /><h2 className="text-base font-bold">AI analysis</h2></div>{analysis ? <div className="mt-4 space-y-3"><div className="flex items-center justify-between"><span className="text-xs text-slate-400">Detected defect</span><span className="text-sm font-bold text-white">{analysis.defectType}</span></div><div className="flex items-center justify-between"><span className="text-xs text-slate-400">Severity</span><span className="text-sm font-bold text-white">{analysis.severity}</span></div><div className="flex items-center justify-between"><span className="text-xs text-slate-400">Confidence</span><span className="text-sm font-bold text-cyan-300">{analysis.confidence ?? '—'}%</span></div><p className="border-t border-slate-800 pt-3 text-xs leading-relaxed text-slate-400">{analysis.aiSummary || 'Analysis completed.'}</p></div> : <p className="mt-3 text-xs leading-relaxed text-slate-500">Your image is analyzed only when you submit. The result will appear here before you leave the screen.</p>}</section>
          </aside>
        </div>

        {nearbyReports !== null && <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200">A nearby report may already cover this location. Check your existing reports before submitting another duplicate.</div>}

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><button onClick={() => onNavigate('dashboard')} className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800">Back to dashboard</button><button onClick={analyzeAndSubmit} disabled={analyzing || submitted} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-7 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/10 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60">{analyzing ? <><Loader2 className="h-4 w-4 animate-spin" />Analyzing image…</> : submitted ? <><CheckCircle2 className="h-4 w-4" />Report submitted</> : <><Sparkles className="h-4 w-4" />Analyze & Submit Report</>}</button></div>

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-600"><ShieldCheck className="h-3.5 w-3.5" />Your authenticated account is attached to the report.</div>
      </div>

      {cameraOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"><div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl"><div className="flex items-center justify-between border-b border-slate-800 px-4 py-3"><div><p className="font-bold text-white">Capture live road image</p><p className="text-[11px] text-slate-500">{cameraPreview ? 'Review the photo before adding it to your report.' : 'Camera access is used only while this capture window is open.'}</p></div><button onClick={closeCamera} aria-label="Close camera" className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><X className="h-5 w-5" /></button></div>{cameraPreview ? <div className="bg-black"><img src={cameraPreview} alt="Captured road preview" className="aspect-video w-full object-contain" /></div> : <video ref={videoRef} autoPlay playsInline muted className="aspect-video w-full bg-black object-cover" />}<div className="grid gap-3 p-4 sm:grid-cols-2">{cameraPreview ? <><button onClick={retakePhoto} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800"><RefreshCw className="h-4 w-4" />Retake</button><button onClick={useCapturedPhoto} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300"><CheckCircle2 className="h-4 w-4" />Use Photo</button></> : <button onClick={captureFrame} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300 sm:col-span-2"><Camera className="h-4 w-4" />Capture Image</button>}</div></div></div>}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};