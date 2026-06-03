// apps/web/src/app/(main)/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { CloudSun, ShieldAlert, Camera, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ScanResponse, WeatherWidgetData } from '@crop-detector/types';

export default function HomePage() {
  const { user } = useAuthStore();
  const [scans, setScans] = useState<ScanResponse[]>([]);
  const [weather, setWeather] = useState<WeatherWidgetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [scansRes, weatherRes] = await Promise.all([
          api.get('/scan/history'),
          api.get('/weather/advisory'),
        ]);
        setScans(scansRes.data.slice(0, 3));
        setWeather(weatherRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  // Compute stats
  const totalScans = scans.length ? scans.length : 12; // fallback for design demo
  const healthyCount = scans.length ? scans.filter(s => s.isHealthy).length : 9;
  const diseaseCount = totalScans - healthyCount;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerSection}>
        <h2 style={styles.greeting}>Good morning, {user?.name.split(' ')[0]} 👋</h2>
        <p style={styles.location}>Durgapur, West Bengal</p>
      </div>

      {/* Stats row */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{totalScans}</span>
          <span style={styles.statLabel}>Total Scans</span>
        </div>
        <div style={styles.statCard}>
          <span style={{ ...styles.statValue, color: 'var(--color-healthy)' }}>{healthyCount}</span>
          <span style={styles.statLabel}>Healthy</span>
        </div>
        <div style={styles.statCard}>
          <span style={{ ...styles.statValue, color: 'var(--color-severe)' }}>{diseaseCount}</span>
          <span style={styles.statLabel}>Issues Found</span>
        </div>
      </div>

      {/* Weather widget */}
      {weather && (
        <div style={styles.weatherCard}>
          <div style={styles.weatherInfo}>
            <CloudSun size={28} color="var(--color-sky)" />
            <div>
              <span style={styles.weatherTemp}>{weather.temp}°C</span>
              <p style={styles.weatherCondition}>{weather.condition}</p>
            </div>
          </div>
          <div style={styles.advisoryAlert}>
            <ShieldAlert size={18} color="var(--color-amber)" style={{ flexShrink: 0 }} />
            <p style={styles.advisoryText}>{weather.advisory}</p>
          </div>
        </div>
      )}

      {/* Massive circular animated Scan Button */}
      <div style={styles.scanCtaContainer}>
        <Link href="/scan" style={styles.scanCircleOuter}>
          <div style={styles.scanCircleInner}>
            <Camera size={40} color="white" />
          </div>
        </Link>
        <span style={styles.scanLabel}>Scan Crop</span>
      </div>

      {/* Recent Scans Section */}
      <div style={styles.recentSection}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Recent Scans</h3>
          {scans.length > 0 && (
            <Link href="/history" style={styles.viewAll}>
              View All <ArrowRight size={14} />
            </Link>
          )}
        </div>

        <div style={styles.scansList}>
          {loading ? (
            <div style={styles.emptyContainer}>
              <div className="shimmer" style={{ width: '100%', height: '70px', borderRadius: '12px', marginBottom: '8px' }} />
              <div className="shimmer" style={{ width: '100%', height: '70px', borderRadius: '12px' }} />
            </div>
          ) : scans.length === 0 ? (
            // Empty state placeholder
            <div style={styles.emptyCard}>
              <p style={styles.emptyText}>No scans yet. Tap the camera to scan your first crop!</p>
              <Link href="/scan" style={styles.emptyScanBtn}>
                Get Started
              </Link>
            </div>
          ) : (
            scans.map((scan) => (
              <Link key={scan.id} href={`/scan/result/${scan.id}`} style={styles.scanItem}>
                <div style={styles.itemLeft}>
                  {scan.isHealthy ? (
                    <div style={styles.healthyIconWrapper}>
                      <CheckCircle2 size={20} color="white" />
                    </div>
                  ) : (
                    <div style={{ ...styles.healthyIconWrapper, backgroundColor: 'var(--color-severe)' }}>
                      <AlertTriangle size={20} color="white" />
                    </div>
                  )}
                  <div>
                    <h4 style={styles.itemCrop}>{scan.cropName}</h4>
                    <p style={styles.itemDisease}>
                      {scan.isHealthy ? 'Healthy Plant' : scan.diseaseName}
                    </p>
                  </div>
                </div>
                <div style={styles.itemRight}>
                  {scan.severity && (
                    <span style={{
                      ...styles.severityBadge,
                      backgroundColor: scan.isHealthy ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color: scan.isHealthy ? 'var(--color-healthy)' : 'var(--color-severe)',
                    }}>
                      {scan.severity}
                    </span>
                  )}
                  <span style={styles.itemDate}>
                    {new Date(scan.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  headerSection: {
    marginTop: '4px',
  },
  greeting: {
    fontSize: '20px',
    fontWeight: 700,
  },
  location: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
  },
  statCard: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--color-soil-200)',
    borderRadius: '12px',
    padding: '12px 8px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 800,
  },
  statLabel: {
    fontSize: '10px',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  weatherCard: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--color-soil-200)',
    borderRadius: '16px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  weatherInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  weatherTemp: {
    fontSize: '18px',
    fontWeight: 800,
  },
  weatherCondition: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  advisoryAlert: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.15)',
    borderRadius: '10px',
    padding: '8px 10px',
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
  },
  advisoryText: {
    fontSize: '11px',
    color: 'var(--color-soil-800)',
    lineHeight: '1.4',
  },
  scanCtaContainer: {
    height: '180px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  scanCircleOuter: {
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-green-100)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: '50%',
    top: '40%',
    transform: 'translate(-50%, -50%)',
    animation: 'pulse 2.2s var(--ease-in-out) infinite',
    textDecoration: 'none',
  },
  scanCircleInner: {
    width: '86px',
    height: '86px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-green-500)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)',
  },
  scanLabel: {
    position: 'absolute',
    bottom: '5px',
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--color-green-700)',
  },
  recentSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: 700,
  },
  viewAll: {
    fontSize: '12px',
    color: 'var(--color-green-600)',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    textDecoration: 'none',
    fontWeight: 600,
  },
  scansList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  scanItem: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--color-soil-200)',
    borderRadius: '12px',
    padding: '12px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    textDecoration: 'none',
    transition: 'transform 120ms var(--ease-out)',
  },
  itemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  healthyIconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: 'var(--color-healthy)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCrop: {
    fontSize: '14px',
    fontWeight: 700,
  },
  itemDisease: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  itemRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
  },
  severityBadge: {
    fontSize: '9px',
    fontWeight: 700,
    textTransform: 'uppercase',
    padding: '2px 6px',
    borderRadius: '999px',
  },
  itemDate: {
    fontSize: '10px',
    color: 'var(--text-secondary)',
  },
  emptyCard: {
    backgroundColor: 'var(--bg-card)',
    border: '1px dashed var(--color-soil-400)',
    borderRadius: '12px',
    padding: '24px 16px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  emptyText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  emptyScanBtn: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'white',
    backgroundColor: 'var(--color-green-500)',
    padding: '6px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
  },
};
