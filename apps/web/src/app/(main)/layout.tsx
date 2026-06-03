// apps/web/src/app/(main)/layout.tsx
'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import TopHeader from '@/components/layout/TopHeader';
import BottomNav from '@/components/layout/BottomNav';
import { Sprout, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, setAuth } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Quick Login for testers
  const handleQuickLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // First try to register if not already there, otherwise just login
      try {
        await api.post('/auth/register', {
          email: 'ramesh@farmer.com',
          password: 'password123',
          name: 'Ramesh Patel',
        });
      } catch (err) {
        // Assume already registered
      }

      const res = await api.post('/auth/login', {
        email: 'ramesh@farmer.com',
        password: 'password123',
      });
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Make sure api server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { email, password });
        setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      } else {
        const res = await api.post('/auth/register', { email, password, name });
        setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Action failed. Check server connection.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    // Beautiful login visual
    return (
      <div style={styles.authContainer}>
        <div style={styles.gradientOverlay} />
        
        <div style={styles.logoWrapper}>
          <div style={styles.iconCircle}>
            <Sprout size={36} color="white" />
          </div>
          <h1 style={styles.logoText}>Crop Detector</h1>
          <p style={styles.subtitle}>AI-Powered Plant Health Diagnostics</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.formCard}>
          <h2 style={styles.formTitle}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          
          {error && <div style={styles.errorAlert}>{error}</div>}

          {!isLogin && (
            <div style={styles.inputGroup}>
              <User size={18} style={styles.inputIcon} />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <Mail size={18} style={styles.inputIcon} />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <Lock size={18} style={styles.inputIcon} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
            <ArrowRight size={18} />
          </button>

          {/* Quick Login button */}
          {isLogin && (
            <button
              type="button"
              onClick={handleQuickLogin}
              disabled={loading}
              style={styles.quickLoginBtn}
            >
              🚀 Quick Demo Login (Ramesh Patel)
            </button>
          )}

          <div style={styles.toggleText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              style={styles.toggleLink}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </span>
          </div>
        </form>
      </div>
    );
  }

  // Authenticated layout
  return (
    <div style={styles.mainLayout}>
      <TopHeader />
      <main style={styles.contentArea}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  authContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '24px',
    backgroundColor: '#0F1A12', // Premium dark green bg
    position: 'relative',
    overflow: 'hidden',
  },
  gradientOverlay: {
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(0,0,0,0) 70%)',
    pointerEvents: 'none',
  },
  logoWrapper: {
    textAlign: 'center',
    marginBottom: '32px',
    zIndex: 1,
  },
  iconCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '24px',
    backgroundColor: 'var(--color-green-500)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)',
    marginBottom: '16px',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: '28px',
    fontWeight: 800,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: '#A7C4A8',
    fontSize: '14px',
    marginTop: '6px',
  },
  formCard: {
    backgroundColor: 'rgba(26, 43, 30, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding: '24px',
    backdropFilter: 'blur(10px)',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formTitle: {
    color: '#FFFFFF',
    fontSize: '20px',
    fontWeight: 700,
    marginBottom: '8px',
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#EF4444',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '13px',
  },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    color: '#A7C4A8',
  },
  input: {
    width: '100%',
    height: '48px',
    padding: '0 16px 0 46px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    color: '#FFFFFF',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 160ms var(--ease-out)',
  },
  submitBtn: {
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
    marginTop: '8px',
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
  },
  quickLoginBtn: {
    height: '44px',
    borderRadius: '12px',
    backgroundColor: 'transparent',
    border: '1px dashed var(--color-green-500)',
    color: 'var(--color-green-500)',
    fontSize: '14px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  toggleText: {
    textAlign: 'center',
    color: '#A7C4A8',
    fontSize: '13px',
    marginTop: '8px',
  },
  toggleLink: {
    color: 'var(--color-green-500)',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  mainLayout: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  contentArea: {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: 'calc(var(--bottom-nav-height) + 16px)',
  },
};
