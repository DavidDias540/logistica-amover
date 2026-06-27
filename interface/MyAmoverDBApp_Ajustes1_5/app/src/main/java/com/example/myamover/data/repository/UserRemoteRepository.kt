package com.example.myamover.data.repository

import com.example.myamover.data.remote.UserRemote
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class UserRemoteRepository {
    suspend fun getAllUsers(): List<UserRemote> = withContext(Dispatchers.IO) {
        emptyList()
    }
    suspend fun getUserbyId(userId: String): UserRemote = withContext(Dispatchers.IO) {
        UserRemote(id = 1L, name = "Mock User", uuid = userId)
    }
}
