import React, { useState } from 'react';
import { AppUsage, DayUsage } from '../types/usage';
import { formatMinutesToHours, getAppMeta } from '../lib/formatters';
import { Search, Layers, ChevronRight, RefreshCw, ShieldCheck, ArrowRight, Sparkles, Smartphone, FilterX } from 'lucide-react';

interface AppsListProps {
  todayUsage: DayUsage | null;
  onSelectApp: (app: AppUsage) => void;
  onSyncNow?: () => void;
  onNavigateSettings?: () => void;
}

export const AppsList: React.FC<AppsListProps> = ({ todayUsage, onSelectApp, onSyncNow, onNavigateSettings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const apps = todayUsage?.apps || [];

  const categories = ['Semua', ...Array.from(new Set(apps.map(a => getAppMeta(a.packageName, a.appName).category)))];

  const filteredApps = apps.filter(app => {
    const meta = getAppMeta(app.packageName, app.appName);
    const matchesSearch = app.appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.packageName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || meta.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Global Empty State when no apps exist for today
  if (apps.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Penggunaan Aplikasi Hari Ini
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Data terdeteksi oleh UsageStatsManager
          </p>
        </div>

        {/* Empty State Box */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm text-center">
          <div className="max-w-md mx-auto space-y-6">
            {/* Visual Icon Badge */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-950/60 rounded-3xl rotate-6 transition-transform"></div>
              <div className="relative w-20 h-20 bg-indigo-500 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Smartphone className="w-10 h-10" />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Belum Ada Data Penggunaan Hari Ini
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                Log durasi pemakaian aplikasi untuk hari ini masih kosong atau belum disinkronkan.
              </p>
            </div>

            {/* Step Guidance */}
            <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 rounded-2xl p-5 text-left space-y-4 text-xs">
              <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 text-xs tracking-wider text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" />
                Cara Mengaktifkan Pelacakan Aplikasi
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Periksa Izin Akses Penggunaan (Usage Access)
                    </div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5">
                      Pastikan izin 'Usage Access' aktif untuk Stats.ku pada menu Pengaturan HP Anda.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Buka Beberapa Aplikasi di HP
                    </div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5">
                      Gunakan aplikasi favorit Anda (misal: WhatsApp, YouTube, Chrome) selama beberapa menit.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Jalankan Sinkronisasi Log
                    </div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5">
                      Tekan tombol sinkronisasi di bawah untuk memuat durasi pemakaian terbaru.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {onSyncNow && (
                <button
                  id="btn-empty-apps-sync"
                  onClick={onSyncNow}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Sinkronkan Aplikasi Sekarang</span>
                </button>
              )}

              {onNavigateSettings && (
                <button
                  id="btn-empty-apps-settings"
                  onClick={onNavigateSettings}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Cek Izin Sistem</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Penggunaan Aplikasi Hari Ini
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {apps.length} aplikasi aktif terdeteksi oleh UsageStatsManager
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari aplikasi atau nama paket..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Apps Grid */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-3">
        {filteredApps.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-dashed border-zinc-200 dark:border-zinc-700 my-2">
            <FilterX className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <div className="font-semibold text-xs text-zinc-700 dark:text-zinc-300">
              Aplikasi Tidak Sesuai Filter
            </div>
            <div className="text-[11px] text-zinc-400 mt-1 max-w-xs mx-auto">
              Tidak ditemukan aplikasi untuk kategori '{selectedCategory}' {searchTerm ? `dengan kata kunci "${searchTerm}"` : ''}.
            </div>
            <button
              onClick={() => {
                setSelectedCategory('Semua');
                setSearchTerm('');
              }}
              className="mt-3 px-3.5 py-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Reset Filter & Pencarian
            </button>
          </div>
        ) : (
          filteredApps.map((app) => {
            const meta = getAppMeta(app.packageName, app.appName);
            return (
              <div
                key={app.packageName}
                onClick={() => onSelectApp(app)}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl ${meta.iconBg} flex items-center justify-center font-bold text-base shrink-0 shadow-sm`}>
                    {app.appName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <span>{app.appName}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {meta.category}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
                      {app.packageName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {formatMinutesToHours(app.usageMinutes)}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {app.openCount ? `${app.openCount}x dibuka` : 'Aktif'}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

