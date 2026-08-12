package com.screentime.ku

import android.content.Context
import android.content.SharedPreferences
import java.util.UUID

class AppPreferences(context: Context) {
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
        val newId = "device_" + UUID.randomUUID().toString().replace("-", "").take(16)
        prefs.edit().putString(KEY_DEVICE_ID, newId).apply()
        return newId
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
