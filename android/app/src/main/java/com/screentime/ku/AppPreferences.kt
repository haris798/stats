package com.screentime.ku

import android.content.Context
import android.content.SharedPreferences
import android.provider.Settings
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

class AppPreferences(private val context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("screentime_prefs", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_DEVICE_ID = "device_id"
        private const val KEY_RETENTION_DAYS = "retention_days"
        private const val KEY_LAST_SYNC_TIME = "last_sync_time"
        private const val KEY_SUPABASE_URL = "supabase_url"
        private const val KEY_SUPABASE_ANON_KEY = "supabase_anon_key"
        private const val KEY_LAST_SYNC_STATUS = "last_sync_status"
        private const val KEY_LAST_SYNC_MESSAGE = "last_sync_message"
        private const val KEY_SYNC_LOGS = "sync_logs"
    }

    fun getDeviceId(): String {
        val deviceName = try {
            Settings.Global.getString(context.contentResolver, "device_name")
                ?: Settings.Secure.getString(context.contentResolver, "bluetooth_name")
        } catch (e: Exception) {
            null
        }

        val model = android.os.Build.MODEL // e.g. "25062RN2DY"

        val formattedDeviceId = if (!deviceName.isNullOrBlank()) {
            "$deviceName / $model"
        } else {
            "${android.os.Build.MANUFACTURER} / $model"
        }

        val existingId = prefs.getString(KEY_DEVICE_ID, null)

        // Upgrade/Update to new device name & model format if missing or starts with old android_/device_ prefix
        if (existingId.isNullOrBlank() || existingId.startsWith("android_") || existingId.startsWith("device_")) {
            prefs.edit().putString(KEY_DEVICE_ID, formattedDeviceId).apply()
            return formattedDeviceId
        }

        return existingId
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

    var lastSyncStatus: String
        get() = prefs.getString(KEY_LAST_SYNC_STATUS, "NONE") ?: "NONE"
        set(value) = prefs.edit().putString(KEY_LAST_SYNC_STATUS, value).apply()

    var lastSyncMessage: String
        get() = prefs.getString(KEY_LAST_SYNC_MESSAGE, "") ?: ""
        set(value) = prefs.edit().putString(KEY_LAST_SYNC_MESSAGE, value).apply()

    fun addSyncLog(status: String, message: String, recordsSynced: Int = 0) {
        try {
            val logsRaw = prefs.getString(KEY_SYNC_LOGS, "[]") ?: "[]"
            val array = JSONArray(logsRaw)

            val logObj = JSONObject().apply {
                put("id", UUID.randomUUID().toString())
                put("timestamp", System.currentTimeMillis())
                put("status", status)
                put("message", message)
                put("recordsSynced", recordsSynced)
            }

            val newArray = JSONArray()
            newArray.put(logObj)

            for (i in 0 until Math.min(array.length(), 29)) {
                newArray.put(array.getJSONObject(i))
            }

            prefs.edit().putString(KEY_SYNC_LOGS, newArray.toString()).apply()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun getSyncLogsJson(): String {
        return prefs.getString(KEY_SYNC_LOGS, "[]") ?: "[]"
    }
}
