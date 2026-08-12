/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { PermissionGuard } from './components/PermissionGuard';
import { Dashboard } from './pages/Dashboard';
import { HistoryPage } from './pages/History';
import { AppsList } from './pages/AppsList';
import { AppDetail } from './pages/AppDetail';
import { SyncSettings } from './pages/SyncSettings';
import {
  hasUsageAccess,
  getUsageForDate,
  getSyncStatus,
  syncNow,
  setRetention,
} from './services/nativeUsageStats';
import { DayUsage, AppUsage, SyncStatus, RetentionDays } from './types/usage';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'apps' | 'settings'>('dashboard');
  const [selectedApp, setSelectedApp] = useState<AppUsage | null>(null);

  // Theme State with localStorage persistence
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [hasPermission, setHasPermission] = useState<boolean>(true);
  const [todayUsage, setTodayUsage] = useState<DayUsage | null>(null);
  const [yesterdayUsage, setYesterdayUsage] = useState<DayUsage | null>(null);
  const [last7DaysUsage, setLast7DaysUsage] = useState<DayUsage[]>([]);
  const [last14DaysUsage, setLast14DaysUsage] = useState<DayUsage[]>([]);
  const [syncStatus, setSyncStatusState] = useState<SyncStatus | null>(null);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgressStep, setSyncProgressStep] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Get date strings
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getOffsetDateStr = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    return d.toISOString().split('T')[0];
  };

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      // 1. Check permission
      const perm = await hasUsageAccess();
      setHasPermission(perm);

      // 2. Fetch today usage
      const todayStr = getTodayStr();
      const todayData = await getUsageForDate(todayStr);
      setTodayUsage(todayData);

      // 3. Fetch yesterday usage
      const yesterdayStr = getOffsetDateStr(1);
      const yesterdayData = await getUsageForDate(yesterdayStr);
      setYesterdayUsage(yesterdayData);

      // 4. Fetch last 14 days history
      const historyPromises: Promise<DayUsage>[] = [];
      for (let i = 0; i < 14; i++) {
        historyPromises.push(getUsageForDate(getOffsetDateStr(i)));
      }
      const history14 = await Promise.all(historyPromises);
      setLast14DaysUsage(history14);
      setLast7DaysUsage(history14.slice(0, 7));

      // 5. Sync status
      const status = await getSyncStatus();
      setSyncStatusState(status);
    } catch (e) {
      console.error('Error loading usage data:', e);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Auto reload when window regains focus (e.g. back from Usage Access settings)
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', loadData);
    window.addEventListener('offline', loadData);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', loadData);
      window.removeEventListener('offline', handleFocus);
    };
  }, [loadData]);

  // Handle manual sync trigger
  const handleSyncNow = async (customUrl?: string, customKey?: string) => {
    setIsSyncing(true);
    setSyncProgressStep('Memeriksa koneksi internet & membaca UsageStats...');

    try {
      await new Promise(r => setTimeout(r, 400));
      setSyncProgressStep('Menyimpan data terbaru ke Room SQLite Database...');

      await new Promise(r => setTimeout(r, 400));
      setSyncProgressStep('Mengirim record pending ke Supabase Remote Storage...');

      const result = await syncNow(customUrl, customKey);

      await loadData();

      if (result.success) {
        showToast(result.message || 'Sinkronisasi berhasil! Data aman di Room & Supabase.', 'success');
      } else {
        showToast(
          result.message || 'Sync gagal. Data lokal tetap aman di Room & akan dicoba kembali saat online.',
          'error'
        );
      }
    } catch (e: any) {
      showToast('Sync gagal. Data lokal tetap aman di Room SQLite.', 'error');
    } finally {
      setIsSyncing(false);
      setSyncProgressStep('');
    }
  };

  const handleUpdateRetention = async (days: RetentionDays) => {
    await setRetention(days);
    await loadData();
    showToast(`Batas penyimpanan lokal diubah ke ${days === 0 ? 'Semua Data' : days + ' Hari'}`, 'success');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-bounce">
          <div
            className={`p-4 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : 'bg-zinc-900 text-amber-300 border-amber-800'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(t) => {
          setSelectedApp(null);
          setActiveTab(t);
        }}
        syncStatus={syncStatus}
        onSyncNow={() => handleSyncNow()}
        isSyncing={isSyncing}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-16">
        {/* Permission Banner Guard */}
        <PermissionGuard
          hasAccess={hasPermission}
          onCheckAgain={loadData}
        />

        {/* Selected App Detail View */}
        {selectedApp ? (
          <AppDetail
            app={selectedApp}
            todayUsage={todayUsage}
            yesterdayUsage={yesterdayUsage}
            last7DaysUsage={last7DaysUsage}
            onBack={() => setSelectedApp(null)}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                todayUsage={todayUsage}
                yesterdayUsage={yesterdayUsage}
                last7DaysUsage={last7DaysUsage}
                last14DaysUsage={last14DaysUsage}
                onSelectApp={(app) => setSelectedApp(app)}
                onNavigateHistory={() => setActiveTab('history')}
              />
            )}

            {activeTab === 'history' && (
              <HistoryPage
                historyDays={last7DaysUsage}
                onSelectApp={(app) => setSelectedApp(app)}
                onSyncNow={() => handleSyncNow()}
                onNavigateSettings={() => setActiveTab('settings')}
              />
            )}

            {activeTab === 'apps' && (
              <AppsList
                todayUsage={todayUsage}
                onSelectApp={(app) => setSelectedApp(app)}
                onSyncNow={() => handleSyncNow()}
                onNavigateSettings={() => setActiveTab('settings')}
              />
            )}

            {activeTab === 'settings' && (
              <SyncSettings
                syncStatus={syncStatus}
                onSyncNow={handleSyncNow}
                isSyncing={isSyncing}
                syncProgressStep={syncProgressStep}
                onUpdateRetention={handleUpdateRetention}
                onRefreshData={loadData}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
