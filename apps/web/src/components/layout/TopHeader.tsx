// apps/web/src/components/layout/TopHeader.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon, Bell } from 'lucide-react';

export default function TopHeader() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark';
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  return (
    <header style={styles.header}>
      <div style={styles.brand}>
        <span style={styles.logo}>🌾</span>
        <h1 style={styles.title}>CropDetector</h1>
      </div>

      <div style={styles.actions}>
        <button onClick={toggleTheme} style={styles.themeToggle} aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={20} color="var(--color-soil-600)" /> : <Sun size={20} color="var(--color-green-100)" />}
        </button>
        <button style={styles.actionBtn}>
          <Bell size={20} color="var(--text-secondary)" />
        </button>
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    height: 'var(--top-header-height)',
    borderBottom: '1px solid var(--color-soil-200)',
    backgroundColor: 'var(--bg-card)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    zIndex: 100,
    boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logo: {
    fontSize: '20px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 800,
    letterSpacing: '-0.5px',
    color: 'var(--text-primary)',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  themeToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px',
    borderRadius: '8px',
    backgroundColor: 'var(--color-soil-50)',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px',
    borderRadius: '8px',
    backgroundColor: 'var(--color-soil-50)',
  },
};
