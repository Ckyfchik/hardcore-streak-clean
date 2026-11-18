package com.example.deskdashboard.ui.screen

import androidx.compose.animation.*
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.BiasAlignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.PointerEventPass
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.compose.ui.platform.LocalLifecycleOwner
import com.example.deskdashboard.data.media.NotificationMediaListener
import com.example.deskdashboard.data.media.NotificationPermissionHelper
import com.example.deskdashboard.ui.components.DigitalClock
import com.example.deskdashboard.ui.components.MediaPlayerCard
import com.example.deskdashboard.ui.components.MediaPlayerCard
import com.example.deskdashboard.ui.components.StarryBackground
import kotlinx.coroutines.delay
import java.time.LocalTime

private const val INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000L

@Composable
fun DashboardScreen() {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    var isStandbyMode by remember { mutableStateOf(false) }
    var interactionTick by remember { mutableIntStateOf(0) }

    val trackState by NotificationMediaListener.trackState.collectAsState()
    var hasNotificationPermission by remember { mutableStateOf(NotificationPermissionHelper.isPermissionGranted(context)) }
    var isDayTime by remember { mutableStateOf(LocalTime.now().hour in 7..18) }

    LaunchedEffect(Unit) {
        while (true) {
            isDayTime = LocalTime.now().hour in 7..18
            delay(60_000L)
        }
    }
    val accentColor = if (isDayTime) Color(0xFFFF6D00) else Color(0xFF00E5FF)

    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
                hasNotificationPermission = NotificationPermissionHelper.isPermissionGranted(context)
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    LaunchedEffect(interactionTick) {
        isStandbyMode = false
        delay(INACTIVITY_TIMEOUT_MS)
        isStandbyMode = true
    }

    val clockVerticalBias by animateFloatAsState(
        targetValue = if (isStandbyMode) 0f else -0.32f,
        animationSpec = tween(durationMillis = 800),
        label = "bias"
    )

    Box(
        modifier = Modifier.fillMaxSize().pointerInput(Unit) {
            awaitPointerEventScope {
                while (true) {
                    val event = awaitPointerEvent(PointerEventPass.Initial)
                    if (event.changes.any { it.pressed }) interactionTick++
                }
            }
        }
    ) {
        StarryBackground(isDayTime = isDayTime)
        DigitalClock(isStandbyMode = isStandbyMode, accentColor = accentColor, modifier = Modifier.align(BiasAlignment(0f, clockVerticalBias)))
        AnimatedVisibility(
            visible = !isStandbyMode,
            modifier = Modifier.align(Alignment.BottomCenter).padding(horizontal = 24.dp, vertical = 28.dp),
            enter = fadeIn(tween(600)) + slideInVertically(tween(600)) { it / 2 },
            exit = fadeOut(tween(600)) + slideOutVertically(tween(600)) { it / 2 }
        ) {
            MediaPlayerCard(
                trackState = trackState,
                hasPermission = hasNotificationPermission,
                accentColor = accentColor,
                modifier = Modifier.widthIn(max = 640.dp)
            )
        }
    }
}
