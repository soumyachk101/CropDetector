// apps/web/src/app/(main)/profile/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { User, Languages, Award, Map, LogOut, Plus, Trash2 } from 'lucide-react';
import { FieldResponse } from '@crop-detector/types';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuthStore();
  const [fields, setFields] = useState<FieldResponse[]>([]);
  const [fieldName, setFieldName] = useState('');
  const [fieldArea, setFieldArea] = useState('');
  const [cropType, setCropType] = useState('Tomato');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFields() {
      try {
        const res = await api.get('/user/fields');
        setFields(res.data);
      } catch (err) {
        console.error('Failed to load fields:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFields();
  }, []);

  const handleLanguageChange = async (lang: string) => {
    try {
      const res = await api.patch('/user/profile', { language: lang });
      updateUser({ language: res.data.language });
      alert(`Language updated to: ${lang}`);
    } catch (err) {
      alert('Failed to update language.');
    }
  };

  const handleUpgrade = async () => {
    try {
      const res = await api.patch('/user/profile', { isPro: true });
      updateUser({ isPro: res.data.isPro });
      alert('🌟 Thank you for upgrading to Pro! Premium advisory and Unlimited scans are unlocked.');
    } catch (err) {
      alert('Failed to upgrade.');
    }
  };

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName) return;
    try {
      const res = await api.post('/user/fields', {
        name: fieldName,
        areaAcres: fieldArea ? Number(fieldArea) : null,
        cropType,
      });
      setFields([res.data, ...fields]);
      setFieldName('');
      setFieldArea('');
    } catch (err) {
      alert('Failed to create farm field.');
    }
  };

  return (
    <div style={styles.container}>
      {/* User Info Details */}
      <div style={styles.profileHeader}>
        <div style={styles.avatarWrapper}>
          <User size={36} color="var(--color-green-700)" />
        </div>
        <div style={styles.userInfo}>
          <h2 style={styles.userName}>{user?.name}</h2>
          <p style={styles.userEmail}>{user?.email}</p>
          <span style={user?.isPro ? styles.proBadge : styles.freeBadge}>
            {user?.isPro ? '⭐ Pro Member' : 'Free Account'}
          </span>
        </div>
      </div>

      {/* Pro Membership Banner */}
      {!user?.isPro && (
        <div style={styles.proBanner}>
          <div style={styles.bannerInfo}>
            <Award size={24} color="var(--color-amber)" />
            <div>
              <h3 style={styles.bannerTitle}>Upgrade to Pro</h3>
              <p style={styles.bannerDesc}>Unlock detailed crop analytics and weather warnings.</p>
            </div>
          </div>
          <button onClick={handleUpgrade} style={styles.upgradeBtn}>
            Upgrade
          </button>
        </div>
      )}

      {/* Language Prefs */}
      <div style={styles.card}>
        <h3 style={styles.cardHeader}>
          <Languages size={18} />
          <span>App Language</span>
        </h3>
        <div style={styles.languagesRow}>
          {[
            { code: 'EN', name: 'English' },
            { code: 'HI', name: 'Hindi' },
            { code: 'BN', name: 'Bengali' },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              style={{
                ...styles.langBtn,
                backgroundColor: user?.language === lang.code ? 'var(--color-green-100)' : 'var(--color-soil-50)',
                color: user?.language === lang.code ? 'var(--color-green-700)' : 'var(--color-soil-800)',
                border: user?.language === lang.code ? '1.5px solid var(--color-green-500)' : '1px solid var(--color-soil-200)',
              }}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* Fields Management */}
      <div style={styles.card}>
        <h3 style={styles.cardHeader}>
          <Map size={18} />
          <span>My Farm Fields</span>
        </h3>
        
        {/* Create Form */}
        <form onSubmit={handleCreateField} style={styles.fieldForm}>
          <div style={styles.formRow}>
            <input
              type="text"
              placeholder="Field Name"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              style={styles.fieldInput}
              required
            />
            <input
              type="number"
              placeholder="Acres (opt)"
              value={fieldArea}
              onChange={(e) => setFieldArea(e.target.value)}
              style={{ ...styles.fieldInput, width: '90px' }}
            />
          </div>
          <div style={styles.formRow}>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              style={styles.fieldSelect}
            >
              <option>Tomato</option>
              <option>Potato</option>
              <option>Rice</option>
              <option>Wheat</option>
            </select>
            <button type="submit" style={styles.addBtn}>
              <Plus size={16} />
              Add
            </button>
          </div>
        </form>

        {/* Fields list */}
        <div style={styles.fieldsList}>
          {loading ? (
            <div className="shimmer" style={{ height: '50px', borderRadius: '10px' }} />
          ) : fields.length === 0 ? (
            <p style={styles.emptyFieldsText}>No farm fields added yet.</p>
          ) : (
            fields.map((field) => (
              <div key={field.id} style={styles.fieldItem}>
                <div>
                  <h4 style={styles.fieldNameText}>{field.name}</h4>
                  <p style={styles.fieldMetaText}>
                    {field.cropType} • {field.areaAcres ? `${field.areaAcres} Acres` : 'Size unknown'}
                  </p>
                </div>
                <div style={{ color: 'var(--color-soil-400)', fontSize: '12px' }}>✓ Saved</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Logout button */}
      <button onClick={() => logout()} style={styles.logoutBtn}>
        <LogOut size={18} />
        <span>Logout</span>
      </button>
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
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 4px',
  },
  avatarWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '20px',
    backgroundColor: 'var(--color-green-50)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1.5px solid var(--color-green-100)',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  userName: {
    fontSize: '18px',
    fontWeight: 700,
  },
  userEmail: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  freeBadge: {
    alignSelf: 'flex-start',
    fontSize: '10px',
    fontWeight: 600,
    backgroundColor: 'var(--color-soil-100)',
    color: 'var(--color-soil-600)',
    padding: '2px 8px',
    borderRadius: '6px',
    marginTop: '4px',
  },
  proBadge: {
    alignSelf: 'flex-start',
    fontSize: '10px',
    fontWeight: 600,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: '#D97706',
    padding: '2px 8px',
    borderRadius: '6px',
    marginTop: '4px',
  },
  proBanner: {
    backgroundColor: '#FAF5FF',
    border: '1.5px solid #E9D5FF',
    borderRadius: '16px',
    padding: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  bannerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  bannerTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#6B21A8',
  },
  bannerDesc: {
    fontSize: '11px',
    color: '#7C3AED',
    marginTop: '2px',
    lineHeight: '1.4',
    maxWidth: '180px',
  },
  upgradeBtn: {
    backgroundColor: '#7C3AED',
    color: 'white',
    fontSize: '12px',
    fontWeight: 600,
    padding: '8px 14px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(124, 58, 237, 0.25)',
  },
  card: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--color-soil-200)',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardHeader: {
    fontSize: '14px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--color-soil-600)',
  },
  languagesRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  langBtn: {
    height: '36px',
    fontSize: '12px',
    fontWeight: 600,
    borderRadius: '8px',
  },
  fieldForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: 'var(--color-soil-50)',
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid var(--color-soil-200)',
  },
  formRow: {
    display: 'flex',
    gap: '8px',
  },
  fieldInput: {
    flex: 1,
    height: '36px',
    borderRadius: '8px',
    border: '1px solid var(--color-soil-200)',
    padding: '0 10px',
    fontSize: '13px',
    backgroundColor: 'var(--bg-card)',
    outline: 'none',
  },
  fieldSelect: {
    flex: 1,
    height: '36px',
    borderRadius: '8px',
    border: '1px solid var(--color-soil-200)',
    padding: '0 10px',
    fontSize: '13px',
    backgroundColor: 'var(--bg-card)',
    outline: 'none',
  },
  addBtn: {
    width: '80px',
    height: '36px',
    backgroundColor: 'var(--color-green-500)',
    color: 'white',
    fontSize: '13px',
    fontWeight: 600,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    boxShadow: '0 2px 5px rgba(34, 197, 94, 0.2)',
  },
  fieldsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '4px',
  },
  emptyFieldsText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    padding: '12px 0',
  },
  fieldItem: {
    backgroundColor: 'var(--color-soil-50)',
    borderRadius: '10px',
    padding: '10px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid var(--color-soil-200)',
  },
  fieldNameText: {
    fontSize: '13px',
    fontWeight: 700,
  },
  fieldMetaText: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  logoutBtn: {
    height: '44px',
    borderRadius: '12px',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: 'var(--color-severe)',
    fontSize: '14px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '8px',
  },
};
