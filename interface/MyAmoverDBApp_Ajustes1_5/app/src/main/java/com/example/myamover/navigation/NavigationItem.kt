package com.example.myamover.navigation

import androidx.annotation.StringRes
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Moped
import androidx.compose.material.icons.filled.Person
import androidx.compose.ui.graphics.vector.ImageVector
import com.example.myamover.R

/**
 * NavigationItem
 *
 * Classe selada (sealed class) que representa
 * todos os itens possíveis de navegação da aplicação.
 *
 * Cada item define:
 * - route  → rota usada pelo NavController
 * - icon   → ícone mostrado na BottomNavigation
 * - title  → texto mostrado ao utilizador
 *
 * Usar sealed class garante:
 * - conjunto fechado de destinos
 * - maior segurança em when/if
 */
sealed class NavigationItem (
    var route: String,
    var icon: ImageVector,
    @StringRes var titleRes: Int) {

    /**
     * Ecrã Home.
     *
     * A rota recebe um argumento "email",
     * normalmente passado após o login.
     *
     * Exemplo de rota final:
     * home/user@email.com
     */
    object Home : NavigationItem("home/{email}", Icons.Filled.Home, R.string.home)

    /**
     * Ecrã de Tasks (tarefas do dia).
     *
     * Mostra:
     * - lista de tarefas
     * - ações para completar tarefas
     */
    object Tasks : NavigationItem("tasks", Icons.Filled.Moped, R.string.tasks)

    /**
     * Ecrã do Mapa.
     *
     * Mostra a rota diária no mapa.
     */
    object Map : NavigationItem("map", Icons.Filled.Map, R.string.map)

    /**
     * Ecrã de Perfil do utilizador.
     *
     * Pode ainda não estar implementado,
     * mas a rota já está preparada.
     */
    object Perfil : NavigationItem("perfil", Icons.Filled.Person, R.string.perfil)

    /**
     * Ecrã de Histórico.
     *
     * Mostra tarefas concluídas anteriormente.
     */
    object History : NavigationItem("history", Icons.Filled.History, R.string.history)

    /**
     * Ecrã de Assistência / Chat.
     *
     * Permite ao condutor comunicar com a gestão.
     */
    object Assistance : NavigationItem("assistance", Icons.Filled.Email, R.string.assistance)

    /**
     * Ecrã de detalhe de uma tarefa ativa.
     *
     * Recebe o argumento "taskId".
     *
     * Exemplo de rota final:
     * TaskDetail/12
     */
    object TasKDetail : NavigationItem("TaskDetail/{taskId}", Icons.Filled.Moped, R.string.task_detail)

    /**
     * Ecrã de detalhe de uma tarefa do histórico.
     *
     * Também recebe o argumento "taskId".
     */
    object HistoryTaskDetail : NavigationItem("HistoryTaskDetail/{taskId}", Icons.Filled.Moped, R.string.task_detail)

    //Helper de escrita nas rotas, usar sempre essa função ao navegar
    fun taskDetailRoute(taskId: Int) = "TaskDetail/$taskId"

}

/*
Porque usar sealed class em vez de enum

✔ Diferença entre rotas simples e rotas com argumentos
✔ Como os ícones da BottomNavigation são associados
✔ Quais os ecrãs principais vs ecrãs de detalhe
 */



