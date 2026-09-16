import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 3000);
app.use(express.json({ limit: '15mb' }));

let firebaseAdminReady = false;
try {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (projectId && clientEmail && privateKey) initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    else initializeApp({ credential: applicationDefault() });
  }
  firebaseAdminReady = true;
} catch (error) { console.error('Firebase Admin initialization failed:', error); }

interface AuthedRequest extends Request { firebaseUser?: { uid: string; email?: string; [key: string]: unknown } }
async function requireFirebaseUser(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!firebaseAdminReady) return res.status(503).json({ success: false, error: 'Server authentication is not configured.' });
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return res.status(401).json({ success: false, error: 'Authentication required.' });
  try {
    req.firebaseUser = await getAdminAuth().verifyIdToken(header.slice(7), true);
    return next();
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    return res.status(401).json({ success: false, error: 'Invalid or expired Firebase session.' });
  }
}
async function requireAuthority(req: AuthedRequest, res: Response, next: NextFunction) {
  const uid = req.firebaseUser?.uid;
  if (!uid) return res.status(401).json({ success: false, error: 'Authentication required.' });
  try {
    const snap = await getAdminFirestore().collection('users').doc(uid).get();
    const role = String(snap.data()?.role || 'citizen').toLowerCase();
    if (!['authority', 'municipal_officer', 'admin'].includes(role)) return res.status(403).json({ success: false, error: 'Authority access required.' });
    return next();
  } catch (error) {
    console.error('Authority permission lookup failed:', error);
    return res.status(403).json({ success: false, error: 'Unable to verify authority permissions.' });
  }
}

let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try { aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); } catch (error) { console.error('Gemini initialization failed:', error); }
  }
  return aiClient;
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok', aiConfigured: Boolean(process.env.GEMINI_API_KEY), firebaseConfigured: firebaseAdminReady, timestamp: new Date().toISOString() }));

app.get('/api/ip-location', async (req, res) => {
  try {
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : (req.socket.remoteAddress || '');
    const local = !clientIp || clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('10.') || clientIp.startsWith('192.168.') || clientIp.startsWith('172.');
    const url = local ? 'https://ipapi.co/json/' : `https://ipapi.co/${clientIp}/json/`;
    const response = await fetch(url, { headers: { 'User-Agent': 'RoadSetuAI-CivicLocation/1.0' }, signal: AbortSignal.timeout(3500) });
    if (response.ok) {
      const data = await response.json();
      if (typeof data.latitude === 'number' && typeof data.longitude === 'number') return res.json({ success: true, source: 'ip', latitude: data.latitude, longitude: data.longitude, city: data.city || '', region: data.region || '', country: data.country_name || '' });
    }
  } catch (error) { console.warn('IP geolocation failed:', error); }
  return res.json({ success: false, message: 'Unable to resolve IP geolocation' });
});

async function resolveImage(input: string | undefined | null, defaultMime = 'image/jpeg') {
  if (!input || typeof input !== 'string') return null;
  const value = input.trim();
  const match = value.match(/^data:([a-zA-Z0-9+/.-]+);base64,(.+)$/s);
  if (match) return { mimeType: match[1] || defaultMime, data: match[2].replace(/[\r\n\s]/g, '') };
  if (value.startsWith('/')) {
    try {
      const localPath = path.join(process.cwd(), 'public', value);
      if (fs.existsSync(localPath)) {
        const ext = path.extname(localPath).toLowerCase();
        return { mimeType: ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg', data: fs.readFileSync(localPath).toString('base64') };
      }
    } catch (error) { console.warn('Local image read failed:', error); }
  }
  if (/^https?:\/\//i.test(value)) {
    try {
      const response = await fetch(value, { headers: { 'User-Agent': 'RoadSetuAI-Analyzer/1.0', Accept: 'image/*' }, signal: AbortSignal.timeout(9000) });
      if (!response.ok) return null;
      return { mimeType: (response.headers.get('content-type') || defaultMime).split(';')[0].trim(), data: Buffer.from(await response.arrayBuffer()).toString('base64') };
    } catch (error) { console.warn('Remote image fetch failed:', error); return null; }
  }
  const clean = value.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '').replace(/[\r\n\s]/g, '');
  return clean.length > 30 ? { mimeType: defaultMime, data: clean } : null;
}

