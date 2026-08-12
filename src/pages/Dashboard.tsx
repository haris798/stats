import React from 'react';
import { AppUsage, DayUsage } from '../types/usage';
import { formatMinutesToHours, formatMinutesFull, formatDateIndonesian, getAppMeta } from '../lib/formatters';
import {
  Clock,
  TrendingUp,
  TrendingDown,
  AppWindow,
  Calendar,
  ChevronRight,
  Layers,
  Award,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';

interface DashboardProps {
  todayUsage: DayUsage | null;
  yesterdayUsage: DayUsage | null;
  last7DaysUsage: DayUsage[];
  last14DaysUsage?: DayUsage[];
  onSelectApp: (app: AppUsage) => void;
  onNavigateHistory: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  todayUsage,
  yesterdayUsage,
  last7DaysUsage,
  last14DaysUsage,
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

  // Weekly comparison calculations (Past 7 days vs Previous 7 days)
  const pastWeekDays = (last14DaysUsage || last7DaysUsage).slice(0, 7);
  const prevWeekDays = (last14DaysUsage || []).slice(7, 14);

  const totalPastWeekMins = pastWeekDays.reduce((acc, d) => acc + d.totalMinutes, 0);
  const avgPastWeekMins = pastWeekDays.length > 0 ? Math.round(totalPastWeekMins / pastWeekDays.length) : 0;

  const totalPrevWeekMins = prevWeekDays.reduce((acc, d) => acc + d.totalMinutes, 0);
  const avgPrevWeekMins = prevWeekDays.length > 0 ? Math.round(totalPrevWeekMins / prevWeekDays.length) : 0;

  const diffAvgMins = avgPastWeekMins - avgPrevWeekMins;
  const isAvgHigher = diffAvgMins > 0;
  const isAvgEqual = diffAvgMins === 0;

  const weeklyPercentChange = avgPrevWeekMins > 0
    ? Math.round((Math.abs(diffAvgMins) / avgPrevWeekMins) * 100)
    : 0;

  const maxWeeklyAvg = Math.max(avgPastWeekMins, avgPrevWeekMins, 1);
  const pastWeekBarWidth = Math.max(12, Math.round((avgPastWeekMins / maxWeeklyAvg) * 100));
  const prevWeekBarWidth = Math.max(12, Math.round((avgPrevWeekMins / maxWeeklyAvg) * 100));

  // Top 5 apps today
  const topAppsToday = todayUsage?.apps.slice(0, 5) || [];
  const maxUsageAppMins = topAppsToday.length > 0 ? topAppsToday[0].usageMinutes : 1;

  // Max minutes in last 7 days for chart scaling
  const max7DaysMins = Math.max(...last7DaysUsage.map(d => d.totalMinutes), 1);

  return (
    <div className="space-y-6">
      {/* Primary Screen Time Card */}
      <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-zinc-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-indigo-500/30">
        {/* Abstract background decorative shapes */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 w-32 h-32 bg-indigo-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold tracking-wider text-indigo-100 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-300" />
              Screen Time Hari Ini
            </span>
            <span className="text-xs font-bold px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/20">
              {todayUsage?.date ? formatDateIndonesian(todayUsage.date) : 'Hari Ini'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
              {formatMinutesFull(totalMinsToday)}
            </h1>

            {/* Comparison Badge */}
            {totalMinsYesterday > 0 && (
              <div
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md ${
                  isMoreThanYesterday
                    ? 'bg-amber-500/30 text-amber-100 border border-amber-400/50'
                    : 'bg-emerald-500/30 text-emerald-100 border border-emerald-400/50'
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-indigo-600/40">
            <div className="bg-zinc-900/80 rounded-2xl p-3 backdrop-blur-md border border-indigo-500/30">
              <div className="text-xs text-indigo-200 font-semibold mb-0.5">Total Aplikasi</div>
              <div className="text-lg font-bold text-white flex items-center gap-1.5">
                <AppWindow className="w-4 h-4 text-indigo-300" />
                {todayUsage?.apps.length || 0} apps
              </div>
            </div>

            <div className="bg-zinc-900/80 rounded-2xl p-3 backdrop-blur-md border border-indigo-500/30">
              <div className="text-xs text-indigo-200 font-semibold mb-0.5">Rata-rata 7 Hari</div>
              <div className="text-lg font-bold text-white">
                {formatMinutesToHours(avg7DaysMins)}
              </div>
            </div>

            <div className="bg-zinc-900/80 rounded-2xl p-3 backdrop-blur-md border border-indigo-500/30 col-span-2 sm:col-span-1">
              <div className="text-xs text-indigo-200 font-semibold mb-0.5">Total Dibuka</div>
              <div className="text-lg font-bold text-white">
                {todayUsage?.apps.reduce((acc, a) => acc + (a.openCount || 0), 0) || 0}x dibuka
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Screen Time Summary Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/60">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                Perbandingan Rata-Rata Mingguan
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-300 font-medium">
                Rata-rata screen time harian minggu ini vs minggu lalu
              </p>
            </div>
          </div>

          {/* Comparison Status Badge */}
          {avgPrevWeekMins > 0 && (
            <div className="self-start sm:self-auto">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                  isAvgHigher
                    ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700/80'
                    : isAvgEqual
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
                    : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700/80'
                }`}
              >
                {isAvgHigher ? (
                  <>
                    <ArrowUpRight className="w-4 h-4 text-amber-600 dark:text-amber-300" />
                    <span>+{weeklyPercentChange}% ({formatMinutesToHours(Math.abs(diffAvgMins))}/hari lebih tinggi)</span>
                  </>
                ) : isAvgEqual ? (
                  <span>Penggunaan stabil (Sama dengan minggu lalu)</span>
                ) : (
                  <>
                    <ArrowDownRight className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
                    <span>-{weeklyPercentChange}% ({formatMinutesToHours(Math.abs(diffAvgMins))}/hari lebih hemat)</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dual Metric Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Past 7 Days Metric Box */}
          <div className="bg-zinc-50 dark:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                Minggu Ini (7 Hari Terakhir)
              </span>
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-300">
                Total {formatMinutesToHours(totalPastWeekMins)}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                {formatMinutesToHours(avgPastWeekMins)}
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-300 ml-1">/ hari</span>
              </div>
            </div>

            <div className="w-full bg-zinc-200/80 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${pastWeekBarWidth}%` }}
              />
            </div>
          </div>

          {/* Previous 7 Days Metric Box */}
          <div className="bg-zinc-50 dark:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-400" />
                Minggu Lalu (Hari 8-14)
              </span>
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-300">
                Total {formatMinutesToHours(totalPrevWeekMins)}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                {formatMinutesToHours(avgPrevWeekMins)}
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-300 ml-1">/ hari</span>
              </div>
            </div>

            <div className="w-full bg-zinc-200/80 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-400 dark:bg-zinc-400 rounded-full transition-all duration-500"
                style={{ width: `${prevWeekBarWidth}%` }}
              />
            </div>
          </div>
        </div>

        {/* Insight Callout */}
        {avgPrevWeekMins > 0 && (
          <div className="bg-indigo-50/70 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800/80 rounded-2xl p-3.5 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-300 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-700 dark:text-zinc-100 font-medium leading-relaxed">
              {isAvgHigher ? (
                <>
                  Rata-rata penggunaan HP Anda minggu ini naik{' '}
                  <span className="font-bold text-amber-700 dark:text-amber-300">
                    {formatMinutesToHours(Math.abs(diffAvgMins))} per hari
                  </span>{' '}
                  dibandingkan minggu lalu. Coba atur pembatasan aplikasi untuk menjaga keseimbangan.
                </>
              ) : isAvgEqual ? (
                <>
                  Rata-rata screen time harian Anda stabil di angka{' '}
                  <span className="font-bold text-indigo-600 dark:text-indigo-300">
                    {formatMinutesToHours(avgPastWeekMins)} per hari
                  </span>
                  , sama dengan minggu sebelumnya.
                </>
              ) : (
                <>
                  Luar biasa! Rata-rata screen time harian Anda hemat{' '}
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    {formatMinutesToHours(Math.abs(diffAvgMins))} per hari
                  </span>{' '}
                  dibanding minggu lalu. Pertahankan kebiasaan digital yang baik ini!
                </>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Top 5 Apps Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center border border-transparent dark:border-indigo-800/60">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-zinc-900 dark:text-white">Top Aplikasi Hari Ini</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-300 font-medium">Penggunaan screen time tertinggi</p>
            </div>
          </div>

          <button
            onClick={onNavigateHistory}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-300 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {topAppsToday.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 dark:text-zinc-400 text-xs font-medium">
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
                  className="p-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-zinc-400 dark:text-zinc-300 w-4 text-center">#{idx + 1}</span>
                      <div className={`w-9 h-9 rounded-xl ${meta.iconBg} flex items-center justify-center font-bold text-sm shrink-0`}>
                        {app.appName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                          <span>{app.appName}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 border dark:border-zinc-700">
                            {meta.category}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-300 font-medium">
                          {app.openCount ? `${app.openCount}x dibuka • ` : ''}{percent}% dari total
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-sm text-zinc-900 dark:text-white">
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
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center border border-transparent dark:border-indigo-800/60">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-zinc-900 dark:text-white">Tren Penggunaan 7 Hari</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-300 font-medium">Statistik harian mingguan Anda</p>
            </div>
          </div>

          <div className="text-xs font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 border dark:border-zinc-700 px-3 py-1 rounded-full">
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
                          : 'bg-indigo-200 dark:bg-indigo-600/70 group-hover:bg-indigo-400'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* Label */}
                  <div className="mt-2 text-[11px] font-bold text-center text-zinc-600 dark:text-zinc-200">
                    <div>{formatDateIndonesian(dayData.date).split(' ')[0]}</div>
                    <div className="text-[9px] font-medium text-zinc-400 dark:text-zinc-300">
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
