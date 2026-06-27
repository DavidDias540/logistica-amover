package com.example.myamover.data.model

import com.example.myamover.data.remote.TaskRemote

/**
 * Estado da UI para o ecrã de Tasks e Rota diária.
 *
 * Este UiState é observado pela UI (Compose) através de StateFlow.
 * Sempre que algum campo muda, a UI é redesenhada automaticamente.
 */
data class TaskRemoteUiState(

    /** Indica se a lista de tarefas está a ser carregada. */
    val loading: Boolean = false,

    /** Indica se a rota diária está a ser carregada ou atualizada. */
    val loadingRoute: Boolean = false,

    /** Lista de tarefas recebidas do backend. */
    val tasks: List<TaskRemote> = emptyList(),

    /** Mensagem de erro a apresentar na UI (null se não houver erro). */
    val error: String? = null,

    /** Rotas ativas do dia atual. */
    val activeRoutes: List<com.example.myamover.data.remote.RouteGroupRemote> = emptyList(),

    /** Rotas finalizadas ou rotas históricas carregadas por data. */
    val historyRoutes: List<com.example.myamover.data.remote.RouteGroupRemote> = emptyList(),

    /** Gatilho para iniciar automaticamente uma rota reotimizada após a conclusão de uma tarefa. Guarda o RouteGroupId. */
    val autoStartRouteTrigger: String? = null,

    /** IDs das rotas ativas que o utilizador já marcou como terminadas hoje na UI (Sim). */
    val acknowledgedFinishedRoutes: Set<String> = emptySet()
)
