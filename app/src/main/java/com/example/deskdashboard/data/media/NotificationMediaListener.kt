package com.example.deskdashboard.data.media

import android.content.ComponentName
import android.content.Context
import android.media.MediaMetadata
import android.media.session.MediaController
import android.media.session.MediaSessionManager
import android.media.session.PlaybackState
import android.os.SystemClock
import android.service.notification.NotificationListenerService
import com.example.deskdashboard.data.model.MediaTrackState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class NotificationMediaListener : NotificationListenerService() {
    private var mediaSessionManager: MediaSessionManager? = null
    private var activeController: MediaController? = null

    private val sessionsChangedListener =
        MediaSessionManager.OnActiveSessionsChangedListener { controllers ->
            updateActiveController(controllers)
        }

    private val controllerCallback = object : MediaController.Callback() {
        override fun onPlaybackStateChanged(state: PlaybackState?) = syncTrackState()
        override fun onMetadataChanged(metadata: MediaMetadata?) = syncTrackState()
        override fun onSessionDestroyed() {
            activeController = null
            _trackState.value = MediaTrackState(isActive = false)
        }
    }

    override fun onListenerConnected() {
        super.onListenerConnected()
        instance = this
        val componentName = ComponentName(this, NotificationMediaListener::class.java)
        mediaSessionManager = getSystemService(Context.MEDIA_SESSION_SERVICE) as MediaSessionManager
        try {
            mediaSessionManager?.addOnActiveSessionsChangedListener(sessionsChangedListener, componentName)
            updateActiveController(mediaSessionManager?.getActiveSessions(componentName))
        } catch (e: SecurityException) {
            e.printStackTrace()
        }
    }

    override fun onListenerDisconnected() {
        mediaSessionManager?.removeOnActiveSessionsChangedListener(sessionsChangedListener)
        activeController?.unregisterCallback(controllerCallback)
        instance = null
        super.onListenerDisconnected()
    }

    private fun updateActiveController(controllers: List<MediaController>?) {
        activeController?.unregisterCallback(controllerCallback)
        activeController = controllers?.firstOrNull()
        activeController?.registerCallback(controllerCallback)
        syncTrackState()
    }

    private fun syncTrackState() {
        val controller = activeController ?: run {
            _trackState.value = MediaTrackState(isActive = false)
            return
        }
        val metadata = controller.metadata
        val playbackState = controller.playbackState

        val title = metadata?.getString(MediaMetadata.METADATA_KEY_TITLE) ?: "Неизвестный трек"
        val artist = metadata?.getString(MediaMetadata.METADATA_KEY_ARTIST)
            ?: metadata?.getString(MediaMetadata.METADATA_KEY_ALBUM_ARTIST)
            ?: "Неизвестный исполнитель"
        val art = metadata?.getBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART)
            ?: metadata?.getBitmap(MediaMetadata.METADATA_KEY_ART)

        _trackState.value = MediaTrackState(
            isActive = true,
            title = title,
            artist = artist,
            albumArt = art,
            isPlaying = playbackState?.state == PlaybackState.STATE_PLAYING,
            positionMs = playbackState?.position ?: 0L,
            durationMs = metadata?.getLong(MediaMetadata.METADATA_KEY_DURATION) ?: 0L,
            lastUpdateTimestampMs = SystemClock.elapsedRealtime()
        )
    }

    companion object {
        private var instance: NotificationMediaListener? = null
        private val _trackState = MutableStateFlow(MediaTrackState())
        val trackState: StateFlow<MediaTrackState> = _trackState.asStateFlow()

        fun playPause() {
            val controls = instance?.activeController?.transportControls ?: return
            if (_trackState.value.isPlaying) controls.pause() else controls.play()
        }
        fun skipToNext() { instance?.activeController?.transportControls?.skipToNext() }
        fun skipToPrevious() { instance?.activeController?.transportControls?.skipToPrevious() }
    }
}
