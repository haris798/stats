import React from 'react';
import { AppUsage, DayUsage } from '../types/usage';
import { formatMinutesToHours, formatMinutesFull, formatDateIndonesian, getAppMeta } from '../lib/formatters';
import { ArrowLeft, Clock, History as HistoryIcon, Layers, BarChart2, Hash, Smartphone } from 'lucide-react';

interface AppDetailProps {
  app: AppUsage;
  todayUsage: DayUsage | null;
  yesterdayUsage: DayUsage | null;
  last7DaysUsage: DayUsage[];
  onBack: () => void;
}

export const AppDetail: React.FC<AppDetailProps> = ({
  app,
  todayUsage,
  yesterdayUsage,
  last7DaysUsage,
  onBack,
}) => {
  const meta = getAppMeta(app.packageName, app.appName);

  // Today usage for this app
  const todayApp = todayUsage?.apps.find(a => a.packageName === app.packageName);
  const minsToday = todayApp?.usageMinutes || app.usageMinutes || 0;

  // Yesterday usage for this app
  const yesterdayApp = yesterdayUsage?.apps.find(a => a.packageName === app.packageName);
  const minsYesterday = yesterdayApp?.usageMinutes || 0;

  // 7 days usage array for this app
  const app7DayTrend = last7DaysUsage.slice().reverse().map(day => {
    const found = day.apps.find(a => a.packageName === app.packageName);
    return {
      date: day.date,
      minutes: found ? found.usageMinutes : 0,
      openCount: found ? found.openCount : 0,
    };
  });

  const total7DayMins = app7DayTrend.reduce((acc, d) => acc + d.minutes, 0);
  const avg7DayMins = Math.round(total7DayMins / 7);

  const max7DayMins = Math.max(...app7DayTrend.map(d => d.minutes), 1);

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center gap-3">
        <button
          id="btn-back-app-detail"
          onClick={onBack}
          className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Detail Aplikasi
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {app.packageName}
          </p>
        </div>
      </div>

      {/* Main App Hero Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-16 h-16 rounded-2xl ${meta.iconBg} flex items-center justify-center font-black text-2xl shadow-md shrink-0`}>
            {app.appName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{app.appName}</h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
                {meta.category}
              </span>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">{app.packageName}</p>
          </div>
        </div>

        {/* 4 Primary Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Today
            </div>
            <div className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {formatMinutesToHours(minsToday)}
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
              <HistoryIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Yesterday
            </div>
            <div className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {formatMinutesToHours(minsYesterday)}
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              7 Day Average
            </div>
            <div className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {formatMinutesToHours(avg7DayMins)}
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Open Count
            </div>
            <div className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {todayApp?.openCount || app.openCount || 0}x
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Usage History Bar Graph for this App */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mb-1">
          Grafik Penggunaan 7 Hari - {app.appName}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
          Perbandingan Screen Time per hari untuk aplikasi ini
        </p>

        <div className="h-44 flex items-end justify-between gap-3 px-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
          {app7DayTrend.map((d, i) => {
            const heightPercent = Math.max(8, Math.min(100, Math.round((d.minutes / max7DayMins) * 100)));
            const isToday = i === app7DayTrend.length - 1;

            return (
              <div key={d.date} className="flex-1 flex flex-col items-center group h-full justify-end">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-[10px] px-2 py-1 rounded-md mb-1 whitespace-nowrap shadow-md pointer-events-none">
                  {formatMinutesToHours(d.minutes)} ({d.openCount}x dibuka)
                </div>

                <div className="w-full max-w-[32px] bg-zinc-100 dark:bg-zinc-800 rounded-t-xl overflow-hidden h-full flex items-end">
                  <div
                    className={`w-full rounded-t-xl transition-all duration-500 ${
                      isToday
                        ? 'bg-gradient-to-t from-indigo-600 to-indigo-500'
                        : 'bg-indigo-300 dark:bg-indigo-900/60 group-hover:bg-indigo-400'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                <div className="mt-2 text-[11px] font-medium text-center text-zinc-500 dark:text-zinc-400">
                  {formatDateIndonesian(d.date).split(' ')[0]} {formatDateIndonesian(d.date).split(' ')[1]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
