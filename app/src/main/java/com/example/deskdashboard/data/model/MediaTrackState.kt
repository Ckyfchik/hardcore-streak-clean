package com.example.deskdashboard.data.model

import android.graphics.Bitmap

data class MediaTrackState(
    val isActive: Boolean = false,
    val title: String = "Нет активного трека",
    val artist: String = "Запустите музыку в любом плеере",
    val albumArt: Bitmap? = null,
    val isPlaying: Boolean = false,
    val positionMs: Long = 0L,
    val durationMs: Long = 0L,
    val lastUpdateTimestampMs: Long = 0L
)
