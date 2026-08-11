import React from 'react';
import { ShieldAlert, ExternalLink, RefreshCw } from 'lucide-react';
import { openUsageAccessSettings } from '../services/nativeUsageStats';

interface PermissionGuardProps {
  hasAccess: boolean;
  onCheckAgain: () => void;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ hasAccess, onCheckAgain }) => {
  if (hasAccess) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-5 mb-6 text-amber-900 dark:text-amber-200 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-amber-100 dark:bg-amber-900/60 rounded-xl text-amber-600 dark:text-amber-300 shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-base text-amber-950 dark:text-amber-100 mb-1">
            Usage Access diperlukan
          </h3>
          <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300 mb-4">
            ScreenTime.ku membutuhkan izin <span className="font-semibold">Usage Access</span> di pengaturan Android Anda untuk membaca statistik penggunaan aplikasi secara akurat & aman.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-open-settings"
              onClick={async () => {
                await openUsageAccessSettings();
                setTimeout(() => onCheckAgain(), 1000);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <span>Buka Pengaturan</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              id="btn-recheck-permission"
              onClick={onCheckAgain}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs font-medium rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Cek Lagi Status Izin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
