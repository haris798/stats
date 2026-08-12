import React from 'react';
import { Smartphone, RefreshCw, Wifi, WifiOff, History, LayoutDashboard, Settings, Layers, Sun, Moon } from 'lucide-react';
import { SyncStatus } from '../types/usage';

interface NavbarProps {
  activeTab: 'dashboard' | 'history' | 'apps' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'history' | 'apps' | 'settings') => void;
  syncStatus: SyncStatus | null;
  onSyncNow: () => void;
  isSyncing: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  syncStatus,
  onSyncNow,
  isSyncing,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">Stats.ku</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-500/25 dark:text-indigo-200 dark:border dark:border-indigo-500/40">
                  ScreenTime
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-300 font-medium">Offline-First App Analytics</p>
            </div>
          </div>

          {/* Connection & Sync Status Quick Controls */}
          <div className="flex items-center gap-2">
            {/* Online / Offline Badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                syncStatus?.isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/40'
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-500/40'
              }`}
            >
              {syncStatus?.isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
                  <span>Offline</span>
                </>
              )}
            </div>

            {/* Pending Sync Badge */}
            {syncStatus && syncStatus.pendingRecords > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/25 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/40">
                {syncStatus.pendingRecords} pending
              </span>
            )}

            {/* Sync Now Button */}
            <button
              id="btn-sync-now-header"
              onClick={onSyncNow}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              id="btn-theme-toggle"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Pengaturan Tema: Mode Terang' : 'Pengaturan Tema: Mode Gelap'}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer flex items-center justify-center ml-1"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation (Icon-only) */}
        <nav className="flex space-x-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-1.5 pb-1.5">
          <button
            id="tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            title="Dashboard"
            aria-label="Dashboard"
            className={`flex items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-600 dark:text-white shadow-xs font-bold'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
          </button>

          <button
            id="tab-history"
            onClick={() => setActiveTab('history')}
            title="History"
            aria-label="History"
            className={`flex items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-600 dark:text-white shadow-xs font-bold'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <History className="w-5 h-5" />
          </button>

          <button
            id="tab-apps"
            onClick={() => setActiveTab('apps')}
            title="App Usage"
            aria-label="App Usage"
            className={`flex items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'apps'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-600 dark:text-white shadow-xs font-bold'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Layers className="w-5 h-5" />
          </button>

          <button
            id="tab-settings"
            onClick={() => setActiveTab('settings')}
            title="Settings & Sync"
            aria-label="Settings & Sync"
            className={`flex items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-600 dark:text-white shadow-xs font-bold'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </nav>
      </div>
    </header>
  );
};