const DEFECT_TYPES = ['pothole', 'road_crack', 'surface_damage', 'drainage_failure', 'debris_or_obstruction', 'road_marking_damage', 'other_road_defect', 'no_road_defect'] as const;
const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'] as const;
function parseAiJson(text: string) {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('AI returned an invalid validation response.');
  return JSON.parse(cleaned.slice(start, end + 1));
}
function normalizeDefectResult(raw: any) {
  const defectType = DEFECT_TYPES.includes(raw?.defectType) ? raw.defectType : 'no_road_defect';
  const confidence = Number(raw?.confidence);
  const hazardScore = Number(raw?.hazardScore);
  const estimatedRepairDays = Number(raw?.estimatedRepairDays);
  return {
    defectDetected: raw?.defectDetected === true && defectType !== 'no_road_defect',
    defectType,
    severity: SEVERITIES.includes(raw?.severity) ? raw.severity : 'Medium',
    hazardScore: Number.isFinite(hazardScore) ? Math.max(0, Math.min(100, Math.round(hazardScore))) : 0,
    confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : 0,
    aiSummary: typeof raw?.aiSummary === 'string' ? raw.aiSummary.trim().slice(0, 1000) : '',
    recommendedAction: typeof raw?.recommendedAction === 'string' ? raw.recommendedAction.trim().slice(0, 1000) : '',
    estimatedRepairDays: Number.isFinite(estimatedRepairDays) ? Math.max(0, Math.min(365, Math.round(estimatedRepairDays))) : 0,
    suggestedDepartment: typeof raw?.suggestedDepartment === 'string' ? raw.suggestedDepartment.trim().slice(0, 200) : '',
  };
}

app.post('/api/analyze-defect', requireFirebaseUser, async (req: AuthedRequest, res) => {
  try {
    const { imageBase64, photoUrl, imageUrl, mimeType = 'image/jpeg', description = '', location } = req.body || {};
    const client = getAIClient();
    if (!client) return res.status(503).json({ success: false, error: 'AI analysis is not configured on the server.' });
    const image = await resolveImage(imageBase64 || photoUrl || imageUrl, mimeType);
    if (!image) return res.status(400).json({ success: false, error: 'A valid road image is required for AI analysis.' });
    const contents: any[] = [
      { inlineData: { mimeType: image.mimeType, data: image.data } },
      `You are the image-validation gate for a civic road complaint system. Inspect the IMAGE first. The citizen description is context only and must never override what is visible. Determine whether the image clearly shows a physical road defect that a municipal road authority could inspect or repair. A normal intact road, unrelated object, person, building, food, screenshot, document, or unclear image is not a road defect. Return ONLY JSON with exactly these fields: defectDetected (boolean), defectType (one of pothole, road_crack, surface_damage, drainage_failure, debris_or_obstruction, road_marking_damage, other_road_defect, no_road_defect), severity (Critical|High|Medium|Low), hazardScore (0-100), confidence (0-1), aiSummary (string), recommendedAction (string), estimatedRepairDays (integer), suggestedDepartment (string). Use no invented measurements. If evidence is insufficient, set defectDetected=false, defectType=no_road_defect, and confidence below 0.65. Citizen description: ${String(description).slice(0, 1000)}. Location: ${String(location?.formattedAddress || location?.city || 'not supplied').slice(0, 300)}.`,
    ];
    const response = await client.models.generateContent({ model: 'gemini-3.8-flash', contents });
    const data = normalizeDefectResult(parseAiJson(response.text || ''));
    return res.json({ success: true, data });
  } catch (error: any) {
    console.error('AI defect analysis failed:', error);
    return res.status(502).json({ success: false, error: error?.message || 'AI analysis failed. No complaint was submitted.' });
  }
});

