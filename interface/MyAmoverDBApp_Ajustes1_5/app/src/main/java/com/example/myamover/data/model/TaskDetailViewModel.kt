package com.example.myamover.data.model

import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.example.myamover.data.remote.ClientRemote
import com.example.myamover.data.remote.LocationNodeRemote
import com.example.myamover.data.remote.TaskRemote
import com.example.myamover.data.repository.AuthRepository
import com.example.myamover.data.repository.ClientRemoteRepository
import com.example.myamover.data.repository.CourierRepository
import com.example.myamover.data.repository.TaskRemoteRepository
import com.example.myamover.model.TaskRemoteViewModel
import com.example.myamover.screens.details.TaskDetailScreen

@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun TaskDetailRoute(
    taskId: Int,
    onBack: () -> Unit,
    windowSize: WindowWidthSizeClass,
    vm: TaskRemoteViewModel,
) {
    val uiState by vm.ui.collectAsState()

    var task by remember { mutableStateOf<TaskRemote?>(null) }
    var client by remember { mutableStateOf<ClientRemote?>(null) }
    var node by remember { mutableStateOf<LocationNodeRemote?>(null) }
    var loading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

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
        node = null

        runCatching {
            val courierId = courierRepo.getCourierIdByCurrentUser()

            val foundTask = taskRepo
                .getAllTasksByCourier(courierId)
                .firstOrNull { it.id == taskId }
                ?: throw IllegalStateException("Task não encontrada (id=$taskId)")

            val foundNode = foundTask.nodes?.firstOrNull()

            val clientId = foundTask.clientID
            val foundClient = if (clientId != null) {
                clientRepo.getAllClient().firstOrNull { it.id == clientId }
            } else {
                null
            } ?: com.example.myamover.data.remote.ClientRemote(id = 0, name = "Sem Cliente", phone = "", address = "", lat = 0.0, lng = 0.0)

            Triple(foundTask, foundClient, foundNode)
        }.onSuccess { (foundTask, foundClient, foundNode) ->
            task = foundTask
            client = foundClient
            node = foundNode
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
            TaskDetailScreen(
                task = task!!,
                client = client!!,
                node = node,
                onComplete = { status, photos, signatureUri, notes ->
                    vm.completeTaskAndRefresh(
                        taskId = taskId,
                        nodeId = node?.id ?: 0,
                        status = status,
                        notes = notes,
                        photos = photos,
                        signature = signatureUri,
                        onSuccess = { 
                            val routeGroup = vm.ui.value.activeRoutes.find { group -> 
                                group.routePoints.any { it.task.id == taskId } 
                            }
                            if (routeGroup != null) {
                                vm.triggerAutoStartRoute(routeGroup.id)
                            }
                            onBack() 
                        },
                        onError = { msg -> errorMessage = msg }
                    )
                }
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