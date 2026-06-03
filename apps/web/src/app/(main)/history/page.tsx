// apps/web/src/app/(main)/history/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Camera, Calendar, Trash2, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ScanResponse } from '@crop-detector/types';

export default function HistoryPage() {
  const [history, setHistory] = useState<ScanResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.get('/scan/history');
        setHistory(res.data);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this scan from history?')) return;
    try {
      await api.delete(`/scan/${id}`);
      setHistory(history.filter((scan) => scan.id !== id));
    } catch (err) {
      alert('Failed to delete scan.');
    }
  };

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case 'HEALTHY': return 'var(--color-healthy)';
      case 'MILD': return 'var(--color-mild)';
      case 'MODERATE': return 'var(--color-moderate)';
      case 'SEVERE': return 'var(--color-severe)';
      default: return 'var(--color-soil-400)';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Scan History</h2>
        <p style={styles.subtitle}>All your past diagnoses and reports</p>
      </div>

      <div style={styles.list}>
        {loading ? (
          /* Shimmer loading rows */
          <div style={styles.shimmerList}>
            <div className="shimmer" style={{ height: '76px', borderRadius: '12px' }} />
            <div className="shimmer" style={{ height: '76px', borderRadius: '12px' }} />
            <div className="shimmer" style={{ height: '76px', borderRadius: '12px' }} />
          </div>
        ) : history.length === 0 ? (
          /* Empty state */
          <div style={styles.emptyCard}>
            <div style={styles.emptyIconCircle}>
              <Calendar size={32} color="var(--color-soil-400)" />
            </div>
            <h3 style={styles.emptyTitle}>No scans yet</h3>
            <p style={styles.emptyDesc}>
              Upload a picture of your plant or leaf to diagnose diseases and view recommendations.
            </p>
            <Link href="/scan" style={styles.scanBtn}>
              <Camera size={16} />
              Scan Now
            </Link>
          </div>
        ) : (
          /* History list */
          history.map((scan) => (
            <Link key={scan.id} href={`/scan/result/${scan.id}`} style={styles.item}>
              <div style={styles.itemMain}>
                {/* Thumbnail image */}
                <div style={styles.thumbnailWrapper}>
                  <img src={scan.originalImageUrl} alt="Scan thumbnail" style={styles.thumbnail} />
                </div>

                <div style={styles.details}>
                  <div style={styles.titleRow}>
                    <h3 style={styles.cropName}>{scan.cropName}</h3>
                    <span
                      style={{
                        ...styles.severityDot,
                        backgroundColor: getSeverityColor(scan.severity),
                      }}
                    />
                  </div>
                  <p style={styles.diseaseName}>
                    {scan.isHealthy ? 'Healthy Plant' : scan.diseaseName}
                  </p>
                  <span style={styles.dateText}>
                    {new Date(scan.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div style={styles.actions}>
                <button
                  onClick={(e) => handleDelete(scan.id, e)}
                  style={styles.deleteBtn}
                  aria-label="Delete scan"
                >
                  <Trash2 size={16} color="var(--color-soil-400)" />
                </button>
                <ChevronRight size={18} color="var(--color-soil-400)" />
              </div>
            </Link>
          ))
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
    gap: '16px',
  },
  header: {
    marginTop: '4px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  shimmerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  emptyCard: {
    backgroundColor: 'var(--bg-card)',
    border: '1px dashed var(--color-soil-400)',
    borderRadius: '16px',
    padding: '40px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    marginTop: '24px',
  },
  emptyIconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-soil-100)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: 700,
  },
  emptyDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    maxWidth: '240px',
  },
  scanBtn: {
    marginTop: '8px',
    backgroundColor: 'var(--color-green-500)',
    color: 'white',
    fontSize: '13px',
    fontWeight: 600,
    padding: '10px 24px',
    borderRadius: '10px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 10px rgba(34, 197, 94, 0.25)',
  },
  item: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--color-soil-200)',
    borderRadius: '12px',
    padding: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    textDecoration: 'none',
    transition: 'transform 120ms var(--ease-out)',
  },
  itemMain: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  thumbnailWrapper: {
    width: '56px',
    height: '56px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid var(--color-soil-200)',
    flexShrink: 0,
    backgroundColor: '#000000',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  cropName: {
    fontSize: '14px',
    fontWeight: 700,
  },
  severityDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  diseaseName: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  dateText: {
    fontSize: '9px',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  deleteBtn: {
    padding: '6px',
    borderRadius: '6px',
  },
};
