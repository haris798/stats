export interface AppUsage {
  packageName: string;
  appName: string;
  usageMinutes: number;
  totalTimeForeground: number; // in milliseconds
  openCount: number;
  firstUsedAt?: number;
  lastUsedAt?: number;
  syncStatus?: 'PENDING' | 'SYNCED' | 'FAILED';
  category?: string;
  iconUrl?: string;
}

export interface DayUsage {
  date: string; // YYYY-MM-DD
  deviceId: string;
  totalMinutes: number;
  apps: AppUsage[];
}

export interface RangeRecord {
  id?: number;
  deviceId: string;
  usageDate: string;
  packageName: string;
  appName: string;
  usageMinutes: number;
  totalTimeForeground: number;
  openCount: number;
  syncStatus: 'PENDING' | 'SYNCED' | 'FAILED';
}

export interface SyncStatus {
  deviceId: string;
  pendingRecords: number;
  lastSyncTime: number;
  retentionDays: number;
  supabaseConfigured: boolean;
  isOnline: boolean;
}

export type RetentionDays = 30 | 90 | 365 | 0; // 0 = All time
