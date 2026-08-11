import React, { useState } from 'react';
import { DayUsage, AppUsage } from '../types/usage';
import { formatMinutesToHours, formatDateIndonesian, formatDateDayName, getAppMeta } from '../lib/formatters';
import { Calendar as CalendarIcon, Clock, ChevronDown, ChevronUp, Download, Search, Smartphone, RefreshCw, ShieldCheck, ArrowRight, Inbox, Sparkles, XCircle } from 'lucide-react';

interface HistoryProps {
  historyDays: DayUsage[];
  onSelectApp: (app: AppUsage) => void;
  onSyncNow?: () => void;
  onNavigateSettings?: () => void;
}

export const HistoryPage: React.FC<HistoryProps> = ({ historyDays, onSelectApp, onSyncNow, onNavigateSettings }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    historyDays.length > 0 ? historyDays[0].date : null
  );
  const [searchTerm, setSearchTerm] = useState<string>('');

  const activeDay = historyDays.find(d => d.date === selectedDate) || (historyDays.length > 0 ? historyDays[0] : null);

  const filteredApps = activeDay?.apps.filter(app =>
    app.appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.packageName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleExportJSON = () => {
    if (historyDays.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(historyDays, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `stats_ku_history_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Global Empty State when no history data exists at all
  if (historyDays.length === 0) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Riwayat Penggunaan Screen Time
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Data tersimpan lokal di Room SQLite database
            </p>
          </div>
        </div>

        {/* Professional Empty State Box */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm text-center">
          <div className="max-w-md mx-auto space-y-6">
            {/* Visual Icon Badge */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-950/60 rounded-3xl rotate-6 transition-transform"></div>
              <div className="relative w-20 h-20 bg-indigo-500 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Inbox className="w-10 h-10" />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Belum Ada Catatan Riwayat Screen Time
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                Sistem belum menemukan log penggunaan perangkat harian tersimpan. Ikuti panduan di bawah ini untuk memulai pelacakan durasi layar secara otomatis.
              </p>
            </div>

            {/* Step-by-Step Guidance Card */}
            <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 rounded-2xl p-5 text-left space-y-4 text-xs">
              <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 text-xs tracking-wider text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" />
                Panduan Memulai Pelacakan
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Aktifkan Akses Penggunaan (Usage Access)
                    </div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5">
                      Berikan izin di Pengaturan Android agar sistem dapat membaca log aktivitas aplikasi aktif.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Sinkronkan Data Latar Belakang
                    </div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5">
                      Tekan tombol sinkronisasi untuk menarik log harian terbaru ke dalam SQLite database.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Gunakan HP Seperti Biasa
                    </div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5">
                      Setiap aktivitas pemakaian aplikasi akan tercatat dan dapat Anda tinjau kembali di halaman ini.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {onSyncNow && (
                <button
                  id="btn-empty-history-sync"
                  onClick={onSyncNow}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Sinkronkan Data Sekarang</span>
                </button>
              )}

              {onNavigateSettings && (
                <button
                  id="btn-empty-history-settings"
                  onClick={onNavigateSettings}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Pengaturan & Izin</span>
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Riwayat Penggunaan Screen Time
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Data tersimpan lokal di Room SQLite database
          </p>
        </div>

        <button
          id="btn-export-history"
          onClick={handleExportJSON}
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor Data JSON</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dates List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 px-1">
            Pilih Tanggal
          </h2>

          <div className="space-y-2">
            {historyDays.map((day) => {
              const isSelected = day.date === activeDay?.date;
              const dayName = formatDateDayName(day.date);
              const formattedDate = formatDateIndonesian(day.date);

              return (
                <div
                  key={day.date}
                  onClick={() => setSelectedDate(day.date)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-xs font-bold ${isSelected ? 'text-indigo-100' : 'text-zinc-400'}`}>
                        {dayName}
                      </div>
                      <div className="font-extrabold text-sm mt-0.5">
                        {formattedDate}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-sm font-black ${isSelected ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`}>
                        {formatMinutesToHours(day.totalMinutes)}
                      </div>
                      <div className={`text-[11px] ${isSelected ? 'text-indigo-200' : 'text-zinc-400'}`}>
                        {day.apps.length} aplikasi
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Date App Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          {activeDay ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {formatDateDayName(activeDay.date)}
                  </div>
                  <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                    {formatDateIndonesian(activeDay.date)}
                  </h2>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 px-4 py-2 rounded-2xl">
                  <div className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                    Total Screen Time
                  </div>
                  <div className="text-lg font-black text-indigo-700 dark:text-indigo-300">
                    {formatMinutesToHours(activeDay.totalMinutes)}
                  </div>
                </div>
              </div>

              {/* Search filter for apps */}
              <div className="relative my-4">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari aplikasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {/* Apps List */}
              <div className="space-y-3 mt-4">
                {filteredApps.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-dashed border-zinc-200 dark:border-zinc-700">
                    <Search className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                    <div className="font-semibold text-xs text-zinc-700 dark:text-zinc-300">
                      {searchTerm ? 'Aplikasi Tidak Ditemukan' : 'Tidak Ada Aktivitas Aplikasi'}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1 max-w-xs mx-auto">
                      {searchTerm
                        ? `Tidak ada aplikasi yang cocok dengan kata kunci "${searchTerm}" pada tanggal ini.`
                        : 'Tidak ada aplikasi yang tercatat aktif pada tanggal ini.'}
                    </div>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="mt-3 px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                      >
                        Reset Pencarian
                      </button>
                    )}
                  </div>
                ) : (
                  filteredApps.map((app) => {
                    const meta = getAppMeta(app.packageName, app.appName);
                    const percent = Math.round((app.usageMinutes / (activeDay.totalMinutes || 1)) * 100);

                    return (
                      <div
                        key={app.packageName}
                        onClick={() => onSelectApp(app)}
                        className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${meta.iconBg} flex items-center justify-center font-bold text-sm shrink-0`}>
                            {app.appName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                              {app.appName}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                              <span>{app.packageName}</span>
                              {app.openCount ? <span>• {app.openCount}x dibuka</span> : null}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            {formatMinutesToHours(app.usageMinutes)}
                          </div>
                          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                            {percent}%
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

