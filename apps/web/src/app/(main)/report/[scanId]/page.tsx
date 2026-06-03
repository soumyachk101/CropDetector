// apps/web/src/app/(main)/report/[scanId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  AlertTriangle, 
  Printer, 
  Share2, 
  MessageSquare,
  Sprout,
  Calendar,
  AlertCircle,
  Activity,
  HeartHandshake
} from 'lucide-react';
import { ReportResponse, ScanResponse } from '@crop-detector/types';

export default function ReportPage() {
  const router = useRouter();
  const params = useParams();
  const scanId = params.scanId as string;

  const [report, setReport] = useState<ReportResponse | null>(null);
  const [scan, setScan] = useState<ScanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Expandable sections state
  const [organicExpanded, setOrganicExpanded] = useState(true);
  const [chemicalExpanded, setChemicalExpanded] = useState(false);

  // Symptoms interactive checklist state
  const [checkedSymptoms, setCheckedSymptoms] = useState<Record<string, boolean>>({});

  // Talk to Expert modal state
  const [expertModalOpen, setExpertModalOpen] = useState(false);

  useEffect(() => {
    async function loadReportData() {
      try {
        const [reportRes, scanRes] = await Promise.all([
          api.get<ReportResponse>(`/report/${scanId}`),
          api.get<ScanResponse>(`/scan/${scanId}`),
        ]);
        setReport(reportRes.data);
        setScan(scanRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load disease report.');
      } finally {
        setLoading(false);
      }
    }
    loadReportData();
  }, [scanId]);

  const toggleSymptom = (index: number) => {
    setCheckedSymptoms((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (!scan) return;
    const shareText = `🌾 Crop Health Alert! My ${scan.cropName} crop was diagnosed with ${scan.diseaseName} (${scan.severity} severity) using Crop Detector. Organic Treatment: ${report?.organicTreatments?.[0] || 'See full report.'}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const getUrgencyLevel = (severity: string | null) => {
    switch (severity) {
      case 'SEVERE':
        return { label: 'CRITICAL ACTION REQUIRED', color: 'var(--color-severe)', bg: 'rgba(239, 68, 68, 0.08)' };
      case 'MODERATE':
        return { label: 'HIGH URGENCY', color: 'var(--color-moderate)', bg: 'rgba(249, 115, 22, 0.08)' };
      case 'MILD':
        return { label: 'MEDIUM URGENCY', color: 'var(--color-amber)', bg: 'rgba(245, 158, 11, 0.08)' };
      default:
        return { label: 'LOW URGENCY', color: 'var(--color-healthy)', bg: 'rgba(34, 197, 94, 0.08)' };
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="var(--text-primary)" />
          </button>
          <h2 style={styles.title}>Loading Report</h2>
        </div>

        <div style={styles.shimmerWrapper}>
          <div className="shimmer" style={{ width: '40%', height: '14px', borderRadius: '4px' }} />
          <div className="shimmer" style={{ width: '100%', height: '32px', borderRadius: '8px', marginTop: '8px' }} />
          <div className="shimmer" style={{ width: '100%', height: '120px', borderRadius: '20px', marginTop: '20px' }} />
          <div className="shimmer" style={{ width: '100%', height: '150px', borderRadius: '20px', marginTop: '16px' }} />
        </div>
      </div>
    );
  }

  if (error || !report || !scan) {
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
          <h3 style={styles.errorTitle}>Could Not Load Report</h3>
          <p style={styles.errorDesc}>{error || 'The requested report does not exist or has been deleted.'}</p>
          <button onClick={() => router.back()} style={styles.retryBtn}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const urgency = getUrgencyLevel(scan.severity);

  return (
    <div style={styles.container} className="print-container">
      {/* Header (Hidden on print) */}
      <div style={styles.header} className="no-print">
        <button onClick={() => router.push(`/scan/result/${scanId}`)} style={styles.backBtn}>
          <ArrowLeft size={20} color="var(--text-primary)" />
        </button>
        <h2 style={styles.title}>Treatment Report</h2>
      </div>

      {/* Printable Report Header */}
      <div style={styles.printHeader} className="print-only">
        <h1>🌾 CROP DETECTOR - HEALTH REPORT</h1>
        <p>Generated: {new Date(report.generatedAt).toLocaleDateString()}</p>
      </div>

      {/* Main Content */}
      <div className="stagger-item" style={styles.scrollContent}>
        
        {/* Urgency Alert Bar */}
        <div style={{ ...styles.urgencyBar, backgroundColor: urgency.bg, border: `1px solid ${urgency.color}33` }}>
          <AlertCircle size={16} color={urgency.color} />
          <span style={{ ...styles.urgencyLabel, color: urgency.color }}>{urgency.label}</span>
        </div>

        {/* Intro Info Card */}
        <div style={styles.card}>
          <span style={styles.cardCropLabel}>{scan.cropName} Crop</span>
          <h2 style={styles.cardDiseaseName}>{scan.diseaseName}</h2>
          <div style={styles.causeBadgeWrapper}>
            <span style={styles.causeBadge}>
              🧬 {report.causeType} Infection
            </span>
          </div>
          <p style={styles.overviewText}>{report.overview}</p>
        </div>

        {/* Section: Cause Details */}
        <div style={styles.card}>
          <h3 style={styles.sectionHeading}>
            <Activity size={18} color="var(--color-soil-600)" />
            <span>Pathogen & Cause</span>
          </h3>
          <div style={styles.pathogenBox}>
            <span style={styles.pathogenTitle}>Causative Agent:</span>
            <span style={styles.pathogenValue}>{report.cause}</span>
          </div>
          {scan.inferenceTimeMs && (
            <p style={styles.captionText}>
              Infection details parsed from agricultural knowledge base index {report.diseaseId}.
            </p>
          )}
        </div>

        {/* Section: Progression Risk */}
        {report.progressionRisk && (
          <div style={styles.card}>
            <h3 style={styles.sectionHeading}>
              <Calendar size={18} color="var(--color-soil-600)" />
              <span>Progression Risk</span>
            </h3>
            <p style={styles.progressionText}>{report.progressionRisk}</p>
            <div style={styles.timelineContainer}>
              <div style={styles.timelineLine} />
              <div style={styles.timelineNode}>
                <div style={{ ...styles.timelineDot, backgroundColor: 'var(--color-mild)' }} />
                <span style={styles.timelineNodeLabel}>Day 1-3: Mild spots</span>
              </div>
              <div style={styles.timelineNode}>
                <div style={{ ...styles.timelineDot, backgroundColor: 'var(--color-moderate)' }} />
                <span style={styles.timelineNodeLabel}>Day 4-7: Leaf yellows</span>
              </div>
              <div style={styles.timelineNode}>
                <div style={{ ...styles.timelineDot, backgroundColor: 'var(--color-severe)' }} />
                <span style={styles.timelineNodeLabel}>Day 10+: Defoliation</span>
              </div>
            </div>
          </div>
        )}

        {/* Section: Observed Symptoms (Interactive Checklist) */}
        {report.symptoms && report.symptoms.length > 0 && (
          <div style={styles.card}>
            <h3 style={styles.sectionHeading}>
              <Check size={18} color="var(--color-soil-600)" />
              <span>Observe Symptoms</span>
            </h3>
            <p style={styles.sectionDesc}>Tap symptoms you see on your plant leaf to track severity:</p>
            <div style={styles.symptomsList}>
              {report.symptoms.map((symptom, idx) => (
                <div 
                  key={idx} 
                  onClick={() => toggleSymptom(idx)} 
                  style={{
                    ...styles.symptomItem,
                    backgroundColor: checkedSymptoms[idx] ? 'var(--color-green-50)' : 'var(--color-soil-50)',
                    border: checkedSymptoms[idx] ? '1px solid var(--color-green-200)' : '1px solid var(--color-soil-200)'
                  }}
                  className="interactive"
                >
                  <div style={{
                    ...styles.checkbox,
                    backgroundColor: checkedSymptoms[idx] ? 'var(--color-healthy)' : 'transparent',
                    borderColor: checkedSymptoms[idx] ? 'var(--color-healthy)' : 'var(--color-soil-400)'
                  }}>
                    {checkedSymptoms[idx] && <Check size={12} color="white" strokeWidth={3} />}
                  </div>
                  <span style={{
                    ...styles.symptomText,
                    textDecoration: checkedSymptoms[idx] ? 'line-through' : 'none',
                    color: checkedSymptoms[idx] ? 'var(--color-green-900)' : 'var(--text-primary)',
                    fontWeight: checkedSymptoms[idx] ? 600 : 400
                  }}>
                    {symptom}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Organic Treatments Accordion */}
        {report.organicTreatments && report.organicTreatments.length > 0 && (
          <div style={styles.card}>
            <div 
              onClick={() => setOrganicExpanded(!organicExpanded)} 
              style={styles.accordionHeader}
              className="interactive"
            >
              <h3 style={styles.accordionHeading}>
                <Sprout size={18} color="var(--color-healthy)" />
                <span>Organic Treatments (Recommended)</span>
              </h3>
              {organicExpanded ? <ChevronUp size={20} color="var(--color-soil-600)" /> : <ChevronDown size={20} color="var(--color-soil-600)" />}
            </div>
            
            {organicExpanded && (
              <div style={styles.accordionContent} className="stagger-item">
                <ol style={styles.treatmentList}>
                  {report.organicTreatments.map((treatment, idx) => (
                    <li key={idx} style={styles.treatmentItem}>
                      <span style={styles.listNumber}>{idx + 1}</span>
                      <p style={styles.treatmentText}>{treatment}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Section: Chemical Treatments Accordion */}
        {report.chemicalTreatments && report.chemicalTreatments.length > 0 && (
          <div style={styles.card}>
            <div 
              onClick={() => setChemicalExpanded(!chemicalExpanded)} 
              style={styles.accordionHeader}
              className="interactive"
            >
              <h3 style={styles.accordionHeading}>
                <AlertTriangle size={18} color="var(--color-moderate)" />
                <span>Chemical Treatments</span>
              </h3>
              {chemicalExpanded ? <ChevronUp size={20} color="var(--color-soil-600)" /> : <ChevronDown size={20} color="var(--color-soil-600)" />}
            </div>
            
            {chemicalExpanded && (
              <div style={styles.accordionContent} className="stagger-item">
                <ol style={styles.treatmentList}>
                  {report.chemicalTreatments.map((treatment, idx) => (
                    <li key={idx} style={styles.treatmentItem}>
                      <span style={{ ...styles.listNumber, backgroundColor: 'var(--color-soil-200)', color: 'var(--color-soil-800)' }}>{idx + 1}</span>
                      <p style={styles.treatmentText}>{treatment}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Section: Prevention Measures */}
        {report.preventiveMeasures && report.preventiveMeasures.length > 0 && (
          <div style={styles.card}>
            <h3 style={styles.sectionHeading}>
              <HeartHandshake size={18} color="var(--color-soil-600)" />
              <span>Prevention Checklist</span>
            </h3>
            <div style={styles.preventionList}>
              {report.preventiveMeasures.map((measure, idx) => (
                <div key={idx} style={styles.preventionItem}>
                  <div style={styles.bulletCheck}>✓</div>
                  <p style={styles.preventionText}>{measure}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Crop Stages */}
        {report.affectedCropStage && report.affectedCropStage.length > 0 && (
          <div style={styles.card}>
            <h3 style={styles.sectionHeading}>
              <Sprout size={18} color="var(--color-soil-600)" />
              <span>Vulnerable Stages</span>
            </h3>
            <div style={styles.stagesContainer}>
              {['seedling', 'vegetative', 'flowering', 'fruiting'].map((stage) => {
                const isActive = report.affectedCropStage.some(s => s.toLowerCase().includes(stage));
                return (
                  <span 
                    key={stage} 
                    style={{
                      ...styles.stageBadge,
                      backgroundColor: isActive ? 'var(--color-green-100)' : 'var(--color-soil-100)',
                      color: isActive ? 'var(--color-green-700)' : 'var(--color-soil-400)',
                      border: isActive ? '1px solid var(--color-green-500)' : '1px solid var(--color-soil-200)',
                      fontWeight: isActive ? 700 : 500
                    }}
                  >
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Disclaimer Banner */}
        <div style={styles.disclaimerCard}>
          <h4 style={styles.disclaimerTitle}>⚠️ Agricultural Officer Disclaimer</h4>
          <p style={styles.disclaimerText}>
            This analysis is AI-assisted. Recommendations should be verified locally depending on specific microclimates and soil conditions. For severe infections, consult a local KVK (Krishi Vigyan Kendra) or certified agricultural officer.
          </p>
        </div>

        {/* Actions bar (Hidden on print) */}
        <div style={styles.actionsBar} className="no-print">
          <button onClick={handlePrint} style={styles.actionBtn}>
            <Printer size={18} />
            <span>PDF Print</span>
          </button>
          
          <button onClick={handleShare} style={styles.actionBtn}>
            <Share2 size={18} />
            <span>WhatsApp</span>
          </button>
          
          <button onClick={() => setExpertModalOpen(true)} style={{ ...styles.actionBtn, backgroundColor: 'var(--color-soil-900)', color: 'white' }}>
            <MessageSquare size={18} />
            <span>Expert</span>
          </button>
        </div>

        {/* Extra scan again link */}
        <Link href="/scan" style={styles.scanAgainLink} className="no-print">
          Scan Another Crop
        </Link>
      </div>

      {/* Expert Connect Modal */}
      {expertModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setExpertModalOpen(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>🌾 Expert Connect</h3>
            <p style={styles.modalDesc}>
              Connect directly with verified Agronomists from the nearest Krishi Vigyan Kendra.
            </p>
            <div style={styles.expertContactItem}>
              <strong>👨‍🔬 Dr. Anil Kumar (Pathologist)</strong>
              <span>West Bengal Agri Univ.</span>
              <a href="tel:+919876543210" style={styles.expertTelBtn}>Call: +91 98765 43210</a>
            </div>
            <div style={styles.expertContactItem}>
              <strong>👩‍🔬 Dr. Meera Sen (KVK Officer)</strong>
              <span>Durgapur District KVK</span>
              <a href="tel:+919876543211" style={styles.expertTelBtn}>Call: +91 98765 43211</a>
            </div>
            <button onClick={() => setExpertModalOpen(false)} style={styles.modalCloseBtn}>
              Close Window
            </button>
          </div>
        </div>
      )}

      {/* CSS rules for printing */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .app-container {
            max-width: 100% !important;
            height: auto !important;
            box-shadow: none !important;
            overflow: visible !important;
          }
          .print-container {
            padding: 0 !important;
            height: auto !important;
            background-color: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          /* Keep accordions open during printing */
          ol, ul {
            display: block !important;
          }
        }
        .print-only {
          display: none;
        }
      `}</style>
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
    marginBottom: '12px',
    height: 'var(--top-header-height)',
  },
  printHeader: {
    textAlign: 'center',
    borderBottom: '2px solid black',
    paddingBottom: '8px',
    marginBottom: '20px',
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
  scrollContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flex: 1,
  },
  urgencyBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '12px',
  },
  urgencyLabel: {
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '0.5px',
  },
  card: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--color-soil-200)',
    borderRadius: '20px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)',
  },
  cardCropLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  cardDiseaseName: {
    fontSize: '20px',
    fontWeight: 800,
  },
  causeBadgeWrapper: {
    display: 'flex',
  },
  causeBadge: {
    fontSize: '11px',
    fontWeight: 600,
    backgroundColor: 'var(--color-soil-100)',
    color: 'var(--color-soil-800)',
    padding: '4px 10px',
    borderRadius: '8px',
  },
  overviewText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
  },
  sectionHeading: {
    fontSize: '14px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--color-soil-800)',
  },
  sectionDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  pathogenBox: {
    backgroundColor: 'var(--color-soil-50)',
    border: '1px solid var(--color-soil-200)',
    borderRadius: '12px',
    padding: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
  },
  pathogenTitle: {
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },
  pathogenValue: {
    fontWeight: 700,
    fontStyle: 'italic',
    color: 'var(--color-green-700)',
  },
  captionText: {
    fontSize: '10px',
    color: 'var(--text-secondary)',
    fontStyle: 'italic',
  },
  progressionText: {
    fontSize: '13px',
    lineHeight: '1.5',
  },
  timelineContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    position: 'relative',
    paddingLeft: '24px',
    marginTop: '4px',
  },
  timelineLine: {
    position: 'absolute',
    left: '8px',
    top: '4px',
    bottom: '4px',
    width: '2px',
    backgroundColor: 'var(--color-soil-200)',
  },
  timelineNode: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    position: 'relative',
  },
  timelineDot: {
    position: 'absolute',
    left: '-20px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: '2px solid var(--bg-card)',
  },
  timelineNodeLabel: {
    fontSize: '12px',
    fontWeight: 500,
  },
  symptomsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  symptomItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 120ms var(--ease-out)',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    borderRadius: '5px',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 120ms var(--ease-out)',
  },
  symptomText: {
    fontSize: '12px',
    lineHeight: '1.4',
  },
  accordionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '4px 0',
  },
  accordionHeading: {
    fontSize: '14px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  accordionContent: {
    marginTop: '12px',
    borderTop: '1px solid var(--color-soil-100)',
    paddingTop: '12px',
  },
  treatmentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  treatmentItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  listNumber: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-green-100)',
    color: 'var(--color-green-700)',
    fontSize: '11px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  treatmentText: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    lineHeight: '1.5',
  },
  preventionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  preventionItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  bulletCheck: {
    color: 'var(--color-healthy)',
    fontWeight: 700,
    fontSize: '14px',
    flexShrink: 0,
  },
  preventionText: {
    fontSize: '13px',
    lineHeight: '1.4',
  },
  stagesContainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  stageBadge: {
    fontSize: '11px',
    padding: '4px 10px',
    borderRadius: '8px',
    textTransform: 'capitalize',
  },
  disclaimerCard: {
    backgroundColor: 'var(--color-soil-100)',
    border: '1px solid var(--color-soil-200)',
    borderRadius: '16px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  disclaimerTitle: {
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--color-soil-800)',
  },
  disclaimerText: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  actionsBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    marginTop: '8px',
  },
  actionBtn: {
    height: '44px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--color-soil-200)',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    fontSize: '10px',
    fontWeight: 600,
    color: 'var(--color-soil-800)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
    transition: 'transform 120ms var(--ease-out)',
  },
  scanAgainLink: {
    height: '46px',
    borderRadius: '12px',
    border: '1.5px solid var(--color-green-500)',
    color: 'var(--color-green-600)',
    fontSize: '14px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
    marginTop: '4px',
    marginBottom: '20px',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'var(--bg-overlay)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px',
  },
  modalCard: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--color-soil-200)',
    borderRadius: '24px',
    padding: '24px',
    width: '100%',
    maxWidth: '360px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
    animation: 'slideIn 250ms var(--ease-out) forwards',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: 800,
  },
  modalDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  expertContactItem: {
    backgroundColor: 'var(--color-soil-50)',
    border: '1px solid var(--color-soil-200)',
    borderRadius: '16px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '12px',
  },
  expertTelBtn: {
    marginTop: '6px',
    backgroundColor: 'var(--color-green-500)',
    color: 'white',
    fontSize: '12px',
    fontWeight: 600,
    padding: '8px 12px',
    borderRadius: '8px',
    textDecoration: 'none',
    textAlign: 'center',
    display: 'block',
    boxShadow: '0 2px 5px rgba(34, 197, 94, 0.25)',
  },
  modalCloseBtn: {
    height: '40px',
    borderRadius: '12px',
    border: '1px solid var(--color-soil-200)',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--color-soil-600)',
    marginTop: '8px',
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
};
