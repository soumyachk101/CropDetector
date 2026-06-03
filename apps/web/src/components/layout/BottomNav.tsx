// apps/web/src/components/layout/BottomNav.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, User, Camera } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'History', href: '/history', icon: ClipboardList },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav style={styles.navContainer}>
      <div style={styles.navInner}>
        {/* Home Tab */}
        <Link href="/" style={pathname === '/' ? styles.activeItem : styles.inactiveItem}>
          <Home size={20} />
          <span style={styles.label}>Home</span>
        </Link>

        {/* Floating Scan Button (Emil Kowalski feedback feedback) */}
        <Link href="/scan" style={styles.scanButton}>
          <Camera size={22} color="white" />
        </Link>

        {/* History Tab */}
        <Link href="/history" style={pathname === '/history' ? styles.activeItem : styles.inactiveItem}>
          <ClipboardList size={20} />
          <span style={styles.label}>History</span>
        </Link>

        {/* Profile Tab */}
        <Link href="/profile" style={pathname === '/profile' ? styles.activeItem : styles.inactiveItem}>
          <User size={20} />
          <span style={styles.label}>Profile</span>
        </Link>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  navContainer: {
    height: 'var(--bottom-nav-height)',
    borderTop: '1px solid var(--color-soil-200)',
    backgroundColor: 'var(--bg-card)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
  },
  navInner: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '0 10px',
    position: 'relative',
  },
  inactiveItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textDecoration: 'none',
    color: 'var(--color-soil-400)',
    fontSize: 'var(--text-xs)',
    gap: '3px',
  },
  activeItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textDecoration: 'none',
    color: 'var(--color-green-600)',
    fontSize: 'var(--text-xs)',
    gap: '3px',
    fontWeight: 600,
  },
  label: {
    fontSize: '10px',
    marginTop: '2px',
  },
  scanButton: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-green-500)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
    border: '4px solid var(--bg-card)',
    transition: 'transform 120ms var(--ease-out)',
  },
};
