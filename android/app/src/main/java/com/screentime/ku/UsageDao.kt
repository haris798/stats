package com.screentime.ku

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update

@Dao
interface UsageDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertUsage(usage: UsageEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(usages: List<UsageEntity>)

    @Query("SELECT * FROM usage_entity WHERE usageDate = :date ORDER BY usageMinutes DESC")
    suspend fun getUsageForDate(date: String): List<UsageEntity>

    @Query("SELECT * FROM usage_entity WHERE usageDate BETWEEN :startDate AND :endDate ORDER BY usageDate DESC, usageMinutes DESC")
    suspend fun getUsageForRange(startDate: String, endDate: String): List<UsageEntity>

    @Query("SELECT * FROM usage_entity WHERE syncStatus = 'PENDING' OR syncStatus = 'FAILED'")
    suspend fun getPendingSyncUsages(): List<UsageEntity>

    @Query("UPDATE usage_entity SET syncStatus = :status, updatedAt = :updatedAt WHERE id IN (:ids)")
    suspend fun updateSyncStatus(ids: List<Long>, status: String, updatedAt: Long = System.currentTimeMillis())

    @Query("SELECT COUNT(*) FROM usage_entity WHERE syncStatus = 'PENDING' OR syncStatus = 'FAILED'")
    suspend fun getPendingSyncCount(): Int

    @Query("DELETE FROM usage_entity WHERE usageDate < :cutoffDate AND syncStatus = 'SYNCED'")
    suspend fun pruneOldSyncedData(cutoffDate: String): Int

    @Query("SELECT DISTINCT usageDate FROM usage_entity ORDER BY usageDate DESC")
    suspend fun getAllUsageDates(): List<String>
}
