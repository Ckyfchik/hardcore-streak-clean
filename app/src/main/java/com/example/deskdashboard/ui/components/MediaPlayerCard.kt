package com.example.deskdashboard.ui.components

import android.os.SystemClock
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.basicMarquee
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.deskdashboard.data.media.NotificationMediaListener
import com.example.deskdashboard.data.media.NotificationPermissionHelper
import com.example.deskdashboard.data.model.MediaTrackState
import kotlinx.coroutines.delay

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun MediaPlayerCard(
    trackState: MediaTrackState,
    hasPermission: Boolean,
    accentColor: Color,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    GlassCard(modifier = modifier.fillMaxWidth(), accentColor = accentColor) {
        if (!hasPermission) {
            Column(
                modifier = Modifier.fillMaxWidth().padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("Требуется доступ куведомлениям для управления музыкой", color = Color.White.copy(alpha = 0.8f), fontSize = 14.sp)
                Spacer(modifier = Modifier.height(12.dp))
                Button(
                    onClick = { NotificationPermissionHelper.openPermissionSettings(context) },
                    colors = ButtonDefaults.buttonColors(containerColor = accentColor)
                ) {
                    Text("Выдать разрешение", color = Color.Black, fontWeight = FontWeight.Bold)
                }
            }
            return@GlassCard
        }

        var currentPosition by remember(trackState) { mutableLongStateOf(trackState.positionMs) }
        LaunchedEffect(trackState.isPlaying, trackState.positionMs, trackState.lastUpdateTimestampMs) {
            if (trackState.isPlaying) {
                while (true) {
                    val elapsed = SystemClock.elapsedRealtime() - trackState.lastUpdateTimestampMs
                    currentPosition = (trackState.positionMs + elapsed).coerceAtMost(trackState.durationMs)
                    delay(500L)
                }
            } else {
                currentPosition = trackState.positionMs
            }
        }
        val progress = if (trackState.durationMs > 0) (currentPosition.toFloat() / trackState.durationMs.toFloat()).coerceIn(0f, 1f) else 0f

        Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                Box(
                    modifier = Modifier.size(72.dp).clip(RoundedCornerShape(16.dp)).background(Color.White.copy(alpha = 0.1f)),
                    contentAlignment = Alignment.Center
                ) {
                    if (trackState.albumArt != null) {
                        Image(bitmap = trackState.albumArt.asImageBitmap(), contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
                    } else {
                        Icon(Icons.Rounded.MusicNote, contentDescription = null, tint = Color.White.copy(alpha = 0.4f), modifier = Modifier.size(32.dp))
                    }
                }
                Spacer(modifier = Modifier.width(16.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(if (trackState.isPlaying) "СЕЙЧАС ИГРАЕТ" else "НА ПАУЗЕ", color = accentColor, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(trackState.title, color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold, maxLines = 1, modifier = Modifier.basicMarquee())
                    Text(trackState.artist, color = Color.White.copy(alpha = 0.65f), fontSize = 14.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
                Spacer(modifier = Modifier.width(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    IconButton(onClick = { NotificationMediaListener.skipToPrevious() }) {
                        Icon(Icons.Rounded.SkipPrevious, contentDescription = "Назад", tint = Color.White, modifier = Modifier.size(28.dp))
                    }
                    Box(
                        modifier = Modifier.size(48.dp).clip(CircleShape).background(accentColor.copy(alpha = 0.2f)).clickable { NotificationMediaListener.playPause() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(if (trackState.isPlaying) Icons.Rounded.Pause else Icons.Rounded.PlayArrow, contentDescription = "Лей/Пауза", tint = accentColor, modifier = Modifier.size(30.dp))
                    }
                    IconButton(onClick = { NotificationMediaListener.skipToNext() }) {
                        Icon(Icons.Rounded.SkipNext, contentDescription = "Вперед", tint = Color.White, modifier = Modifier.size(28.dp))
                    }
                }
            }
            Spacer(modifier = Modifier.height(14.dp))
            LinearProgressIndicator(
                progress = { progress },
                modifier = Modifier.fillMaxWidth().height(4.dp).clip(CircleShape),
                color = accentColor,
                trackColor = Color.White.copy(alpha = 0.15f)
            )
        }
    }
}
