package com.example.myamover.navigation


/**
 * NavRoutes
 *
 * Objeto central que define TODAS as rotas de navegação da aplicação.
 *
 * Vantagens de centralizar as rotas aqui:
 * - evita strings "hardcoded" espalhadas pela app
 * - reduz erros de escrita (typos)
 * - facilita manutenção e refatoração
 *
 * Estas rotas são usadas em:
 * - AppNavGraph
 * - NavigationItem
 * - chamadas navController.navigate(...)
 */
object NavRoutes {

    // Rota do ecrã de Login - É o startDestination da aplicação
    const val Login = "login"

    const val ChangePassword = "change_password/{email}"
    fun changePassword(email: String) = "change_password/$email"

    /*Rota base do ecrã Home (sem argumentos) - Normalmente não é usada diretamente,
     pois o Home recebe o email como argumento*/
    const val Home = "home"

    /**
     * Função helper para construir a rota Home
     * já com o argumento "email".
     *
     * Exemplo:
     * home("user@email.com") → "home/user@email.com"
     */
    fun home(email: String) = "home/$email"

    /**
     * Rota do Home COM argumento.
     *
     * Usada no NavGraph para declarar a rota
     * e os respetivos navArgument.
     */
    const val HomeWithArgs = "home/{email}"

    //Rota do ecrã de Tasks (tarefa do dia).
    const val Tasks = "tasks"

    //Rota do ecrã do Mapa
    const val Map = "map"

    //Rota do ecrã de Histórico
    const val History = "history"

    // Rota do ecrã de Perfil
    const val Profile = "profile"

    // Rota do ecrã de Assistência / Chat
    const val Assistance = "assistance"

    // Rota base do detalhe de uma tarefa ativa (sem argumentos - Normalmente usada apenas como base
    const val TaskDetail = "TaskDetail"

    /**
     * Rota do detalhe de tarefa COM argumento taskId.
     *
     * Usada no NavGraph para definir a navegação
     * e declarar o navArgument("taskId").
     */
    const val TaskDetailWithArgs = "TaskDetail/{taskId}"

    /**
     * Função helper para navegar para o detalhe
     * de uma tarefa específica.
     *
     * Exemplo:
     * TaskDetail(12) → "TaskDetail/12"
     */
    fun TaskDetail(taskId: Int) = "TaskDetail/$taskId"

    // Rota base do detalhe de tarefa do histórico
    const val HistoryTaskDetail = "HistoryTaskDetail"

    //Rota do detalhe de tarefa do histórico COM argumento
    const val HistoryTaskDetailWithArgs = "HistoryTaskDetail/{taskId}"

    // Função helpar para navegar para o detalhe de uma tarefa do histórico
    fun HistoryTaskDetail(taskId: Int) = "HistoryTaskDetail/$taskId"

    const val MapToStopWithArgs = "map_to_stop/{lat}/{lng}"
    fun MapToStop(lat: Double, lng: Double) = "map_to_stop/$lat/$lng"

}

/*
Diferença entre rota base e rota com argumentos

✔ Porque existem funções helper (home(), TaskDetail())
✔ Como estas rotas são usadas no NavGraph
✔ Como evitar erros ao navegar (navigate(...)
 */