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
        performSync(applicationContext)
    }

    companion object {
        suspend fun performSync(context: Context): Result = withContext(Dispatchers.IO) {
            val prefs = AppPreferences(context)
            val db = UsageDatabase.getInstance(context)
            val dao = db.usageDao()

            val supabaseUrl = prefs.supabaseUrl
            val anonKey = prefs.supabaseAnonKey

            if (supabaseUrl.isBlank() || anonKey.isBlank()) {
                prefs.lastSyncStatus = "FAILED"
                prefs.lastSyncMessage = "Supabase URL atau Anon Key belum dikonfigurasi."
                prefs.addSyncLog("INFO", "Sync dilewati: Supabase URL/Key belum diisi.", 0)
                return@withContext Result.success()
            }

            val pendingRecords = dao.getPendingSyncUsages()
            if (pendingRecords.isEmpty()) {
                val now = System.currentTimeMillis()
                prefs.lastSyncTime = now
                prefs.lastSyncStatus = "SUCCESS"
                prefs.lastSyncMessage = "Semua data lokal sudah tersinkronisasi."
                prefs.addSyncLog("SUCCESS", "Sync selesai. Tidak ada data pending baru.", 0)
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
                    val now = System.currentTimeMillis()
                    prefs.lastSyncTime = now
                    prefs.lastSyncStatus = "SUCCESS"
                    prefs.lastSyncMessage = "Berhasil mengunggah ${pendingRecords.size} record ke Supabase."
                    prefs.addSyncLog("SUCCESS", "Sync berhasil (${pendingRecords.size} record terunggah ke Supabase)", pendingRecords.size)
                    Result.success()
                } else {
                    val errorStream = conn.errorStream?.bufferedReader()?.use { it.readText() } ?: ""
                    val errorMsg = "HTTP $responseCode: ${conn.responseMessage} ${if (errorStream.isNotBlank()) "- $errorStream" else ""}"
                    dao.updateSyncStatus(recordIds, "FAILED")
                    prefs.lastSyncStatus = "FAILED"
                    prefs.lastSyncMessage = errorMsg
                    prefs.addSyncLog("FAILED", errorMsg, 0)
                    Result.retry()
                }
            } catch (e: Exception) {
                val errorMsg = "Gagal terhubung ke Supabase: ${e.message ?: "Connection error"}"
                dao.updateSyncStatus(recordIds, "FAILED")
                prefs.lastSyncStatus = "FAILED"
                prefs.lastSyncMessage = errorMsg
                prefs.addSyncLog("FAILED", errorMsg, 0)
                Result.retry()
            }
        }
    }
}
