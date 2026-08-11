package com.screentime.ku

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class SyncWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val prefs = AppPreferences(applicationContext)
        val db = UsageDatabase.getInstance(applicationContext)
        val dao = db.usageDao()

        val supabaseUrl = prefs.supabaseUrl
        val anonKey = prefs.supabaseAnonKey

        if (supabaseUrl.isBlank() || anonKey.isBlank()) {
            return@withContext Result.success() // Cannot sync without credentials, will try when configured
        }

        val pendingRecords = dao.getPendingSyncUsages()
        if (pendingRecords.isEmpty()) {
            return@withContext Result.success()
        }

        val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
            timeZone = TimeZone.getTimeZone("UTC")
        }

        val jsonArray = JSONArray()
        val recordIds = mutableListOf<Long>()

        for (record in pendingRecords) {
            val json = JSONObject().apply {
                put("device_id", record.deviceId)
                put("usage_date", record.usageDate)
                put("package_name", record.packageName)
                put("app_name", record.appName)
                put("total_time_foreground", record.totalTimeForeground)
                put("usage_minutes", record.usageMinutes)
                put("open_count", record.openCount)
                if (record.firstUsedAt > 0) put("first_used_at", isoFormat.format(Date(record.firstUsedAt)))
                if (record.lastUsedAt > 0) put("last_used_at", isoFormat.format(Date(record.lastUsedAt)))
                put("updated_at", isoFormat.format(Date(System.currentTimeMillis())))
            }
            jsonArray.put(json)
            recordIds.add(record.id)
        }

        try {
            val endpoint = if (supabaseUrl.endsWith("/")) "${supabaseUrl}rest/v1/screen_time_usage" else "$supabaseUrl/rest/v1/screen_time_usage"
            val url = URL(endpoint)
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("apikey", anonKey)
            conn.setRequestProperty("Authorization", "Bearer $anonKey")
            conn.setRequestProperty("Content-Type", "application/json")
            conn.setRequestProperty("Prefer", "resolution=merge-duplicates,return=minimal")
            conn.doOutput = true
            conn.connectTimeout = 15000
            conn.readTimeout = 15000

            val writer = OutputStreamWriter(conn.outputStream, "UTF-8")
            writer.write(jsonArray.toString())
            writer.flush()
            writer.close()

            val responseCode = conn.responseCode
            if (responseCode in 200..299) {
                dao.updateSyncStatus(recordIds, "SYNCED")
                prefs.lastSyncTime = System.currentTimeMillis()
                Result.success()
            } else {
                dao.updateSyncStatus(recordIds, "FAILED")
                Result.retry()
            }
        } catch (e: Exception) {
            dao.updateSyncStatus(recordIds, "FAILED")
            Result.retry()
        }
    }
}
