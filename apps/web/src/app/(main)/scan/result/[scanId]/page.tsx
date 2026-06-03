// apps/web/src/app/(main)/scan/result/[scanId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Eye, 
  EyeOff, 
  FileText, 
  Camera,
  AlertCircle,
  Clock
} from 'lucide-react';
import { ScanResponse } from '@crop-detector/types';

export default function ScanResultPage() {
  const router = useRouter();
  const params = useParams();
  const scanId = params.scanId as string;

  const [scan, setScan] = useState<ScanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHeatmap, setShowHeatmap] = useState(true);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function fetchScan() {
      try {
        const res = await api.get<ScanResponse>(`/scan/${scanId}`);
        setScan(res.data);
        setError('');

        // If scan is still processing, poll every 2 seconds
        if (res.data.status === 'PROCESSING' || res.data.status === 'PENDING') {
          intervalId = setTimeout(fetchScan, 2000);
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch scan results.');
        setLoading(false);
      }
    }

    fetchScan();

    return () => {
      if (intervalId) clearTimeout(intervalId);
    };
  }, [scanId]);

  const getSeverityColors = (severity: string | null | undefined) => {
    switch (severity) {
      case 'HEALTHY':
        return { bg: 'rgba(34, 197, 94, 0.1)', text: 'var(--color-healthy)', label: 'Healthy' };
      case 'MILD':
        return { bg: 'rgba(250, 204, 21, 0.15)', text: '#A16207', label: 'Mild' };
      case 'MODERATE':
        return { bg: 'rgba(249, 115, 22, 0.1)', text: 'var(--color-moderate)', label: 'Moderate' };
      case 'SEVERE':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--color-severe)', label: 'Severe' };
      default:
        return { bg: 'var(--color-soil-100)', text: 'var(--color-soil-600)', label: 'Unknown' };
    }
  };

  const getSeverityDescription = (severity: string | null | undefined) => {
    switch (severity) {
      case 'HEALTHY':
        return 'Your plant leaf looks strong and healthy! No visible disease symptoms detected. Keep up the good practices.';
      case 'MILD':
        return 'Early signs of infection detected. Prompt intervention can fully cure the crop and prevent further spread.';
      case 'MODERATE':
        return 'Established infection observed. Immediate organic or chemical treatments are required to save the yield.';
      case 'SEVERE':
        return 'Critical infection levels. The disease has spread significantly. Action must be taken immediately to prevent complete crop loss.';
      default:
        return '';
    }
  };

  if (loading && !scan) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="var(--text-primary)" />
          </button>
          <h2 style={styles.title}>Analyzing Crop</h2>
        </div>

        <div style={styles.shimmerWrapper}>
          <div className="shimmer" style={{ width: '100%', height: '280px', borderRadius: '24px' }} />
          <div className="shimmer" style={{ width: '60%', height: '24px', borderRadius: '6px', marginTop: '16px' }} />
          <div className="shimmer" style={{ width: '40%', height: '16px', borderRadius: '6px', marginTop: '8px' }} />
          <div className="shimmer" style={{ width: '100%', height: '80px', borderRadius: '16px', marginTop: '24px' }} />
          <div className="shimmer" style={{ width: '100%', height: '48px', borderRadius: '12px', marginTop: '32px' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="var(--text-primary)" />
          </button>
          <h2 style={styles.title}>Error</h2>
        </div>

        <div style={styles.errorContainer}>
          <div style={styles.errorCircle}>
            <AlertCircle size={40} color="var(--color-severe)" />
          </div>
          <h3 style={styles.errorTitle}>Analysis Failed</h3>
          <p style={styles.errorDesc}>{error}</p>
          <Link href="/scan" style={styles.retryBtn}>
            <Camera size={18} />
            Try Scanning Again
          </Link>
        </div>
      </div>
    );
  }

  if (scan && (scan.status === 'PROCESSING' || scan.status === 'PENDING')) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="var(--text-primary)" />
          </button>
          <h2 style={styles.title}>Processing</h2>
        </div>

        <div style={styles.processingContainer}>
          <div style={styles.spinnerCircle}>
            <div style={styles.spinner} />
          </div>
          <h3 style={styles.processingTitle}>AI is diagnosing your crop...</h3>
          <p style={styles.processingDesc}>We are matching the leaf patterns against our disease knowledge base.</p>
          <div style={styles.statusBox}>
            <Clock size={16} color="var(--color-soil-600)" />
            <span style={styles.statusText}>Estimated time remaining: ~3 seconds</span>
          </div>
        </div>
      </div>
    );
  }

  if (scan && scan.status === 'FAILED') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="var(--text-primary)" />
          </button>
          <h2 style={styles.title}>Failed</h2>
        </div>

        <div style={styles.errorContainer}>
          <div style={styles.errorCircle}>
            <AlertCircle size={40} color="var(--color-severe)" />
          </div>
          <h3 style={styles.errorTitle}>Unclear Leaf Image</h3>
          <p style={styles.errorDesc}>
            The AI engine could not make a confident prediction. Please make sure the leaf is centered, in focus, and has good lighting.
          </p>
          <Link href="/scan" style={styles.retryBtn}>
            <Camera size={18} />
            Retake Photo
          </Link>
        </div>
      </div>
    );
  }

  const isHealthy = scan?.isHealthy;
  const severityMeta = getSeverityColors(scan?.severity);
  const confidencePercent = scan?.confidence ? Math.round(scan.confidence * 100) : 0;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => router.push('/')} style={styles.backBtn}>
          <ArrowLeft size={20} color="var(--text-primary)" />
        </button>
        <h2 style={styles.title}>Scan Results</h2>
      </div>

      {/* Main Content (stagger-item animation wrapper) */}
      <div className="stagger-item" style={styles.content}>
        {/* Interactive Image Box */}
        <div style={styles.imageBox}>
          <img
            src={showHeatmap && scan?.heatmapImageUrl ? scan.heatmapImageUrl : scan?.originalImageUrl}
            alt="Crop leaf scan"
            style={styles.scanImage}
          />
          
          {scan?.heatmapImageUrl && !isHealthy && (
            <button 
              onClick={() => setShowHeatmap(!showHeatmap)} 
              style={styles.toggleHeatmapBtn}
            >
              {showHeatmap ? (
                <>
                  <EyeOff size={16} />
                  Hide Heatmap
                </>
              ) : (
                <>
                  <Eye size={16} />
                  Show Heatmap
                </>
              )}
            </button>
          )}

          {scan?.inferenceTimeMs && (
            <div style={styles.inferenceBadge}>
              AI Speed: {scan.inferenceTimeMs}ms
            </div>
          )}
        </div>

        {/* Diagnosis Card */}
        {isHealthy ? (
          /* Healthy Plant Layout */
          <div style={styles.healthyCard}>
            <div style={styles.healthyIconOuter}>
              <CheckCircle2 size={36} color="white" />
            </div>
            <h3 style={styles.healthyTitle}>Your {scan?.cropName} is Healthy!</h3>
            <p style={styles.healthyDesc}>
              Our AI vision model detected no signs of active disease. Your plant foliage looks strong and healthy.
            </p>
            <div style={styles.careTipsBox}>
              <h4 style={styles.tipsTitle}>💡 General Care Tips:</h4>
              <ul style={styles.tipsList}>
                <li>Maintain balanced drip irrigation to avoid waterlogging roots.</li>
                <li>Monitor leaves weekly for early signs of color change or spots.</li>
                <li>Ensure proper spacing between crops to allow adequate ventilation.</li>
              </ul>
            </div>
            <Link href="/scan" style={styles.scanAgainBtn}>
              <Camera size={18} />
              Scan Another Crop
            </Link>
          </div>
        ) : (
          /* Diseased Plant Layout */
          <div style={styles.diseaseCard}>
            {/* Title & Severity */}
            <div style={styles.diseaseHeader}>
              <div>
                <span style={styles.cropLabel}>{scan?.cropName} Crop</span>
                <h3 style={styles.diseaseName}>{scan?.diseaseName}</h3>
              </div>
              <span style={{ 
                ...styles.severityBadge, 
                backgroundColor: severityMeta.bg,
                color: severityMeta.text
              }}>
                {severityMeta.label}
              </span>
            </div>

            {/* Confidence progress meter */}
            <div style={styles.confidenceSection}>
              <div style={styles.confidenceLabels}>
                <span style={styles.confidenceTitle}>AI Confidence Score</span>
                <span style={{ ...styles.confidenceVal, color: severityMeta.text }}>
                  {confidencePercent}%
                </span>
              </div>
              <div style={styles.progressBarBg}>
                <div style={{ 
                  ...styles.progressBarFill, 
                  width: `${confidencePercent}%`,
                  backgroundColor: severityMeta.text
                }} />
              </div>
            </div>

            {/* Diagnostic Details */}
            <div style={styles.diagnosticDetails}>
              <div style={styles.detailsIconBox}>
                <AlertTriangle size={18} color="var(--color-amber)" />
              </div>
              <div style={styles.detailsTextBox}>
                <h4 style={styles.detailsTitle}>Severity Advisory</h4>
                <p style={styles.detailsDesc}>{getSeverityDescription(scan?.severity)}</p>
              </div>
            </div>

            {/* CTA to Full Report */}
            <Link href={`/report/${scan?.id}`} style={styles.reportBtn}>
              <FileText size={18} />
              View Full Treatment Report
              <Sparkles size={16} style={{ marginLeft: 'auto' }} />
            </Link>

            <Link href="/scan" style={styles.scanAgainOutline}>
              <Camera size={18} />
              Scan Another Crop
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'var(--bg-app)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
    height: 'var(--top-header-height)',
  },
  backBtn: {
    padding: '8px',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--color-soil-200)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
  },
  title: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  shimmerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flex: 1,
  },
  imageBox: {
    width: '100%',
    height: '280px',
    borderRadius: '24px',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F1A12',
    border: '1px solid var(--color-soil-200)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
  },
  scanImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  toggleHeatmapBtn: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    backgroundColor: 'rgba(15, 26, 18, 0.85)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: 'white',
    fontSize: '12px',
    fontWeight: 600,
    padding: '8px 14px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
  },
  inferenceBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#A7C4A8',
    fontSize: '10px',
    fontWeight: 600,
    padding: '4px 8px',
    borderRadius: '6px',
  },
  healthyCard: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--color-soil-200)',
    borderRadius: '24px',
    padding: '24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
  },
  healthyIconOuter: {
    width: '64px',
    height: '64px',
    borderRadius: '22px',
    backgroundColor: 'var(--color-healthy)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(34, 197, 94, 0.25)',
    marginBottom: '16px',
  },
  healthyTitle: {
    fontSize: '18px',
    fontWeight: 800,
    color: 'var(--color-green-900)',
  },
  healthyDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    marginTop: '8px',
  },
  careTipsBox: {
    width: '100%',
    backgroundColor: 'var(--color-green-50)',
    border: '1px solid var(--color-green-100)',
    borderRadius: '16px',
    padding: '16px',
    textAlign: 'left',
    marginTop: '20px',
    marginBottom: '20px',
  },
  tipsTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--color-green-900)',
  },
  tipsList: {
    fontSize: '12px',
    color: 'var(--color-green-900)',
    marginLeft: '16px',
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    lineHeight: '1.4',
  },
  scanAgainBtn: {
    width: '100%',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'var(--color-green-500)',
    color: 'white',
    fontSize: '15px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
    textDecoration: 'none',
  },
  diseaseCard: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--color-soil-200)',
    borderRadius: '24px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
  },
  diseaseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px',
  },
  cropLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  diseaseName: {
    fontSize: '18px',
    fontWeight: 800,
    marginTop: '2px',
  },
  severityBadge: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    padding: '4px 10px',
    borderRadius: '999px',
    flexShrink: 0,
  },
  confidenceSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  confidenceLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    fontWeight: 600,
  },
  confidenceTitle: {
    color: 'var(--text-secondary)',
  },
  confidenceVal: {
    fontWeight: 700,
  },
  progressBarBg: {
    width: '100%',
    height: '8px',
    backgroundColor: 'var(--color-soil-100)',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '999px',
    transition: 'width 600ms var(--ease-out)',
  },
  diagnosticDetails: {
    backgroundColor: 'var(--color-soil-50)',
    border: '1px solid var(--color-soil-200)',
    borderRadius: '16px',
    padding: '14px',
    display: 'flex',
    gap: '12px',
  },
  detailsIconBox: {
    flexShrink: 0,
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsTextBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  detailsTitle: {
    fontSize: '12px',
    fontWeight: 700,
  },
  detailsDesc: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  reportBtn: {
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'var(--color-green-500)',
    color: 'white',
    fontSize: '14px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
    textDecoration: 'none',
  },
  scanAgainOutline: {
    height: '44px',
    borderRadius: '12px',
    backgroundColor: 'transparent',
    border: '1.5px solid var(--color-green-500)',
    color: 'var(--color-green-600)',
    fontSize: '14px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    textDecoration: 'none',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '40px 20px',
    flex: 1,
    gap: '12px',
  },
  errorCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    fontSize: '18px',
    fontWeight: 800,
  },
  errorDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    maxWidth: '260px',
  },
  retryBtn: {
    marginTop: '16px',
    height: '44px',
    padding: '0 24px',
    borderRadius: '12px',
    backgroundColor: 'var(--color-green-500)',
    color: 'white',
    fontSize: '14px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    boxShadow: '0 4px 10px rgba(34, 197, 94, 0.25)',
  },
  processingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '40px 20px',
    flex: 1,
    gap: '16px',
  },
  spinnerCircle: {
    width: '72px',
    height: '72px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '3px solid var(--color-soil-200)',
    borderTopColor: 'var(--color-green-500)',
    animation: 'scanLine 1s linear infinite', // spinning fallback using animation keyframe name (since scanLine is defined in global)
  },
  processingTitle: {
    fontSize: '16px',
    fontWeight: 700,
  },
  processingDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    maxWidth: '240px',
  },
  statusBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--color-soil-100)',
    padding: '8px 16px',
    borderRadius: '10px',
    marginTop: '12px',
  },
  statusText: {
    fontSize: '11px',
    color: 'var(--color-soil-600)',
    fontWeight: 500,
  },
};
