import React, { useState } from 'react';
import { SyncStatus, RetentionDays } from '../types/usage';
import { updateSupabaseConfig, SUPABASE_SQL_SCHEMA } from '../services/supabaseClient';
import { formatDateIndonesian } from '../lib/formatters';
import { MockUsageStatsProvider } from '../services/mockUsageStats';
import {
  RefreshCw,
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  HardDrive,
  Globe,
  Clock,
  ShieldCheck,
  Settings as SettingsIcon,
  Code
} from 'lucide-react';

interface SyncSettingsProps {
  syncStatus: SyncStatus | null;
  onSyncNow: (customUrl?: string, customKey?: string) => Promise<void>;
  isSyncing: boolean;
  syncProgressStep: string;
  onUpdateRetention: (days: RetentionDays) => void;
  onRefreshData: () => void;
}

export const SyncSettings: React.FC<SyncSettingsProps> = ({
  syncStatus,
  onSyncNow,
  isSyncing,
  syncProgressStep,
  onUpdateRetention,
  onRefreshData,
}) => {
  const [supabaseUrl, setSupabaseUrl] = useState<string>(
    import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('stats_ku_supabase_url') || ''
  );
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>(
    import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('stats_ku_supabase_key') || ''
  );

  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseConfig(supabaseUrl, supabaseAnonKey);
    setSaveSuccessMsg('Konfigurasi Supabase berhasil disimpan!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
    onRefreshData();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleManualSyncClick = async () => {
    await onSyncNow(supabaseUrl, supabaseAnonKey);
  };

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Pengaturan Sinkronisasi & Local Storage
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Arsitektur Offline-First dengan Room SQLite lokal dan Supabase Remote Storage
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Sync Engine Status & Manual Sync */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-4">
              <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Status Synchronization
            </h2>

            <div className="space-y-4">
              {/* Cards for Pending, Last Sync, Device ID */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Record Pending</div>
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {syncStatus?.pendingRecords || 0}
                  </div>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                    Tersimpan di Room DB
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Terakhir Sync</div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                    {syncStatus?.lastSyncTime && syncStatus.lastSyncTime > 0
                      ? new Date(syncStatus.lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Belum pernah'}
                  </div>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                    {syncStatus?.lastSyncTime && syncStatus.lastSyncTime > 0
                      ? formatDateIndonesian(new Date(syncStatus.lastSyncTime).toISOString().split('T')[0])
                      : '-'}
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">Device ID Persistent:</span>
                <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">{syncStatus?.deviceId}</span>
              </div>

              {/* Progress feedback box during sync */}
              {isSyncing && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-2xl text-indigo-900 dark:text-indigo-200 animate-pulse">
                  <div className="flex items-center gap-2 text-xs font-bold mb-1">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                    Proses Sinkronisasi Berjalan...
                  </div>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300 font-mono">
                    {syncProgressStep || 'Collecting UsageStats & Syncing to Supabase...'}
                  </p>
                </div>
              )}

              {/* Manual Sync Button */}
              <button
                id="btn-manual-sync-full"
                onClick={handleManualSyncClick}
                disabled={isSyncing}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Proses Sync Berjalan...' : 'Sync Now (Manual Trigger)'}</span>
              </button>
            </div>
          </div>

          {/* Local Data Retention Settings */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Local Data Retention
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Batas waktu penyimpanan data historis di Room SQLite lokal. Data yang belum disinkronkan tidak akan pernah dihapus.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { days: 30, label: '30 Hari' },
                { days: 90, label: '90 Hari (Default)' },
                { days: 365, label: '1 Tahun' },
                { days: 0, label: 'Semua Data' },
              ].map((opt) => {
                const isSelected = syncStatus?.retentionDays === opt.days;
                return (
                  <button
                    key={opt.days}
                    onClick={() => onUpdateRetention(opt.days as RetentionDays)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Supabase Configuration */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Koneksi Supabase Remote
              </h2>

              <span
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                  syncStatus?.supabaseConfigured
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                }`}
              >
                {syncStatus?.supabaseConfigured ? 'Terhubung' : 'Pending Key'}
              </span>
            </div>

            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  SUPABASE URL
                </label>
                <input
                  type="text"
                  placeholder="https://your-project.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  SUPABASE ANON KEY (Public Client Key)
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-zinc-900 dark:text-zinc-100"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  ⚠️ Jangan pernah memasukkan <span className="font-semibold text-amber-600 dark:text-amber-400">SUPABASE_SERVICE_ROLE_KEY</span> ke dalam aplikasi APK/Client.
                </p>
              </div>

              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Simpan Konfigurasi
                </button>

                <button
                  type="button"
                  onClick={() => setShowSqlModal(true)}
                  className="py-2.5 px-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Lihat Script SQL</span>
                </button>
              </div>
            </form>
          </div>

          {/* Browser Dev Controls */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Web Development Mock Tools
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Gunakan kontrol ini saat mengembangkan atau menguji di browser (npm run dev)
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={async () => {
                  await MockUsageStatsProvider.resetMockData();
                  onRefreshData();
                }}
                className="py-2 px-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Reset Test Seed Data
              </button>

              <button
                onClick={async () => {
                  await MockUsageStatsProvider.setUsageAccessPermission(false);
                  onRefreshData();
                }}
                className="py-2 px-3 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Simulasikan Izin Mati
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SQL Script View Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Supabase SQL DDL & RLS Script
              </h3>

              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-indigo-700"
              >
                {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'Tercopy!' : 'Copy SQL'}</span>
              </button>
            </div>

            <pre className="p-4 bg-zinc-950 text-indigo-300 font-mono text-xs rounded-2xl overflow-y-auto flex-1 border border-zinc-800 leading-relaxed">
              {SUPABASE_SQL_SCHEMA}
            </pre>

            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setShowSqlModal(false)}
                className="px-5 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
