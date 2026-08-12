package com.screentime.ku

import android.content.Context
import android.content.SharedPreferences
import android.provider.Settings
import java.util.UUID

class AppPreferences(private val context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("screentime_prefs", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_DEVICE_ID = "device_id"
        private const val KEY_RETENTION_DAYS = "retention_days"
        private const val KEY_LAST_SYNC_TIME = "last_sync_time"
        private const val KEY_SUPABASE_URL = "supabase_url"
        private const val KEY_SUPABASE_ANON_KEY = "supabase_anon_key"
    }

    fun getDeviceId(): String {
        val existingId = prefs.getString(KEY_DEVICE_ID, null)
        if (!existingId.isNullOrBlank()) {
            return existingId
        }

        val realAndroidId = try {
            Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)
        } catch (e: Exception) {
            null
        }

        val deviceId = if (!realAndroidId.isNullOrBlank() && realAndroidId != "9774d56d682e549c") {
            "android_$realAndroidId"
        } else {
            "device_" + UUID.randomUUID().toString().replace("-", "").take(16)
        }

        prefs.edit().putString(KEY_DEVICE_ID, deviceId).apply()
        return deviceId
    }

    var retentionDays: Int
        get() = prefs.getInt(KEY_RETENTION_DAYS, 90)
        set(value) = prefs.edit().putInt(KEY_RETENTION_DAYS, value).apply()

    var lastSyncTime: Long
        get() = prefs.getLong(KEY_LAST_SYNC_TIME, 0L)
        set(value) = prefs.edit().putLong(KEY_LAST_SYNC_TIME, value).apply()

    var supabaseUrl: String
        get() = prefs.getString(KEY_SUPABASE_URL, "") ?: ""
        set(value) = prefs.edit().putString(KEY_SUPABASE_URL, value).apply()

    var supabaseAnonKey: String
        get() = prefs.getString(KEY_SUPABASE_ANON_KEY, "") ?: ""
        set(value) = prefs.edit().putString(KEY_SUPABASE_ANON_KEY, value).apply()
}
