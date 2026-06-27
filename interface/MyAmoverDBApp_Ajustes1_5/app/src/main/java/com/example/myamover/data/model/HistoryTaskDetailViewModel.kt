package com.example.myamover.data.model

import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.example.myamover.data.remote.ClientRemote
import com.example.myamover.data.remote.TaskRemote
import com.example.myamover.data.repository.AuthRepository
import com.example.myamover.data.repository.ClientRemoteRepository
import com.example.myamover.data.repository.CourierRepository
import com.example.myamover.data.repository.TaskRemoteRepository
import com.example.myamover.screens.details.HistoryDetailScreen

@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun HistoryTaskDetailRoute(
    taskId: Int,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    var loading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var task by remember { mutableStateOf<TaskRemote?>(null) }
    var client by remember { mutableStateOf<ClientRemote?>(null) }

    val taskRepo = remember { TaskRemoteRepository() }
    val clientRepo = remember { ClientRemoteRepository() }
    val courierRepo = remember {
        CourierRepository(
            authRepository = AuthRepository()
        )
    }
    LaunchedEffect(taskId) {
        loading = true
        errorMessage = null
        task = null
        client = null

        runCatching {
            val courierId: Int = courierRepo.getCourierIdByCurrentUser()

            val tasks = taskRepo.getAllTasksByCourier(courierId)

            val foundTask = tasks.firstOrNull { it.id == taskId }
                ?: throw IllegalStateException("Task não encontrada (id=$taskId)")

            val clientId = foundTask.clientID
                ?: throw IllegalStateException("Task sem client_id (id=$taskId)")

            val clients: List<ClientRemote> = clientRepo.getAllClient()

            val foundClient: ClientRemote = clients.firstOrNull { it.id == clientId }
                ?: throw IllegalStateException("Cliente não encontrado (id=$clientId)")

            foundTask to foundClient

        }.onSuccess { (foundTask, foundClient) ->
            task = foundTask
            client = foundClient
        }.onFailure { e ->
            errorMessage = e.message ?: "Erro ao carregar detalhe"
        }

        loading = false
    }

    when {
        loading -> Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator()
        }

        errorMessage != null -> Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = errorMessage!!,
                color = MaterialTheme.colorScheme.error
            )
        }

        task != null && client != null -> {
            HistoryDetailScreen(
                task = task!!,
                client = client!!,
                onBack = onBack,
                modifier = modifier
            )
        }

        else -> Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text("Sem dados.")
        }
    }
}