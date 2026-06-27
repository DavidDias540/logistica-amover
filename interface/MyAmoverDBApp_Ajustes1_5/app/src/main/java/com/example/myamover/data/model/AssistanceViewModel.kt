package com.example.myamover.data.model

import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.myamover.data.network.RetrofitProvider
import com.example.myamover.data.remote.AssistanceMessageCreateDto
import com.example.myamover.data.remote.AssistanceMessageRemote
import com.example.myamover.data.remote.AssistanceRequestRemote
import kotlinx.coroutines.launch
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter

class AssistanceViewModel : ViewModel() {
    val requests = mutableStateListOf<AssistanceRequestRemote>()
    val isLoading = mutableStateOf(false)
    val error = mutableStateOf<String?>(null)

    fun loadRequests() {
        viewModelScope.launch {
            isLoading.value = true
            error.value = null
            try {
                val data = RetrofitProvider.taskApi.getAssistanceRequests()
                requests.clear()
                requests.addAll(data)
            } catch (e: Exception) {
                error.value = e.message
            } finally {
                isLoading.value = false
            }
        }
    }

    fun sendMessage(requestId: Int, text: String, senderName: String, onDone: () -> Unit = {}) {
        viewModelScope.launch {
            try {
                val message = AssistanceMessageCreateDto(
                    text = text,
                    sender = senderName
                )
                RetrofitProvider.taskApi.sendAssistanceMessage(requestId, message)
                loadRequests()
                onDone()
            } catch (e: Exception) {
                android.util.Log.e("AssistanceViewModel", "Error sending message", e)
                error.value = e.message ?: "Unknown error"
            }
        }
    }

    fun createRequest(reason: String, subject: String, targetUserId: Int?, senderName: String, onDone: () -> Unit = {}) {
        viewModelScope.launch {
            try {
                val request = AssistanceRequestRemote(
                    reason = reason,
                    subject = subject,
                    date = nowIso(),
                    targetUserID = targetUserId,
                    messages = listOf(
                        AssistanceMessageRemote(
                            text = subject,
                            sender = senderName,
                            timestamp = nowIso()
                        )
                    )
                )
                RetrofitProvider.taskApi.createAssistanceRequest(request)
                loadRequests()
                onDone()
            } catch (e: Exception) {
                error.value = e.message
            }
        }
    }

    private fun nowIso(): String {
        return OffsetDateTime.now().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
    }
}
