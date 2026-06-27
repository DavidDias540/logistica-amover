package com.example.myamover.data.remote

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class AssistanceRequestRemote(
    val id: Int = 0,
    val reason: String,
    val subject: String,
    val date: String,
    val status: String = "Open",
    @SerialName("targetUserID")
    val targetUserID: Int? = null,
    @SerialName("targetUser")
    val targetUser: UserRemote? = null,
    val messages: List<AssistanceMessageRemote> = emptyList()
)

@Serializable
data class AssistanceMessageRemote(
    val id: Int = 0,
    val text: String,
    val sender: String,
    val timestamp: String,
    @SerialName("assistanceRequestID")
    val assistanceRequestID: Int = 0
)
