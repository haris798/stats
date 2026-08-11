package com.screentime.ku

import android.content.Context
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class UsageCollectionWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            val helper = UsageStatsManagerHelper(applicationContext)
            val prefs = AppPreferences(applicationContext)
            val db = UsageDatabase.getInstance(applicationContext)
            val dao = db.usageDao()

            val today = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
            val deviceId = prefs.getDeviceId()

            val usages = helper.getUsageStatsForDate(today, deviceId)
            if (usages.isNotEmpty()) {
                dao.upsertAll(usages)
            }

            // Prune old data if retention set
            val retentionDays = prefs.retentionDays
            if (retentionDays > 0 && retentionDays < 3650) {
                val cal = java.util.Calendar.getInstance()
                cal.add(java.util.Calendar.DAY_OF_YEAR, -retentionDays)
                val cutoffDate = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(cal.time)
                dao.pruneOldSyncedData(cutoffDate)
            }

            // Trigger sync worker if pending records exist
            val pendingCount = dao.getPendingSyncCount()
            if (pendingCount > 0) {
                val syncConstraints = Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build()

                val syncRequest = OneTimeWorkRequestBuilder<SyncWorker>()
                    .setConstraints(syncConstraints)
                    .build()

                WorkManager.getInstance(applicationContext).enqueue(syncRequest)
            }

            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