app.post('/api/verify-repair', requireFirebaseUser, async (req: AuthedRequest, res) => {
  try {
    const { beforeImageBase64, afterImageBase64, beforeImage, afterImage, beforeDescription = '', afterDescription = '', repairNotes = '' } = req.body || {};
    const beforeInput = beforeImageBase64 || beforeImage;
    const afterInput = afterImageBase64 || afterImage;
    if (!beforeInput || !afterInput) return res.status(400).json({ success: false, error: 'Both before and after repair images are required.' });
    if (beforeInput === afterInput) return res.status(422).json({ success: false, error: 'Before and after images must be different.' });
    const client = getAIClient();
    if (!client) return res.status(503).json({ success: false, error: 'AI repair verification is not configured on the server.' });
    const before = await resolveImage(beforeInput);
    const after = await resolveImage(afterInput);
    if (!before || !after) return res.status(400).json({ success: false, error: 'Both submitted images must be valid.' });
    const contents: any[] = [{ inlineData: { mimeType: before.mimeType, data: before.data } }, { inlineData: { mimeType: after.mimeType, data: after.data } }, `Compare Image 1 (before) and Image 2 (after) for a municipal road repair. Notes: before=${beforeDescription}; after=${afterDescription}; repair=${repairNotes}. Return ONLY valid JSON with isComparisonValid, status, overallScore, rejectionReason, details, stages, flags, payoutApproved. Reject a non-road after image. Do not infer image origin such as Google or AI generation solely from pixels; use observable visual evidence.`];
    const response = await client.models.generateContent({ model: 'gemini-3.8-flash', contents });
    return res.json({ success: true, data: parseAiJson(response.text || '') });
  } catch (error: any) { console.error('Repair verification failed:', error); return res.status(502).json({ success: false, error: error?.message || 'Repair verification failed.' }); }
});

app.use('/api/authority', requireFirebaseUser, requireAuthority);
app.get('/api/authority/check', (req: AuthedRequest, res) => res.json({ success: true, status: 'authorized', userId: req.firebaseUser?.uid, timestamp: new Date().toISOString() }));
app.post('/api/authority/status-update', (req: AuthedRequest, res) => {
  const { complaintId, newStatus, contractorNotes, assignedDepartment, priority } = req.body || {};
  if (!complaintId || !newStatus) return res.status(400).json({ success: false, error: 'complaintId and newStatus are required' });
  return res.json({ success: true, complaintId, newStatus, contractorNotes: contractorNotes || null, assignedDepartment: assignedDepartment || null, priority: priority || null, updatedBy: req.firebaseUser?.uid, updatedAt: new Date().toISOString() });
});
app.post('/api/authority/disburse', (_req, res) => res.status(501).json({ success: false, error: 'Escrow disbursement is not connected to a real payment provider. No funds were released.' }));
app.post('/api/authority/assign-contractor', (req: AuthedRequest, res) => {
  const { complaintId, contractorName, estimatedDays, escrowAmount } = req.body || {};
  if (!complaintId || !contractorName) return res.status(400).json({ success: false, error: 'complaintId and contractorName are required' });
  return res.json({ success: true, complaintId, contractorName, estimatedDays: estimatedDays || null, escrowAmount: escrowAmount || null, assignedBy: req.firebaseUser?.uid, assignedAt: new Date().toISOString() });
});
app.get('/api/authority/audit-log', (_req, res) => res.json({ success: true, logs: [], message: 'Audit events are read from Firestore in the authority workspace.' }));

async function startServer() {
  if (process.env.NETLIFY) return;
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`RoadSetu AI Server running on port ${PORT}`));
}

if (!process.env.NETLIFY) startServer();
export { app };
