import { DayUsage, AppUsage, SyncStatus, RangeRecord, RetentionDays } from '../types/usage';
import { supabase } from './supabaseClient';

const MOCK_DEVICE_ID_KEY = 'stats_ku_mock_device_id';
const MOCK_ROOM_DB_KEY = 'stats_ku_room_db';
const MOCK_PREFS_KEY = 'stats_ku_prefs';
const MOCK_PERMISSION_KEY = 'stats_ku_permission_granted';

// Initialize mock device ID
function getMockDeviceId(): string {
  let id = localStorage.getItem(MOCK_DEVICE_ID_KEY);
  if (!id || id.startsWith('device_') || id.startsWith('android_')) {
    id = 'haris / 25062RN2DY';
    localStorage.setItem(MOCK_DEVICE_ID_KEY, id);
  }
  return id;
}

// Sample android apps database
const POPULAR_APPS: { pkg: string; name: string; cat: string }[] = [
  { pkg: 'com.google.android.youtube', name: 'YouTube', cat: 'Entertainment' },
  { pkg: 'com.whatsapp', name: 'WhatsApp', cat: 'Communication' },
  { pkg: 'com.android.chrome', name: 'Google Chrome', cat: 'Productivity' },
  { pkg: 'com.instagram.android', name: 'Instagram', cat: 'Social' },
  { pkg: 'com.zhiliaoapp.musically', name: 'TikTok', cat: 'Social' },
  { pkg: 'com.mobile.legends', name: 'Mobile Legends', cat: 'Gaming' },
  { pkg: 'com.spotify.music', name: 'Spotify', cat: 'Audio' },
  { pkg: 'com.tokopedia.tkpd', name: 'Tokopedia', cat: 'Shopping' },
  { pkg: 'com.shopee.id', name: 'Shopee', cat: 'Shopping' },
  { pkg: 'com.duolingo', name: 'Duolingo', cat: 'Education' },
  { pkg: 'com.twitter.android', name: 'X / Twitter', cat: 'Social' },
  { pkg: 'com.openai.chatgpt', name: 'ChatGPT', cat: 'Productivity' },
  { pkg: 'com.google.android.apps.maps', name: 'Google Maps', cat: 'Navigation' },
];

export interface RoomRecord {
  id: number;
  deviceId: string;
  usageDate: string;
  packageName: string;
  appName: string;
  usageMinutes: number;
  totalTimeForeground: number;
  openCount: number;
  firstUsedAt: number;
  lastUsedAt: number;
  createdAt: number;
  updatedAt: number;
  syncStatus: 'PENDING' | 'SYNCED' | 'FAILED';
}

