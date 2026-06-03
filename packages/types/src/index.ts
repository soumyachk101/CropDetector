export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  phone: string | null;
  role: 'FARMER' | 'AGRONOMIST' | 'STUDENT' | 'ADMIN';
  language: 'EN' | 'HI' | 'BN' | 'TE' | 'TA' | 'MR' | 'KN';
  isVerified: boolean;
  isPro: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface PredictionResult {
  cropName: string;
  diseaseName: string;
  diseaseId: string;
  confidence: number;
  severity: 'HEALTHY' | 'MILD' | 'MODERATE' | 'SEVERE';
  isHealthy: boolean;
  heatmapImageUrl: string | null;
  inferenceTimeMs: number;
  predictionsJson: Array<{ class: string; confidence: number }>;
}

export interface ScanResponse {
  id: string;
  userId: string;
  fieldId: string | null;
  originalImageUrl: string;
  heatmapImageUrl: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  cropName: string | null;
  diseaseName: string | null;
  diseaseId: string | null;
  confidence: number | null;
  severity: 'HEALTHY' | 'MILD' | 'MODERATE' | 'SEVERE' | null;
  isHealthy: boolean | null;
  inferenceTimeMs: number | null;
  createdAt: string;
  report?: ReportResponse | null;
}

export interface ReportResponse {
  id: string;
  scanId: string;
  diseaseId: string | null;
  overview: string | null;
  cause: string | null;
  causeType: 'FUNGAL' | 'BACTERIAL' | 'VIRAL' | 'PEST' | 'NUTRIENT_DEFICIENCY' | 'ENVIRONMENTAL' | 'UNKNOWN' | null;
  progressionRisk: string | null;
  symptoms: string[];
  organicTreatments: string[];
  chemicalTreatments: string[];
  preventiveMeasures: string[];
  bestPractices: string[];
  affectedCropStage: string[];
  generatedAt: string;
}

export interface FieldResponse {
  id: string;
  name: string;
  location: string | null;
  areaAcres: number | null;
  cropType: string | null;
  notes: string | null;
  createdAt: string;
}

export interface WeatherWidgetData {
  temp: number;
  condition: string;
  icon: string;
  advisory: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}
