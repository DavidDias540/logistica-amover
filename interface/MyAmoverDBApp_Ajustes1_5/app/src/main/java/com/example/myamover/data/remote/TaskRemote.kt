package com.example.myamover.data.remote

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable


/**
 * TaskRemote
 *
 * DTO (Data Transfer Object) remoto.
 * Representa **exatamente** o formato de uma tarefa
 * tal como vem do backend.
 *
 * IMPORTANTE:
 * - Este modelo NÃO deve conter lógica de negócio
 * - Serve apenas para transportar dados (JSON → Kotlin)
 */
@Serializable
data class TaskRemote constructor(
    @SerialName("id")
    val id: Int,
    
    val creationDate: String? = null,
    val type: String? = null,
    val description: String? = null,
    val status: String? = null,

    val userID: Int? = null,
    val planID: Int? = null,
    val vehicleID: Int? = null,
    val serviceID: Int? = null,
    val clientID: Int? = null,

    @SerialName("nodes")
    val nodes: List<LocationNodeRemote>? = null
)

@Serializable
data class LocationNodeRemote(
    @SerialName("id")
    val id: Int,
    val latitude: Float,
    val longintude: Float,
    val address: String,
    val status: String? = null
)

/*
Usa @Serializable → compatível com Retrofit + Kotlinx Serialization

✔ Campos opcionais evitam crashes se o backend não enviar dados
✔ Separação clara entre dados remotos e estado da UI
✔ Permite evoluir o backend sem quebrar a app

Sugestões futuras (opcionais)

1️⃣ Converter lat/lng para Double

val lat: Double?
val lng: Double?


2️⃣ Criar um modelo de domínio
TaskDomain(...)

para separar ainda mais:
DTO remoto
modelo usado pela UI
 */
