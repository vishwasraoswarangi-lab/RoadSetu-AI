import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  MapPin,
  Mic,
  MicOff,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Search,
  RefreshCw,
  Lock,
  FileCheck,
  Loader2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintsContext';
import { HumanLocationCard } from '../components/HumanLocationCard';
import {
  HumanLocation,
  SeverityLevel,
  Complaint,
} from '../types';

import {
  reverseGeocodeCoords,
  searchGeocodeLocations,
  getCurrentUserLocation,
  GeocodeSearchResult,
} from '../utils/reverseGeocode';

import { NavView } from '../components/Navbar';

interface ReportPotholeViewProps {
  onNavigate: (view: NavView) => void;
  onSelectComplaintForVerification?: (
    complaint: Complaint
  ) => void;
}

const SAMPLE_PHOTOS = [
  {
    title: 'Severe Asphalt Crater',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1000&q=80',
    depth: '14.2 cm',
    suggestedSeverity: 'Critical' as SeverityLevel,
  },
  {
    title: 'Kerb-Side Waterlogged Rupture',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80',
    depth: '8.5 cm',
    suggestedSeverity: 'High' as SeverityLevel,
  },
  {
    title: 'Longitudinal Highway Fissure',
    url: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=1000&q=
