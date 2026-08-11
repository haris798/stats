import React from 'react';
import { AppUsage, DayUsage } from '../types/usage';
import { formatMinutesToHours, formatMinutesFull, formatDateIndonesian, getAppMeta } from '../lib/formatters';
import { Clock, TrendingUp, TrendingDown, AppWindow, Calendar, ChevronRight, Layers, Award } from 'lucide-react';

interface DashboardProps {
  todayUsage: DayUsage | null;
  yesterdayUsage: DayUsage | null;
  last7DaysUsage: DayUsage[];
  onSelectApp: (app: AppUsage) => void;
  onNavigateHistory: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  todayUsage,
  yesterdayUsage,
  last7DaysUsage,
  onSelectApp,
  onNavigateHistory,
}) => {
  const totalMinsToday = todayUsage?.totalMinutes || 0;
  const totalMinsYesterday = yesterdayUsage?.totalMinutes || 0;

  // Calculate percentage change vs yesterday
  const diffMins = totalMinsToday - totalMinsYesterday;
  const isMoreThanYesterday = diffMins > 0;

  // Calculate 7 day average
  const total7DaysMins = last7DaysUsage.reduce((acc, d) => acc + d.totalMinutes, 0);
  const avg7DaysMins = last7DaysUsage.length > 0 ? Math.round(total7DaysMins / last7DaysUsage.length) : 0;

  // Top 5 apps today
  const topAppsToday = todayUsage?.apps.slice(0, 5) || [];
  const maxUsageAppMins = topAppsToday.length > 0 ? topAppsToday[0].usageMinutes : 1;

  // Max minutes in last 7 days for chart scaling
  const max7DaysMins = Math.max(...last7DaysUsage.map(d => d.totalMinutes), 1);

  return (
    <div className="space-y-6">
      {/* Primary Screen Time Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Abstract background decorative shapes */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 w-32 h-32 bg-indigo-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold tracking-wider text-indigo-200/80 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Screen Time Hari Ini
            </span>
            <span className="text-xs font-medium px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-indigo-100">
              {todayUsage?.date ? formatDateIndonesian(todayUsage.date) : 'Hari Ini'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              {formatMinutesFull(totalMinsToday)}
            </h1>

            {/* Comparison Badge */}
            {totalMinsYesterday > 0 && (
              <div
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${
                  isMoreThanYesterday
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'
                }`}
              >
                {isMoreThanYesterday ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
                    <span>+{formatMinutesToHours(Math.abs(diffMins))} vs kemarin</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-300" />
                    <span>-{formatMinutesToHours(Math.abs(diffMins))} vs kemarin</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Stat Pill Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-indigo-700/50">
            <div className="bg-indigo-950/40 rounded-2xl p-3 backdrop-blur-sm border border-indigo-700/30">
              <div className="text-[11px] text-indigo-200/70 mb-0.5">Total Aplikasi</div>
              <div className="text-lg font-bold text-white flex items-center gap-1.5">
                <AppWindow className="w-4 h-4 text-indigo-300" />
                {todayUsage?.apps.length || 0} apps
              </div>
            </div>

            <div className="bg-indigo-950/40 rounded-2xl p-3 backdrop-blur-sm border border-indigo-700/30">
              <div className="text-[11px] text-indigo-200/70 mb-0.5">Rata-rata 7 Hari</div>
              <div className="text-lg font-bold text-white">
                {formatMinutesToHours(avg7DaysMins)}
              </div>
            </div>

            <div className="bg-indigo-950/40 rounded-2xl p-3 backdrop-blur-sm border border-indigo-700/30 col-span-2 sm:col-span-1">
              <div className="text-[11px] text-indigo-200/70 mb-0.5">Total Dibuka</div>
              <div className="text-lg font-bold text-white">
                {todayUsage?.apps.reduce((acc, a) => acc + (a.openCount || 0), 0) || 0}x dibuka
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Apps Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Top Aplikasi Hari Ini</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Penggunaan screen time tertinggi</p>
            </div>
          </div>

          <button
            onClick={onNavigateHistory}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {topAppsToday.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-xs">
            Belum ada data statistik aplikasi hari ini.
          </div>
        ) : (
          <div className="space-y-4">
            {topAppsToday.map((app, idx) => {
              const meta = getAppMeta(app.packageName, app.appName);
              const percent = Math.round((app.usageMinutes / (totalMinsToday || 1)) * 100);
              const barWidth = Math.max(8, Math.round((app.usageMinutes / maxUsageAppMins) * 100));

              return (
                <div
                  key={app.packageName}
                  onClick={() => onSelectApp(app)}
                  className="p-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-all cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-zinc-400 w-4 text-center">#{idx + 1}</span>
                      <div className={`w-9 h-9 rounded-xl ${meta.iconBg} flex items-center justify-center font-bold text-sm shrink-0`}>
                        {app.appName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          <span>{app.appName}</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                            {meta.category}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {app.openCount ? `${app.openCount}x dibuka • ` : ''}{percent}% dari total
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {formatMinutesToHours(app.usageMinutes)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${meta.color}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 7-Day Usage Trend Bar Chart */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Tren Penggunaan 7 Hari</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Statistik harian mingguan Anda</p>
            </div>
          </div>

          <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
            Rata-rata: {formatMinutesToHours(avg7DaysMins)} / hari
          </div>
        </div>

        {/* Bar Chart Visualizer */}
        <div className="pt-4 pb-2">
          <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            {last7DaysUsage.slice().reverse().map((dayData, i) => {
              const mins = dayData.totalMinutes;
              const heightPercent = Math.max(10, Math.min(100, Math.round((mins / max7DaysMins) * 100)));
              const isToday = i === last7DaysUsage.length - 1;

              return (
                <div key={dayData.date} className="flex-1 flex flex-col items-center group h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-[10px] px-2 py-1 rounded-md mb-1 whitespace-nowrap shadow-md pointer-events-none">
                    {formatMinutesToHours(mins)}
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[36px] bg-zinc-100 dark:bg-zinc-800 rounded-t-xl overflow-hidden h-full flex items-end">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-indigo-600 to-indigo-500'
                          : 'bg-indigo-200 dark:bg-indigo-900/60 group-hover:bg-indigo-400'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* Label */}
                  <div className="mt-2 text-[11px] font-medium text-center text-zinc-500 dark:text-zinc-400">
                    <div>{formatDateIndonesian(dayData.date).split(' ')[0]}</div>
                    <div className="text-[9px] text-zinc-400 dark:text-zinc-500">
                      {isToday ? 'Hari ini' : formatDateIndonesian(dayData.date).split(' ')[1]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
