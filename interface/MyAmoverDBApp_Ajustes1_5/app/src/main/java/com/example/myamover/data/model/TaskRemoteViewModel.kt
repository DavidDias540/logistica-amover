package com.example.myamover.model

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.myamover.data.model.TaskRemoteUiState
import com.example.myamover.data.repository.AuthRepository
import com.example.myamover.data.repository.CourierRepository
import com.example.myamover.data.repository.TaskRemoteRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class TaskRemoteViewModel(
    private val repo: TaskRemoteRepository = TaskRemoteRepository()
) : ViewModel() {

    private val courierRepository = CourierRepository(
        authRepository = AuthRepository()
    )

    private val _ui = MutableStateFlow(TaskRemoteUiState())
    val ui: StateFlow<TaskRemoteUiState> = _ui

    init {
        loadTasks()
    }

    private suspend fun resolveCourierId(): Int {
        return courierRepository.getCourierIdByCurrentUser()
            ?: throw IllegalStateException("Courier não encontrado para o utilizador autenticado")
    }

    fun loadTasks() {
        _ui.value = _ui.value.copy(loading = true, error = null)

        viewModelScope.launch {
            runCatching {
                val courierId = resolveCourierId()
                
                // Fetch tasks assigned to the courier
                val rawTasks = repo.getAllTasksByCourier(courierId)
                
                val vehicleId = rawTasks.firstOrNull()?.vehicleID ?: 1
                
                val dateFormat = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
                val today = dateFormat.format(java.util.Date())
                
                // Fetch optimized route from /api/Route/driver/{userId}
                val routeGroups = try {
                    repo.getDailyRoute(courierId, today)
                } catch(e: Exception) {
                    emptyList<com.example.myamover.data.remote.RouteGroupRemote>()
                }

                _ui.update { it.copy(
                    loading = false,
                    tasks = rawTasks,
                    activeRoutes = routeGroups
                ) }
            }.onFailure { ex ->
                _ui.update { it.copy(loading = false, error = ex.message) }
            }
        }
    }
    
    fun reoptimizeRoute(taskIds: List<Int>, currentLat: Float, currentLng: Float, routeGroupId: String, onComplete: (com.example.myamover.data.remote.RouteGroupRemote?) -> Unit) {
        _ui.value = _ui.value.copy(loading = true, error = null)

        viewModelScope.launch {
            runCatching {
                val courierId = resolveCourierId()
                val rawTasks = repo.getAllTasksByCourier(courierId)
                val vehicleId = rawTasks.firstOrNull()?.vehicleID ?: 1
                
                val dateFormat = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
                val today = dateFormat.format(java.util.Date())
                
                repo.reoptimizeLiveRoute(vehicleId, today, taskIds, currentLat, currentLng)
                
                // Reload route after optimization
                val routeGroups = try {
                    repo.getDailyRoute(vehicleId, today)
                } catch(e: Exception) {
                    emptyList<com.example.myamover.data.remote.RouteGroupRemote>()
                }

                // The backend generates a new RouteGroupId, so we find the new group by looking for one of our tasks
                val firstTaskId = taskIds.firstOrNull()
                val updatedGroup = routeGroups.find { group -> 
                    group.routePoints.any { it.task.id == firstTaskId } 
                }
                
                Pair(routeGroups, updatedGroup)
            }.onSuccess { (routeGroups, updatedGroup) ->
                _ui.update { it.copy(
                    loading = false,
                    activeRoutes = routeGroups
                ) }
                onComplete(updatedGroup)
            }.onFailure { ex ->
                _ui.update { it.copy(loading = false, error = ex.message) }
            }
        }
    }
    
    fun loadHistoryRoutes(date: String) {
        _ui.value = _ui.value.copy(loading = true, error = null)

        viewModelScope.launch {
            runCatching {
                val courierId = resolveCourierId()
                val rawTasks = repo.getAllTasksByCourier(courierId)
                val vehicleId = rawTasks.firstOrNull()?.vehicleID ?: 1
                
                val routeGroups = try {
                    repo.getDailyRoute(courierId, date)
                } catch(e: Exception) {
                    emptyList<com.example.myamover.data.remote.RouteGroupRemote>()
                }

                _ui.update { it.copy(loading = false, historyRoutes = routeGroups) }
            }.onFailure { ex ->
                _ui.update { it.copy(loading = false, error = ex.message) }
            }
        }
    }

    fun clearTasks() {
        _ui.value = _ui.value.copy(tasks = emptyList())
    }

    fun completeTaskAndRefresh(
        taskId: Int,
        nodeId: Int,
        onSuccess: () -> Unit,
        onError: (String) -> Unit,
        status: String,
        notes: String,
        photos: List<Uri>,
        signature: Uri?
    ) {
        viewModelScope.launch {
            runCatching {
                repo.completeTask(
                    taskId = taskId,
                    nodeId = nodeId,
                    status = status,
                    notes = notes,
                    photos = photos,
                    signature = signature
                )
            }.onSuccess {
                val updatedRoutes = _ui.value.activeRoutes.map { group ->
                    group.copy(routePoints = group.routePoints.map { rp ->
                        if (rp.task.id == taskId) {
                            rp.copy(task = rp.task.copy(status = status))
                        } else rp
                    })
                }
                _ui.update { it.copy(activeRoutes = updatedRoutes) }

                loadTasks()
                onSuccess()
            }.onFailure { e ->
                onError(e.message ?: "Erro ao completar tarefa")
            }
        }
    }

    fun triggerAutoStartRoute(routeGroupId: String) {
        _ui.update { it.copy(autoStartRouteTrigger = routeGroupId) }
    }

    fun consumeAutoStartRoute() {
        _ui.update { it.copy(autoStartRouteTrigger = null) }
    }

    fun finishRouteGroup(
        routeGroupId: String,
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        viewModelScope.launch {
            runCatching {
                repo.finishRouteGroup(routeGroupId)
            }.onSuccess { response ->
                if (response.isSuccessful) {
                    loadTasks()
                    onSuccess()
                } else {
                    onError("Erro do servidor: ${response.code()}")
                }
            }.onFailure { e ->
                onError(e.message ?: "Erro de rede ao terminar rota")
            }
        }
    }

    fun acknowledgeRouteFinished(routeGroupId: String) {
        _ui.update { state -> 
            state.copy(acknowledgedFinishedRoutes = state.acknowledgedFinishedRoutes + routeGroupId) 
        }
    }
}