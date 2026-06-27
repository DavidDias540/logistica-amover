package com.example.myamover.data.remote

import kotlinx.serialization.Serializable
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PATCH
import retrofit2.http.Path
import retrofit2.http.Query


/**
 * TaskApiService
 *
 * Interface Retrofit que define todos os endpoints
 * relacionados com:
 * - tarefas (tasks)
 * - rotas diárias (routes)
 *
 * O Retrofit gera automaticamente a implementação
 * desta interface em tempo de execução.
 */
interface TaskApiService {

    /**
     * Request body usado para atualizar uma tarefa.
     *
     * Atualmente usado apenas para alterar o estado (status),
     * por exemplo:
     * - "pending"
     * - "in_progress"
     * - "completed"
     */

    @Serializable
    data class TaskUpdateRequest(
        val status: String
    )

    @Serializable
    data class UpdateTaskResponse(
        val message: String
    )

    @Serializable
    data class ReoptimizeLiveRequest(
        val vehicleId: Int,
        val date: String,
        val taskIds: List<Int>,
        val currentLat: Float,
        val currentLng: Float
    )

    @Serializable
    data class ReoptimizeResponse(
        val message: String
    )

    @GET("api/Task/driver/{userId}")
    suspend fun getTasksByCourier(
        @Path("userId") courierId: Int
    ): List<TaskRemote>

    @PATCH("api/Task/{id}/node/{nodeID}/status")
    suspend fun updateNodeStatus(
        @Path("id") taskId: Int,
        @Path("nodeID") nodeID: Int,
        @Body body: TaskUpdateRequest
    ): UpdateTaskResponse

    @POST("api/Route/group/{routeGroupId}/finish")
    suspend fun finishRouteGroup(
        @Path("routeGroupId") routeGroupId: String
    ): retrofit2.Response<Unit>

    @POST("api/Route/reoptimize-live")
    suspend fun reoptimizeLiveRoute(
        @Body request: ReoptimizeLiveRequest
    ): ReoptimizeResponse

    @GET("api/Route")
    suspend fun getDailyRoute(
        @Query("vehicleId") vehicleId: Int,
        @Query("date") date: String
    ): List<RouteGroupRemote>

    @GET("api/Route/driver/{userId}")
    suspend fun getDailyRouteForDriver(
        @Path("userId") userId: Int,
        @Query("date") date: String
    ): List<RouteGroupRemote>

    @GET("api/User/byEmail/{email}")
    suspend fun getUserByEmail(
        @Path("email") email: String
    ): UserRemote

    @GET("api/Vehicle")
    suspend fun getAllVehicles(): List<VehicleRemote>

    @Serializable
    data class ForgotPasswordRequest(val email: String)

    @Serializable
    data class ForgotPasswordResponse(val message: String)

    @POST("api/User/forgot-password")
    suspend fun forgotPassword(
        @Body request: ForgotPasswordRequest
    ): ForgotPasswordResponse

    @retrofit2.http.PUT("api/User/change-password")
    suspend fun changePassword(
        @Body request: Map<String, String>
    ): retrofit2.Response<Unit>

    // ───────────────────── ASSISTÊNCIA / CHAT ─────────────────────
    @GET("api/Assistance")
    suspend fun getAssistanceRequests(): List<AssistanceRequestRemote>

    @POST("api/Assistance")
    suspend fun createAssistanceRequest(
        @Body request: AssistanceRequestRemote
    ): AssistanceRequestRemote

    @POST("api/Assistance/{id}/messages")
    suspend fun sendAssistanceMessage(
        @Path("id") id: Int,
        @Body message: AssistanceMessageCreateDto
    ): AssistanceMessageRemote
}


/*
Diferença entre GET /tasks, PATCH /tasks/{id} e GET /routes/today

✔ Quando e porquê o backend devolve uma nova rota
✔ Porque route pode ser null
✔ Como o Retrofit faz o binding automático dos endpoints
 */
