package com.example.myamover.data.repository

import android.net.Uri
import com.example.myamover.data.network.RetrofitProvider
import com.example.myamover.data.remote.TaskApiService
import com.example.myamover.data.remote.TaskRemote
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

import retrofit2.HttpException

class TaskRemoteRepository(
    private val api: TaskApiService = RetrofitProvider.taskApi
) {

    suspend fun getAllTasksByCourier(courierId: Int): List<TaskRemote> =
        withContext(Dispatchers.IO) {
            try {
                api.getTasksByCourier(courierId)
            } catch (e: HttpException) {
                if (e.code() == 404) emptyList() else throw e
            }
        }

    suspend fun getDailyRoute(courierId: Int, date: String): List<com.example.myamover.data.remote.RouteGroupRemote> =
        withContext(Dispatchers.IO) {
            try {
                api.getDailyRouteForDriver(courierId, date)
            } catch (e: HttpException) {
                if (e.code() == 404) emptyList() else throw e
            }
        }

    suspend fun reoptimizeLiveRoute(vehicleId: Int, date: String, taskIds: List<Int>, currentLat: Float, currentLng: Float) =
        withContext(Dispatchers.IO) {
            val request = TaskApiService.ReoptimizeLiveRequest(
                vehicleId = vehicleId,
                date = date,
                taskIds = taskIds,
                currentLat = currentLat,
                currentLng = currentLng
            )
            api.reoptimizeLiveRoute(request)
        }

    suspend fun completeTask(
        taskId: Int,
        nodeId: Int,
        status: String,
        notes: String,
        photos: List<Uri>,
        signature: Uri?
    ): TaskApiService.UpdateTaskResponse? = withContext(Dispatchers.IO) {
        val res = api.updateNodeStatus(
            taskId,
            nodeId,
            TaskApiService.TaskUpdateRequest(status = status)
        )
        res
    }

    suspend fun finishRouteGroup(routeGroupId: String) = withContext(Dispatchers.IO) {
        api.finishRouteGroup(routeGroupId)
    }
}