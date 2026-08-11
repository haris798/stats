import React, { useState } from 'react';
import { AppUsage, DayUsage } from '../types/usage';
import { formatMinutesToHours, getAppMeta } from '../lib/formatters';
import { Search, Layers, ChevronRight, Hash } from 'lucide-react';

interface AppsListProps {
  todayUsage: DayUsage | null;
  onSelectApp: (app: AppUsage) => void;
}

export const AppsList: React.FC<AppsListProps> = ({ todayUsage, onSelectApp }) => {
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
          <div className="text-center py-12 text-zinc-400 text-xs">
            Tidak ada aplikasi yang sesuai.
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
