package com.screentime.ku

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "usage_entity",
    indices = [
        Index(value = ["deviceId", "usageDate", "packageName"], unique = true)
    ]
)
data class UsageEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val deviceId: String,
    val usageDate: String, // "YYYY-MM-DD"
    val packageName: String,
    val appName: String,
    val totalTimeForeground: Long, // in milliseconds
    val usageMinutes: Int,
    val openCount: Int = 0,
    val firstUsedAt: Long = 0,
    val lastUsedAt: Long = 0,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val syncStatus: String = "PENDING" // "PENDING", "SYNCED", "FAILED"
)
