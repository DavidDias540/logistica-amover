package com.example.myamover.data.remote

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable


@Serializable
data class UserRemote (
    @SerialName("id")
    val id: Long? = null,      // int8 (opcional)
    val name: String,
    val uuid: String? = null,  // UUID do auth.user.id
    val photoUrl: String? = null,
    val email: String? = null,
    @SerialName("requiresPasswordChange")
    val requiresPasswordChange: Boolean? = false
)