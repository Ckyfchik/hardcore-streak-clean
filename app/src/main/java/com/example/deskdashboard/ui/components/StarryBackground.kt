package com.example.deskdashboard.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import kotlin.random.Random

private data class Star(val xFraction: Float, val yFraction: Float, val radius: Float, val alpha: Float)

@Composable
fun StarryBackground(isDayTime: Boolean, modifier: Modifier = Modifier) {
    val stars = remember {
        val random = Random(42)
        List(120) {
            Star(
                xFraction = random.nextFloat(),
                yFraction = random.nextFloat(),
                radius = random.nextFloat() * 2.5f + 0.8f,
                alpha = random.nextFloat() * 0.4f + 0.1f
            )
        }
    }
    val gradientColors = if (isDayTime) {
        listOf(Color(0xFF050507), Color(0xFF14080A), Color(0xFF080507))
    } else {
        listOf(Color(0xFF04060A), Color(0xFF091224), Color(0xFF030508))
    }
    Box(modifier = modifier.fillMaxSize().background(Brush.verticalGradient(gradientColors))) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            stars.forEach { star ->
                drawCircle(
                    color = Color.White.copy(alpha = star.alpha),
                    radius = star.radius,
                    center = Offset(star.xFraction * size.width, star.yFraction * size.height)
                )
            }
        }
    }
}
