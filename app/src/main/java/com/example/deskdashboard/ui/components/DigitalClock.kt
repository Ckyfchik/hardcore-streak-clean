package com.example.deskdashboard.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale

@Composable
fun DigitalClock(isStandbyMode: Boolean, accentColor: Color, modifier: Modifier = Modifier) {
    var currentTime by remember { mutableStateOf(LocalDateTime.now()) }
    var burnInOffset by remember { mutableStateOf(IntOffset.Zero) }

    LaunchedEffect(Unit) {
        while (true) {
            currentTime = LocalDateTime.now()
            delay(1000L)
        }
    }
    LaunchedEffect(isStandbyMode) {
        if (isStandbyMode) {
            while (true) {
                delay(120_000L)
                burnInOffset = IntOffset((-6..6).random(), (-6..6).random())
            }
        } else {
            burnInOffset = IntOffset.Zero
        }
    }

    val timeFormatter = remember { DateTimeFormatter.ofPattern("HH:mm") }
    val dateFormatter = remember { DateTimeFormatter.ofPattern("EEEE, d MMMM", Locale("ru")) }
    val glowRadius by animateFloatAsState(
        targetValue = if (isStandbyMode) 45f else 0f,
        animationSpec = tween(durationMillis = 1000),
        label = "glow"
    )

    Column(modifier = modifier.offset { burnInOffset }, horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = currentTime.format(timeFormatter),
            style = TextStyle(
                fontSize = 112.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                letterSpacing = (-2).sp,
                shadow = Shadow(
                    color = accentColor.copy(alpha = if (isStandbyMode) 0.75f else 0f),
                    offset = Offset.Zero,
                    blurRadius = glowRadius
                )
            )
        )
        AnimatedVisibility(
            visible = !isStandbyMode,
            enter = fadeIn(tween(600)) + slideInVertically(tween(600)) { -20 },
            exit = fadeOut(tween(600)) + slideOutVertically(tween(600)) { -20 }
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = currentTime.format(dateFormatter).replaceFirstChar { it.uppercase() },
                    style = TextStyle(
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.White.copy(alpha = 0.65f),
                        letterSpacing = 0.5.sp
                    )
                )
            }
        }
    }
}
