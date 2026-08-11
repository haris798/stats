package com.screentime.ku

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Process
import android.provider.Settings
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

class UsageStatsManagerHelper(private val context: Context) {

    fun hasUsageAccessPermission(): Boolean {
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                context.packageName
            )
        } else {
            appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                context.packageName
            )
        }
        return mode == AppOpsManager.MODE_ALLOWED
    }

    fun openUsageAccessSettings() {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
    }

    fun getUsageStatsForDate(dateString: String, deviceId: String): List<UsageEntity> {
        if (!hasUsageAccessPermission()) return emptyList()

        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
        val cal = Calendar.getInstance()
        val date: Date = try {
            sdf.parse(dateString) ?: Date()
        } catch (e: Exception) {
            Date()
        }

        cal.time = date
        cal.set(Calendar.HOUR_OF_DAY, 0)
        cal.set(Calendar.MINUTE, 0)
        cal.set(Calendar.SECOND, 0)
        cal.set(Calendar.MILLISECOND, 0)
        val startTime = cal.timeInMillis

        cal.set(Calendar.HOUR_OF_DAY, 23)
        cal.set(Calendar.MINUTE, 59)
        cal.set(Calendar.SECOND, 59)
        cal.set(Calendar.MILLISECOND, 999)
        val endTime = cal.timeInMillis

        return collectUsageForRange(startTime, endTime, dateString, deviceId)
    }

    fun collectUsageForRange(
        startTime: Long,
        endTime: Long,
        usageDate: String,
        deviceId: String
    ): List<UsageEntity> {
        val usm = context.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
            ?: return emptyList()

        val statsMap = mutableMapOf<String, UsageStats>()
        val queryStats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, startTime, endTime)
        if (queryStats != null) {
            for (stat in queryStats) {
                if (stat.totalTimeInForeground > 0) {
                    val existing = statsMap[stat.packageName]
                    if (existing == null || stat.totalTimeInForeground > existing.totalTimeInForeground) {
                        statsMap[stat.packageName] = stat
                    }
                }
            }
        }

        // Count open events using queryEvents
        val openCounts = mutableMapOf<String, Int>()
        try {
            val usageEvents = usm.queryEvents(startTime, endTime)
            val event = UsageEvents.Event()
            while (usageEvents != null && usageEvents.hasNextEvent()) {
                usageEvents.getNextEvent(event)
                if (event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                    val pkg = event.packageName
                    openCounts[pkg] = (openCounts[pkg] ?: 0) + 1
                }
            }
        } catch (e: Exception) {
            // Fallback if events fail
        }

        val pm = context.packageManager
        val resultList = mutableListOf<UsageEntity>()

        for ((pkgName, stat) in statsMap) {
            val totalTimeMs = stat.totalTimeInForeground
            if (totalTimeMs < 1000) continue // ignore under 1 second

            val appName = try {
                val appInfo = pm.getApplicationInfo(pkgName, 0)
                pm.getApplicationLabel(appInfo).toString()
            } catch (e: PackageManager.NameNotFoundException) {
                pkgName.substringAfterLast('.')
            }

            val minutes = (totalTimeMs / 60000).toInt()
            val openCount = openCounts[pkgName] ?: 1

            val entity = UsageEntity(
                deviceId = deviceId,
                usageDate = usageDate,
                packageName = pkgName,
                appName = appName,
                totalTimeForeground = totalTimeMs,
                usageMinutes = minutes,
                openCount = openCount,
                firstUsedAt = stat.firstTimeStamp,
                lastUsedAt = stat.lastTimeStamp,
                syncStatus = "PENDING"
            )
            resultList.add(entity)
        }

        return resultList.sortedByDescending { it.usageMinutes }
    }
}
