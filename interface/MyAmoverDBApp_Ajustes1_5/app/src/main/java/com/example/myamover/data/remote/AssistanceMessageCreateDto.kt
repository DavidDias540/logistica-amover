package com.example.myamover.data.remote

import kotlinx.serialization.Serializable

@Serializable
data class AssistanceMessageCreateDto(
    val text: String,
    val sender: String? = null
)
