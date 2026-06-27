package com.example.myamover.data.repository

import com.example.myamover.data.remote.CourierRemote
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class CourierRepository(
    private val authRepository: AuthRepository
) {

    suspend fun getCourierByCurrentUser(): CourierRemote {
        return withContext(Dispatchers.IO) {
            val userEmail = com.example.myamover.data.network.TokenManager.getUserEmail() ?: ""
            val backendUser = com.example.myamover.data.network.RetrofitProvider.taskApi.getUserByEmail(userEmail)
            CourierRemote(id = backendUser.id?.toInt(), name = backendUser.name, uuid = "")
        }
    }

    suspend fun getCourierIdByCurrentUser(): Int {
        val courier = getCourierByCurrentUser()
        return requireNotNull(courier.id) { "Courier sem id" }
    }
}