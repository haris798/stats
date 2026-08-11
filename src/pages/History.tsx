import React, { useState } from 'react';
import { DayUsage, AppUsage } from '../types/usage';
import { formatMinutesToHours, formatDateIndonesian, formatDateDayName, getAppMeta } from '../lib/formatters';
import { Calendar as CalendarIcon, Clock, ChevronDown, ChevronUp, Download, Search, Smartphone } from 'lucide-react';

interface HistoryProps {
  historyDays: DayUsage[];
  onSelectApp: (app: AppUsage) => void;
}

export const HistoryPage: React.FC<HistoryProps> = ({ historyDays, onSelectApp }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    historyDays.length > 0 ? historyDays[0].date : null
  );
  const [searchTerm, setSearchTerm] = useState<string>('');

  const activeDay = historyDays.find(d => d.date === selectedDate) || historyDays[0];

  const filteredApps = activeDay?.apps.filter(app =>
    app.appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.packageName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(historyDays, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `stats_ku_history_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

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
                  <div className="text-[10px] uppercase font-semibold text-indigo-600 dark:text-indigo-400">
                    TOTAL SCREEN TIME
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
                  <div className="text-center py-10 text-zinc-400 text-xs">
                    Tidak ada aplikasi yang cocok dengan pencarian.
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