function getLocalRoomData(): RoomRecord[] {
  const raw = localStorage.getItem(MOCK_ROOM_DB_KEY);
  if (!raw) {
    const seed = generateSeedData();
    localStorage.setItem(MOCK_ROOM_DB_KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveLocalRoomData(data: RoomRecord[]) {
  localStorage.setItem(MOCK_ROOM_DB_KEY, JSON.stringify(data));
}

function generateSeedData(): RoomRecord[] {
  const deviceId = getMockDeviceId();
  const records: RoomRecord[] = [];
  let idCounter = 1;

  // Generate 14 days of historical screen time
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Pick 5-8 random apps per day
    const dayApps = [...POPULAR_APPS].sort(() => 0.5 - Math.random()).slice(0, 6 + (i % 3));
    
    dayApps.forEach((app) => {
      // Variance in minutes
      const baseMins = app.name === 'YouTube' ? 85 : app.name === 'WhatsApp' ? 52 : app.name === 'Google Chrome' ? 41 : app.name === 'Instagram' ? 37 : app.name === 'TikTok' ? 29 : Math.floor(Math.random() * 45) + 5;
      const mins = Math.max(2, baseMins + Math.floor((Math.random() - 0.5) * 20));
      const openCount = Math.floor(mins / 7) + Math.floor(Math.random() * 5) + 1;
      const foregroundMs = mins * 60 * 1000;

      records.push({
        id: idCounter++,
        deviceId,
        usageDate: dateStr,
        packageName: app.pkg,
        appName: app.name,
        usageMinutes: mins,
        totalTimeForeground: foregroundMs,
        openCount,
        firstUsedAt: d.getTime() - 8 * 3600 * 1000,
        lastUsedAt: d.getTime(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: i === 0 ? 'PENDING' : 'SYNCED', // today's data is pending
      });
    });
  }

  return records;
}

export const MockUsageStatsProvider = {
  hasUsageAccess: async (): Promise<boolean> => {
    const granted = localStorage.getItem(MOCK_PERMISSION_KEY);
    return granted !== 'false'; // default true for smooth web development
  },

  setUsageAccessPermission: async (granted: boolean): Promise<void> => {
    localStorage.setItem(MOCK_PERMISSION_KEY, String(granted));
  },

  openUsageAccessSettings: async (): Promise<void> => {
    localStorage.setItem(MOCK_PERMISSION_KEY, 'true');
  },

  getUsageForDate: async (dateStr: string): Promise<DayUsage> => {
    const records = getLocalRoomData();
    const deviceId = getMockDeviceId();
    const dayRecords = records.filter(r => r.usageDate === dateStr);

    let totalMins = 0;
    const apps: AppUsage[] = dayRecords.map(r => {
      totalMins += r.usageMinutes;
      return {
        packageName: r.packageName,
        appName: r.appName,
        usageMinutes: r.usageMinutes,
        totalTimeForeground: r.totalTimeForeground,
        openCount: r.openCount,
        firstUsedAt: r.firstUsedAt,
        lastUsedAt: r.lastUsedAt,
        syncStatus: r.syncStatus
      };
    }).sort((a, b) => b.usageMinutes - a.usageMinutes);

    return {
      date: dateStr,
      deviceId,
      totalMinutes: totalMins,
      apps
    };
  },

  getUsageForRange: async (startDate: string, endDate: string): Promise<{ startDate: string; endDate: string; records: RangeRecord[] }> => {
    const records = getLocalRoomData();
    const filtered = records.filter(r => r.usageDate >= startDate && r.usageDate <= endDate);
    return {
      startDate,
      endDate,
      records: filtered.map(r => ({
        id: r.id,
        deviceId: r.deviceId,
        usageDate: r.usageDate,
        packageName: r.packageName,
        appName: r.appName,
        usageMinutes: r.usageMinutes,
        totalTimeForeground: r.totalTimeForeground,
        openCount: r.openCount,
        syncStatus: r.syncStatus
      }))
    };
  },

  getSyncStatus: async (): Promise<SyncStatus> => {
    const records = getLocalRoomData();
    const deviceId = getMockDeviceId();
    const pending = records.filter(r => r.syncStatus === 'PENDING' || r.syncStatus === 'FAILED').length;
    
    const prefsRaw = localStorage.getItem(MOCK_PREFS_KEY);
    const prefs = prefsRaw ? JSON.parse(prefsRaw) : { retentionDays: 90, lastSyncTime: Date.now() - 3600000 };

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('stats_ku_supabase_url') || '';
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('stats_ku_supabase_key') || '';

    return {
      deviceId,
      pendingRecords: pending,
      lastSyncTime: prefs.lastSyncTime || 0,
      retentionDays: prefs.retentionDays || 90,
      supabaseConfigured: Boolean(supabaseUrl && supabaseKey),
      isOnline: navigator.onLine
    };
  },

  syncNow: async (customUrl?: string, customKey?: string): Promise<{ success: boolean; pendingRemaining: number; message?: string }> => {
    const records = getLocalRoomData();
    const pending = records.filter(r => r.syncStatus === 'PENDING' || r.syncStatus === 'FAILED');

    if (pending.length === 0) {
      return { success: true, pendingRemaining: 0, message: 'Tidak ada data pending untuk disinkronkan.' };
    }

    const supabaseUrl = customUrl || import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('stats_ku_supabase_url') || '';
    const supabaseKey = customKey || import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('stats_ku_supabase_key') || '';

    if (customUrl) localStorage.setItem('stats_ku_supabase_url', customUrl);
    if (customKey) localStorage.setItem('stats_ku_supabase_key', customKey);

    if (supabaseUrl && supabaseKey && supabase) {
      try {
        // Prepare Supabase UPSERT payload
        const payload = pending.map(r => ({
          device_id: r.deviceId,
          usage_date: r.usageDate,
          package_name: r.packageName,
          app_name: r.appName,
          total_time_foreground: r.totalTimeForeground,
          usage_minutes: r.usageMinutes,
          open_count: r.openCount,
          first_used_at: r.firstUsedAt ? new Date(r.firstUsedAt).toISOString() : null,
          last_used_at: r.lastUsedAt ? new Date(r.lastUsedAt).toISOString() : null,
          updated_at: new Date().toISOString()
        }));

        const { error } = await supabase
          .from('screen_time_usage')
          .upsert(payload, { onConflict: 'device_id,usage_date,package_name' });

        if (error) {
          // Mark as failed in room
          records.forEach(r => {
            if (r.syncStatus === 'PENDING') r.syncStatus = 'FAILED';
          });
          saveLocalRoomData(records);
          return { success: false, pendingRemaining: pending.length, message: `Supabase error: ${error.message}` };
        }
      } catch (e: any) {
        records.forEach(r => {
          if (r.syncStatus === 'PENDING') r.syncStatus = 'FAILED';
        });
        saveLocalRoomData(records);
        return { success: false, pendingRemaining: pending.length, message: `Connection error: ${e.message || e}` };
      }
    }

    // Mark pending records as SYNCED
    records.forEach(r => {
      if (r.syncStatus === 'PENDING' || r.syncStatus === 'FAILED') {
        r.syncStatus = 'SYNCED';
        r.updatedAt = Date.now();
      }
    });
    saveLocalRoomData(records);

    // Update last sync time in prefs
    const prefsRaw = localStorage.getItem(MOCK_PREFS_KEY);
    const prefs = prefsRaw ? JSON.parse(prefsRaw) : {};
    prefs.lastSyncTime = Date.now();
    localStorage.setItem(MOCK_PREFS_KEY, JSON.stringify(prefs));

    return {
      success: true,
      pendingRemaining: 0,
      message: 'Sinkronisasi berhasil! Data tersimpan di Room database lokal & Supabase.'
    };
  },

  setRetentionDays: async (days: RetentionDays): Promise<void> => {
    const prefsRaw = localStorage.getItem(MOCK_PREFS_KEY);
    const prefs = prefsRaw ? JSON.parse(prefsRaw) : {};
    prefs.retentionDays = days;
    localStorage.setItem(MOCK_PREFS_KEY, JSON.stringify(prefs));

    if (days > 0) {
      const records = getLocalRoomData();
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString().split('T')[0];

      // Keep only un-synced or newer than cutoff
      const filtered = records.filter(r => r.usageDate >= cutoffStr || r.syncStatus !== 'SYNCED');
      saveLocalRoomData(filtered);
    }
  },

  resetMockData: async (): Promise<void> => {
    localStorage.removeItem(MOCK_ROOM_DB_KEY);
    generateSeedData();
  }
};
