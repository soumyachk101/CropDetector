// apps/web/src/app/(main)/scan/page.tsx
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Camera, Upload, AlertCircle, X, Check, Search } from 'lucide-react';

export default function ScanPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [progressText, setProgressText] = useState('Uploading image...');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setError('');
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setProcessing(true);
    setError('');
    setProgressText('Uploading image...');

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      // Simulate pipeline phases for visual immersion (Emil Kowalski guidelines)
      setTimeout(() => setProgressText('Verifying image quality...'), 1000);
      setTimeout(() => setProgressText('Running leaf classification...'), 2000);
      setTimeout(() => setProgressText('Generating localized report...'), 3000);

      const res = await api.post('/scan/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Navigate to results
      router.push(`/scan/result/${res.data.id}`);
    } catch (err: any) {
      setProcessing(false);
      setError(
        err.response?.data?.message || 'Inference failed. Check image quality and size (max 10MB).'
      );
    }
  };

  return (
    <div style={styles.container}>
      {processing ? (
        /* Processing/Scanning Screen (from 05_App_Flow.md) */
        <div style={styles.processingWrapper}>
          {previewUrl && (
            <div style={{ ...styles.previewBox, backgroundImage: `url(${previewUrl})` }}>
              <div style={styles.scanningOverlay}>
                <div className="scan-line" style={styles.scanLine} />
              </div>
            </div>
          )}
          <div style={styles.processingMeta}>
            <div style={styles.spinner} />
            <h3 style={styles.processingTitle}>{progressText}</h3>
            <p style={styles.processingDesc}>AI is reading your leaves</p>
          </div>
        </div>
      ) : (
        /* Camera / Upload selection screen */
        <div style={styles.mainWrapper}>
          <div style={styles.header}>
            <h2 style={styles.title}>Scan Crop</h2>
            <p style={styles.subtitle}>Hold camera 15-30cm from the leaf</p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <AlertCircle size={18} color="var(--color-severe)" style={{ flexShrink: 0 }} />
              <span style={styles.errorText}>{error}</span>
            </div>
          )}

          {!previewUrl ? (
            /* DND Area */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={styles.dropzone}
            >
              <div style={styles.dropzoneContent}>
                <div style={styles.iconCircle}>
                  <Camera size={36} color="var(--color-green-600)" />
                </div>
                <h4 style={styles.dropTitle}>Take Photo or Upload</h4>
                <p style={styles.dropDesc}>Supports JPEG, PNG and WEBP up to 10MB</p>
                <button type="button" style={styles.browseBtn}>
                  Browse Gallery
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            /* Image preview area before analysis */
            <div style={styles.previewContainer}>
              <div style={styles.previewFrame}>
                <img src={previewUrl} alt="Preview" style={styles.previewImage} />
                <button onClick={handleClear} style={styles.closeBtn}>
                  <X size={20} color="white" />
                </button>
              </div>

              <div style={styles.cropTips}>
                <div style={styles.tipRow}>
                  <Check size={14} color="var(--color-healthy)" />
                  <span>Crop leaf is centered and in-focus</span>
                </div>
                <div style={styles.tipRow}>
                  <Check size={14} color="var(--color-healthy)" />
                  <span>Adequate daylight illumination</span>
                </div>
              </div>

              <button onClick={handleAnalyze} style={styles.analyzeBtn}>
                <Search size={18} />
                Analyze Crop Health
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  mainWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flex: 1,
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
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    borderRadius: '12px',
    padding: '12px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  errorText: {
    fontSize: '12px',
    color: 'var(--color-severe)',
    fontWeight: 500,
    lineHeight: '1.4',
  },
  dropzone: {
    flex: 1,
    border: '2px dashed var(--color-soil-400)',
    borderRadius: '20px',
    backgroundColor: 'var(--bg-card)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px',
    cursor: 'pointer',
    minHeight: '260px',
  },
  dropzoneContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '12px',
  },
  iconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '20px',
    backgroundColor: 'var(--color-green-50)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropTitle: {
    fontSize: '16px',
    fontWeight: 700,
  },
  dropDesc: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    maxWidth: '200px',
    lineHeight: '1.5',
  },
  browseBtn: {
    marginTop: '4px',
    backgroundColor: 'var(--color-green-500)',
    color: 'white',
    fontSize: '13px',
    fontWeight: 600,
    padding: '8px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(34, 197, 94, 0.2)',
  },
  previewContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  previewFrame: {
    position: 'relative',
    flex: 1,
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid var(--color-soil-200)',
    backgroundColor: '#000000',
    minHeight: '240px',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  closeBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropTips: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: 'var(--color-green-50)',
    border: '1px solid var(--color-green-100)',
    borderRadius: '12px',
    padding: '12px',
  },
  tipRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: 'var(--color-green-900)',
    fontWeight: 500,
  },
  analyzeBtn: {
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
    boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
  },
  processingWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewBox: {
    width: '260px',
    height: '260px',
    borderRadius: '24px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '4px',
    backgroundColor: 'var(--color-green-500)',
    boxShadow: '0 0 10px var(--color-green-500)',
    animation: 'scanLine 2.2s linear infinite',
  },
  processingMeta: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '3px solid var(--color-soil-200)',
    borderTopColor: 'var(--color-green-500)',
    animation: 'scanLine 1s linear infinite', // spinning animation fallback
  },
  processingTitle: {
    fontSize: '16px',
    fontWeight: 700,
  },
  processingDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
};
