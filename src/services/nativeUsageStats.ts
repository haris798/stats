import { Capacitor, registerPlugin } from '@capacitor/core';
import { DayUsage, SyncStatus, RangeRecord, RetentionDays } from '../types/usage';
import { MockUsageStatsProvider } from './mockUsageStats';

export interface UsageStatsPluginInterface {
  hasUsageAccess(): Promise<{ hasAccess: boolean }>;
  openUsageAccessSettings(): Promise<void>;
  getUsageForDate(options: { date: string }): Promise<DayUsage>;
  getUsageForRange(options: { startDate: string; endDate: string }): Promise<{ startDate: string; endDate: string; records: RangeRecord[] }>;
  getSyncStatus(): Promise<SyncStatus>;
  syncNow(options?: { supabaseUrl?: string; supabaseAnonKey?: string }): Promise<{ success: boolean; pendingRemaining: number; message?: string }>;
}

const UsageStatsPlugin = registerPlugin<UsageStatsPluginInterface>('UsageStats');

export function isNativeAndroid(): Boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

export async function hasUsageAccess(): Promise<boolean> {
  if (isNativeAndroid()) {
    try {
      const res = await UsageStatsPlugin.hasUsageAccess();
      return res.hasAccess;
    } catch (e) {
      console.warn('Native usage access check failed, falling back to mock provider:', e);
      return await MockUsageStatsProvider.hasUsageAccess();
    }
  }
  return await MockUsageStatsProvider.hasUsageAccess();
}

export async function openUsageAccessSettings(): Promise<void> {
  if (isNativeAndroid()) {
    try {
      await UsageStatsPlugin.openUsageAccessSettings();
      return;
    } catch (e) {
      console.warn('Native openUsageAccessSettings failed:', e);
    }
  }
  await MockUsageStatsProvider.openUsageAccessSettings();
}

export async function getUsageForDate(dateString: string): Promise<DayUsage> {
  if (isNativeAndroid()) {
    try {
      return await UsageStatsPlugin.getUsageForDate({ date: dateString });
    } catch (e) {
      console.warn('Native getUsageForDate failed, using mock provider fallback:', e);
      return await MockUsageStatsProvider.getUsageForDate(dateString);
    }
  }
  return await MockUsageStatsProvider.getUsageForDate(dateString);
}

export async function getUsageForRange(startDate: string, endDate: string): Promise<{ startDate: string; endDate: string; records: RangeRecord[] }> {
  if (isNativeAndroid()) {
    try {
      return await UsageStatsPlugin.getUsageForRange({ startDate, endDate });
    } catch (e) {
      console.warn('Native getUsageForRange failed, using mock provider fallback:', e);
      return await MockUsageStatsProvider.getUsageForRange(startDate, endDate);
    }
  }
  return await MockUsageStatsProvider.getUsageForRange(startDate, endDate);
}

export async function getSyncStatus(): Promise<SyncStatus> {
  if (isNativeAndroid()) {
    try {
      const res: any = await UsageStatsPlugin.getSyncStatus();
      if (res.syncLogsJson && typeof res.syncLogsJson === 'string') {
        try {
          res.syncLogs = JSON.parse(res.syncLogsJson);
        } catch (e) {
          res.syncLogs = [];
        }
      }
      return res;
    } catch (e) {
      console.warn('Native getSyncStatus failed:', e);
      return await MockUsageStatsProvider.getSyncStatus();
    }
  }
  return await MockUsageStatsProvider.getSyncStatus();
}

export async function syncNow(supabaseUrl?: string, supabaseAnonKey?: string): Promise<{ success: boolean; pendingRemaining: number; message?: string }> {
  if (isNativeAndroid()) {
    try {
      return await UsageStatsPlugin.syncNow({ supabaseUrl, supabaseAnonKey });
    } catch (e) {
      console.warn('Native syncNow failed:', e);
      return await MockUsageStatsProvider.syncNow(supabaseUrl, supabaseAnonKey);
    }
  }
  return await MockUsageStatsProvider.syncNow(supabaseUrl, supabaseAnonKey);
}

export async function setRetention(days: RetentionDays): Promise<void> {
  await MockUsageStatsProvider.setRetentionDays(days);
}
