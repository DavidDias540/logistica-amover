package com.example.myamover.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Modelo principal de uma Rota.
 *
 * Este objeto representa o JSON completo da rota diária,
 * normalmente vindo da API de rotas ou devolvido pelo PATCH de tarefas.
 */
@Serializable
data class RouteJson(
    /** Lista ordenada de nós da rota. Cada nó representa o armazém (depot) ou uma paragem de entrega. */
    val nodes: List<RouteNode>,
    /** Versão da rota (para distinguir cenários A/B/C). Pode ser null. */
    val version: Int? = null,
    /** Identificador da rota no backend. */
    @SerialName("route_id") val routeId: Int? = null
)

/**
 * Representa um nó individual da rota.
 * Pode ser um DEPOT (armazém) ou uma TASK (entrega/serviço ao cliente).
 */
@Serializable
data class RouteNode(
    /** Identificador único do nó dentro da rota. */
    val id: Int,
    /** Coordenada X (longitude). */
    val x: Double,
    /** Coordenada Y (latitude). */
    val y: Double,
    /** Tipo de nó: "depot" ou "delivery". */
    val type: String? = null,
    /** Notas associadas à tarefa. */
    val notes: String? = null,
    /** Estado da tarefa: "pending", "in_progress", "completed". */
    val status: String? = null,
    /** ID da tarefa associada a este nó. */
    @SerialName("id_task")
    val idTask: Int? = null,
    /** Nome do cliente associado à tarefa. */
    @SerialName("name_client")
    val nameClient: String? = null,
    /** Endereço onde a tarefa deve ser realizada. */
    @SerialName("address_task")
    val addressTask: String? = null,
    /** Instruções específicas para esta paragem. */
    val instructions: String? = null,
    /** Início da janela temporal da tarefa. Exemplo: "09:00" */
    @SerialName("time_window_start")
    val timeWindowStart: String? = null,
    /** Fim da janela temporal da tarefa. Exemplo: "12:00" */
    @SerialName("time_window_end")
    val timeWindowEnd: String? = null,
    /** Indica se este nó é o armazém/depot (true) ou uma paragem normal (false). */
    @SerialName("is_depot")
    val isDepot: Boolean? = null
)
