export type ComplaintStatus =
  | 'reported' | 'ai_analyzed' | 'routed' | 'assigned'
  | 'repair_in_progress' | 'repair_claimed' | 'verified' | 'suspicious' | 'closed';

export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface HumanLocation {
  road: string;
  area: string;
  landmark?: string;
  city: string;
  state: string;
  country?: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}

export interface VerificationModuleScore {
  name: string;
  score: number;
  passed: boolean;
  details: string;
  metricLabel: string;
  metricValue: string;
}

export interface VerificationStageItem {
  name: string;
  stageNumber: number;
  passed: boolean;
  score: number;
  status: 'passed' | 'failed' | 'warning' | 'pending';
  details: string;
  detectedScene1?: string;
  detectedScene2?: string;
}

export interface VerificationStages {
  validity: VerificationStageItem;
  semanticConsistency: VerificationStageItem;
  locationEnvironment: VerificationStageItem;
  landmarkPerspective: VerificationStageItem;
  changeDetection: VerificationStageItem;
}

export interface VerificationResult {
  complaintId: string;
  overallScore: number;
  status: 'verified' | 'suspicious' | 'needs_review' | 'rejected';
  isComparisonValid?: boolean;
  rejectionReason?: string | null;
  stages?: VerificationStages;
  modules?: {
    gpsProximity: VerificationModuleScore;
    asphaltTexture: VerificationModuleScore;
    cameraPerspective: VerificationModuleScore;
    surroundingLandmarks: VerificationModuleScore;
  };
  gpsAzimuthMatch?: number;
  gpsDeltaMeters?: number;
  textureCompactionScore?: number;
  perspectiveParallaxScore?: number;
  anchorPointsScore?: number;
  triangulatedLandmarks?: string[];
  cryptographicHash?: string;
  timestamp?: string;
  beforeLocationText?: string;
  afterLocationText?: string;
  verifiedAt?: string;
  contractorName?: string;
  contractorId?: string;
  payoutCleared?: boolean;
  payoutApproved?: boolean;
  flaggedReasons?: string[];
  fraudFlags?: string[];
  details?: string;
  recommendation?: 'approve_payout' | 'freeze_payout_and_strike' | 'request_field_audit' | 'reupload_required';
}

export interface Complaint {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  description: string;
  location: HumanLocation;
  defectType?: string;
  severity: SeverityLevel;
  hazardScore: number;
  confidence?: number;
  aiSummary?: string;
  recommendedAction?: string;
  priority: 'Urgent P1' | 'High P2' | 'Standard P3';
  department: string;
  status: ComplaintStatus;
  beforeImage: string;
  afterImage?: string | null;
  repairStatus?: string;
  escrowStatus?: string;
  createdAt: string;
  updatedAt: string;
  estimatedRepairDays: number;
  contractorClaimed?: boolean;
  contractorNotes?: string;
  verification?: VerificationResult;
}

export type UserRole = 'citizen' | 'authority' | 'municipal_officer' | 'contractor' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role?: UserRole;
  createdAt: string;
  reportsCount: number;
  verifiedRepairsCount: number;
  emailVerified?: boolean;
  phone?: string;
  citizenId?: string;
  department?: string;
  designation?: string;
  jurisdiction?: string;
  assignedWards?: string[];
  employeeId?: string;
  permissions?: string[];
  securityClearance?: string;
  auditKey?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  reportId?: string;
  title: string;
  message: string;
  type: 'submission' | 'assignment' | 'repair' | 'verification' | 'alert';
  read: boolean;
  createdAt: string;
}

export interface DuplicateCheckResult {
  hasDuplicate: boolean;
  existingComplaint?: Complaint;
  distanceMeters?: number;
}
