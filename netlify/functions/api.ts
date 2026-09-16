import express, { Request, Response, NextFunction } from 'express';
import serverless from 'serverless-http';
import { GoogleGenAI } from '@google/genai';
import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';

const app = express();
app.use(express.json({ limit: '15mb' }));

const FIREBASE_PROJECT_ID = 'gen-lang-client-0437042384';
// Firebase Web API keys are identifiers, not service-account secrets. Keep this
// value aligned with firebase-applet-config.json so a stale Netlify env var
// cannot make valid client ID tokens look invalid.
const FIREBASE_WEB_API_KEY = 'AIzaSyBRlQw7fvhjP8Wds2htBRT38hW0bUsGhU';

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

async function verifyWithFirebaseWebApi(idToken: string) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(FIREBASE_WEB_API_KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
    signal: AbortSignal.timeout(7000),
  });
  const data = await response.json().catch(() => ({})) as { users?: Array<{ localId?: string; email?: string }>; error?: { message?: string } };
  if (!response.ok) {
    console.warn('Firebase Web API token lookup rejected:', data?.error?.message || `HTTP ${response.status}`);
    return null;
  }
  const firebaseUser = data.users?.[0];
  if (!firebaseUser?.localId) return null;
  return { uid: firebaseUser.localId, email: firebaseUser.email || '' };
}

async function requireFirebaseUser(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return res.status(401).json({ success: false, error: 'Authentication required.' });
  const token = header.slice(7).trim();
  if (!token) return res.status(401).json({ success: false, error: 'Authentication required.' });

  // Validate against the exact Firebase project used by the browser first.
  // This avoids rejecting a valid client ID token because Netlify has stale or
  // mismatched Admin service-account environment variables.
  try {
    const firebaseUser = await verifyWithFirebaseWebApi(token);
    if (firebaseUser) {
      req.firebaseUser = firebaseUser;
      return next();
    }
  } catch (error) {
    console.error('Firebase Web API token validation failed:', error);
  }

  // Admin verification remains as a secondary path for environments where the
  // Web API is temporarily unavailable.
  if (firebaseAdminReady) {
    try {
      req.firebaseUser = await getAdminAuth().verifyIdToken(token, false);
      return next();
    } catch (error) {
      console.warn('Firebase Admin token verification failed:', error);
    }
  }

  return res.status(401).json({ success: false, error: `Invalid Firebase ID token for project ${FIREBASE_PROJECT_ID}. Please refresh your session and try again.` });
}

let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try { aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); }
    catch (error) { console.error('Gemini initialization failed:', error); }
  }
  return aiClient;
}

const health = (_req: Request, res: Response) => res.json({ status: 'ok', aiConfigured: Boolean(process.env.GEMINI_API_KEY), firebaseConfigured: firebaseAdminReady, timestamp: new Date().toISOString() });
app.get('/api/health', health);
app.get('/health', health);

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
    return res.json({ success: true, data: normalizeDefectResult(parseAiJson(response.text || '')) });
  } catch (error: any) {
    console.error('AI defect analysis failed:', error);
    return res.status(502).json({ success: false, error: error?.message || 'AI analysis failed. No complaint was submitted.' });
  }
});

app.post('/api/verify-repair', requireFirebaseUser, async (req: AuthedRequest, res: Response) => {
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
  } catch (error: any) {
    console.error('Repair verification failed:', error);
    return res.status(502).json({ success: false, error: error?.message || 'Repair verification failed.' });
  }
});

export const handler = serverless(app);
