package com.example.myamover.data.remote

import kotlinx.serialization.Serializable

@Serializable
data class VehicleRemote(
    val id: Int,
    val vid: String? = null,
    val name: String,
    val brand: String? = null,
    val model: String? = null,
    val status: String? = null,
    val ownerID: Int? = null
)
