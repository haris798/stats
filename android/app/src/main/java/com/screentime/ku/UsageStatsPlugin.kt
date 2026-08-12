package com.screentime.ku

import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@CapacitorPlugin(name = "UsageStats")
class UsageStatsPlugin : Plugin() {

    private val pluginScope = CoroutineScope(Dispatchers.IO)

    @PluginMethod
    fun hasUsageAccess(call: PluginCall) {
        val helper = UsageStatsManagerHelper(context)
        val hasAccess = helper.hasUsageAccessPermission()
        val ret = JSObject()
        ret.put("hasAccess", hasAccess)
        call.resolve(ret)
    }

    @PluginMethod
    fun openUsageAccessSettings(call: PluginCall) {
        val helper = UsageStatsManagerHelper(context)
        helper.openUsageAccessSettings()
        call.resolve()
    }

    @PluginMethod
    fun getUsageForDate(call: PluginCall) {
        val dateString = call.getString("date") ?: SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
        pluginScope.launch {
            try {
                val prefs = AppPreferences(context)
                val deviceId = prefs.getDeviceId()
                val db = UsageDatabase.getInstance(context)
                val dao = db.usageDao()
                val helper = UsageStatsManagerHelper(context)

                // 1. Try reading live UsageStats if permission granted
                if (helper.hasUsageAccessPermission()) {
                    val freshUsages = helper.getUsageStatsForDate(dateString, deviceId)
                    if (freshUsages.isNotEmpty()) {
                        dao.upsertAll(freshUsages)
                    }
                }

                // 2. Query Room as single source of truth
                val roomUsages = dao.getUsageForDate(dateString)

                var totalMinutes = 0
                val appsArray = JSArray()

                for (usage in roomUsages) {
                    totalMinutes += usage.usageMinutes
                    val appObj = JSObject().apply {
                        put("packageName", usage.packageName)
                        put("appName", usage.appName)
                        put("usageMinutes", usage.usageMinutes)
                        put("totalTimeForeground", usage.totalTimeForeground)
                        put("openCount", usage.openCount)
                        put("firstUsedAt", usage.firstUsedAt)
                        put("lastUsedAt", usage.lastUsedAt)
                        put("syncStatus", usage.syncStatus)
                    }
                    appsArray.put(appObj)
                }

                val result = JSObject().apply {
                    put("date", dateString)
                    put("deviceId", deviceId)
                    put("totalMinutes", totalMinutes)
                    put("apps", appsArray)
                }

                withContext(Dispatchers.Main) {
                    call.resolve(result)
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    call.reject("Error fetching usage for date: ${e.message}")
                }
            }
        }
    }

    @PluginMethod
    fun getUsageForRange(call: PluginCall) {
        val startDate = call.getString("startDate") ?: ""
        val endDate = call.getString("endDate") ?: ""
        pluginScope.launch {
            try {
                val db = UsageDatabase.getInstance(context)
                val dao = db.usageDao()
                val roomUsages = dao.getUsageForRange(startDate, endDate)

                val appsArray = JSArray()
                for (usage in roomUsages) {
                    val appObj = JSObject().apply {
                        put("id", usage.id)
                        put("deviceId", usage.deviceId)
                        put("usageDate", usage.usageDate)
                        put("packageName", usage.packageName)
                        put("appName", usage.appName)
                        put("usageMinutes", usage.usageMinutes)
                        put("totalTimeForeground", usage.totalTimeForeground)
                        put("openCount", usage.openCount)
                        put("syncStatus", usage.syncStatus)
                    }
                    appsArray.put(appObj)
                }

                val result = JSObject().apply {
                    put("startDate", startDate)
                    put("endDate", endDate)
                    put("records", appsArray)
                }

                withContext(Dispatchers.Main) {
                    call.resolve(result)
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    call.reject("Error fetching range: ${e.message}")
                }
            }
        }
    }

    @PluginMethod
    fun getSyncStatus(call: PluginCall) {
        pluginScope.launch {
            try {
                val prefs = AppPreferences(context)
                val db = UsageDatabase.getInstance(context)
                val dao = db.usageDao()

                val pendingCount = dao.getPendingSyncCount()
                val lastSync = prefs.lastSyncTime
                val deviceId = prefs.getDeviceId()

                val result = JSObject().apply {
                    put("deviceId", deviceId)
                    put("pendingRecords", pendingCount)
                    put("lastSyncTime", lastSync)
                    put("retentionDays", prefs.retentionDays)
                    put("supabaseConfigured", prefs.supabaseUrl.isNotBlank() && prefs.supabaseAnonKey.isNotBlank())
                    put("lastSyncStatus", prefs.lastSyncStatus)
                    put("lastSyncMessage", prefs.lastSyncMessage)
                    put("syncLogsJson", prefs.getSyncLogsJson())
                }

                withContext(Dispatchers.Main) {
                    call.resolve(result)
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    call.reject("Error fetching sync status: ${e.message}")
                }
            }
        }
    }

    @PluginMethod
    fun syncNow(call: PluginCall) {
        val url = call.getString("supabaseUrl")
        val key = call.getString("supabaseAnonKey")

        pluginScope.launch {
            try {
                val prefs = AppPreferences(context)
                if (!url.isNullOrBlank()) prefs.supabaseUrl = url
                if (!key.isNullOrBlank()) prefs.supabaseAnonKey = key

                val helper = UsageStatsManagerHelper(context)
                val deviceId = prefs.getDeviceId()
                val db = UsageDatabase.getInstance(context)
                val dao = db.usageDao()

                // Collect latest stats for today
                val today = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
                if (helper.hasUsageAccessPermission()) {
                    val freshUsages = helper.getUsageStatsForDate(today, deviceId)
                    if (freshUsages.isNotEmpty()) {
                        dao.upsertAll(freshUsages)
                    }
                }

                // Run sync worker logic inline for manual trigger feedback
                val syncWorkerResult = SyncWorker.performSync(context)

                val pendingAfter = dao.getPendingSyncCount()

                val ret = JSObject().apply {
                    put("success", syncWorkerResult is androidx.work.ListenableWorker.Result.Success)
                    put("pendingRemaining", pendingAfter)
                    put("lastSyncTime", prefs.lastSyncTime)
                    put("lastSyncStatus", prefs.lastSyncStatus)
                    put("lastSyncMessage", prefs.lastSyncMessage)
                }

                withContext(Dispatchers.Main) {
                    call.resolve(ret)
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    call.reject("Sync failed: ${e.message}")
                }
            }
        }
    }
}
