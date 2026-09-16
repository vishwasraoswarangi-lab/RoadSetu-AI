import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

/**
 * Keeps the existing report UI intact while hardening the two critical client
 * decisions at build time: AI failures must stop submission, and a citizen's
 * nearby report is only a duplicate when the AI-confirmed defect is materially
 * the same. This is deliberately source-local so the production UI and dev
 * server use identical behavior.
 */
function hardenReportFlow(): Plugin {
  return {
    name: 'roadsetu-report-flow-hardening',
    transform(code, id) {
      if (id.endsWith('/src/views/ReportPotholeView.tsx')) {
        let next = code;

        next = next.replace(
          "import { NavView } from '../components/Navbar';",
          "import { NavView } from '../components/Navbar';\nimport { apiFetch } from '../lib/apiClient';"
        );

        next = next.replace(
          "const [photoUrl, setPhotoUrl] = useState<string>(SAMPLE_PHOTOS[0].url);",
          "const [photoUrl, setPhotoUrl] = useState<string>('');"
        );

        next = next.replace(
          "const [description, setDescription] = useState(\n    'Significant cavity on road causing dangerous vehicle swerves. Water accumulated and high safety risk.'\n  );",
          "const [description, setDescription] = useState('');"
        );

        next = next.replace(
          "const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel>('Critical');",
          "const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel>('High');"
        );

        next = next.replace(
          "const runAiAnalysisAndSubmit = async (overrideDuplicate = false) => {",
          "const runAiAnalysisAndSubmit = async (_overrideDuplicate = false) => {"
        );

        const start = next.indexOf("  const runAiAnalysisAndSubmit = async (_overrideDuplicate = false) => {");
        const end = next.indexOf("\n  // If user is not authenticated, show requirement sign-in gate", start);
        if (start !== -1 && end !== -1) {
          const hardenedFunction = `  const runAiAnalysisAndSubmit = async (_overrideDuplicate = false) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (!base64Image && !photoUrl) {
      showToast('Upload or capture a real road image before continuing.', 'error');
      return;
    }
    if (!Number.isFinite(Number(humanLocation.latitude)) || !Number.isFinite(Number(humanLocation.longitude))) {
      showToast('A valid report location is required before submission.', 'error');
      return;
    }

    setDuplicateWarning(null);
    setIsAiAnalyzing(true);

    try {
      const response = await apiFetch('/api/analyze-defect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image || photoUrl,
          description,
          location: humanLocation,
        }),
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json?.success || !json?.data) {
        throw new Error(json?.error || 'AI could not validate this road image.');
      }

      const data = json.data;
      const defectDetected = data.defectDetected === true;
      const confidence = Number(data.confidence);
      const defectType = String(data.defectType || '').trim();
      const severity = String(data.severity || '').trim() as SeverityLevel;

      if (!defectDetected) {
        setAiDetails({ defectType: defectType || 'No road defect detected', confidence: Number.isFinite(confidence) ? confidence : 0, aiSummary: data.aiSummary, recommendedAction: data.recommendedAction });
        showToast('This image does not show a clear pothole or road defect. Please upload a clearer road-defect photo.', 'error');
        return;
      }
      if (!Number.isFinite(confidence) || confidence < 0.65) {
        setAiDetails({ defectType, confidence: Number.isFinite(confidence) ? confidence : 0, aiSummary: data.aiSummary, recommendedAction: data.recommendedAction });
        showToast('The image is too unclear for reliable validation. Please upload a clearer photo.', 'error');
        return;
      }

      const analyzedSeverity: SeverityLevel = ['Critical', 'High', 'Medium', 'Low'].includes(severity) ? severity : selectedSeverity;
      const analyzedHazard = Math.max(0, Math.min(100, Number(data.hazardScore) || 0));
      const aiSummary = String(data.aiSummary || 'Road defect verified by AI vision analysis.');
      const recommendedAction = String(data.recommendedAction || 'Route to the responsible road authority for inspection.');

      setAiDetails({
        defectType,
        hazardScore: analyzedHazard,
        confidence,
        aiSummary,
        recommendedAction,
      });

      // Duplicate decisions happen only after AI has identified the actual defect.
      // A same-user nearby report is blocked only when its defect type materially matches.
      const dupCheck = checkForDuplicates(humanLocation.latitude, humanLocation.longitude);
      const existingType = String(dupCheck.existingComplaint?.defectType || '').toLowerCase().trim();
      const incomingType = defectType.toLowerCase().trim();
      const sameDefect = Boolean(existingType && incomingType && (existingType === incomingType || existingType.includes(incomingType) || incomingType.includes(existingType)));

      if (dupCheck.isOwnComplaint && dupCheck.existingComplaint && sameDefect) {
        setDuplicateWarning({
          hasDuplicate: true,
          existing: dupCheck.existingComplaint,
          distance: dupCheck.distanceMeters,
        });
        showToast('You already reported this same nearby defect. Open the existing report or add evidence.', 'info');
        return;
      }

      const created = await addComplaint({
        description,
        location: humanLocation,
        beforeImage: photoUrl,
        severity: analyzedSeverity,
        defectType,
        hazardScore: analyzedHazard,
        confidence,
        aiSummary,
        recommendedAction,
        estimatedRepairDays: Number(data.estimatedRepairDays) || (analyzedSeverity === 'Critical' ? 1 : 2),
        department: String(data.suggestedDepartment || (humanLocation.road.toLowerCase().includes('highway')
          ? 'National Highway Authority (NHAI)'
          : \\`${humanLocation.city || 'Municipal'} Road Engineering Division\\`)),
      });

      setGeneratedComplaint(created);
      setAiAnalysisComplete(true);
    } catch (error) {
      console.error('RoadSetu AI validation failed:', error);
      showToast(error instanceof Error ? error.message : 'AI validation failed. No complaint was submitted.', 'error');
    } finally {
      setIsAiAnalyzing(false);
    }
  };`;
          next = next.slice(0, start) + hardenedFunction + next.slice(end);
        }

        // Remove the hard-coded demo location fallback. A report must use a real
        // GPS/network/search/manual location instead of silently using Thane.
        next = next.replace(
          /\\s*\/\/ Set fallback to default Thane\\/Mumbai location[\\s\\S]*?setLocationSuccessText\('Corridor default set'\);/,
          "\n          setLocationError(res.errorMessage || 'Unable to determine your location. Please enable location or choose a location manually.');\n          setLocationSuccessText('Location required');"
        );

        return { code: next, map: null };
      }

      if (id.endsWith('/src/context/ComplaintsContext.tsx')) {
        const next = code.replace(
          "if (latestDuplicate.hasDuplicate && latestDuplicate.existingComplaint?.userId === user.uid) {\n      throw new Error('You already reported a nearby issue. Open the existing report or add evidence instead.');\n    }",
          "const existingType = String(latestDuplicate.existingComplaint?.defectType || '').toLowerCase().trim();\n    const incomingType = String(data.defectType || '').toLowerCase().trim();\n    const sameDefect = Boolean(existingType && incomingType && (existingType === incomingType || existingType.includes(incomingType) || incomingType.includes(existingType)));\n    if (latestDuplicate.hasDuplicate && latestDuplicate.existingComplaint?.userId === user.uid && sameDefect) {\n      throw new Error('You already reported this same nearby defect. Open the existing report or add evidence instead.');\n    }"
        );
        return { code: next, map: null };
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), hardenReportFlow()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
