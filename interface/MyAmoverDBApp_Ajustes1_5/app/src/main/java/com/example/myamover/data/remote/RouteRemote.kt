package com.example.myamover.data.remote

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class RouteGroupRemote(
    val id: String,
    @SerialName("vehicle_id")
    val vehicleId: Int,
    @SerialName("route_date")
    val routeDate: String,
    val isOptimized: Boolean,
    val routePoints: List<RoutePointRemote>
)

@Serializable
data class RoutePointRemote(
    val id: Int,
    val stopOrder: Int,
    val task: TaskRemote
)
