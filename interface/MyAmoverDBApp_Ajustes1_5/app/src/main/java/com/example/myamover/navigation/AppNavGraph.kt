package com.example.myamover.navigation


import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.ui.unit.sp
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.myamover.BottomNavigationBar
import com.example.myamover.R
import com.example.myamover.TopBar
import com.example.myamover.data.model.HistoryTaskDetailRoute
import com.example.myamover.data.model.TaskDetailRoute
import com.example.myamover.model.TaskRemoteViewModel
import com.example.myamover.screens.HistoryScreen
import com.example.myamover.screens.HomeScreen
import com.example.myamover.screens.LoginScreen
import com.example.myamover.screens.TasksScreen
import com.example.myamover.screens.maps.MapMode
import com.example.myamover.screens.maps.MapScreen


/**
 * AppNavGraph
 *
 * Função principal de navegação da aplicação.
 *
 * Responsável por:
 * - definir todas as rotas (screens)
 * - configurar a navegação entre ecrãs
 * - controlar quando aparecem TopBar e BottomBar
 * - partilhar ViewModels entre ecrãs
 */

/**
 * AppNavGraph
 *
 * Função principal de navegação da aplicação.
 *
 * Responsável por:
 * - definir todas as rotas (screens)
 * - configurar a navegação entre ecrãs
 * - controlar quando aparecem TopBar e BottomBar
 * - partilhar ViewModels entre ecrãs
 */
@OptIn(ExperimentalMaterial3Api::class)
@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun AppNavGraph(
    windowSize: WindowWidthSizeClass,
    modifier: Modifier = Modifier
) {

    // NavController controla a navegação entre ecrãs
    val navController = rememberNavController()

    /**
     * ViewModel das tarefas.
     *
     * Criado uma única vez aqui e partilhado entre:
     * - TasksScreen
     * - TaskDetailRoute
     *
     * Isto garante que:
     * - a lista de tasks
     * - a rota diária
     * permanecem consistentes entre ecrãs.
     */
    val tasksVm: TaskRemoteViewModel = viewModel()

    /**
     * Lista de rotas que DEVEM mostrar TopBar e BottomBar.
     *
     * Todas as outras rotas (ex.: Login)
     * não mostram barras.
     */
    // rotas que exibem barras
    val routesWithBars = remember {
        setOf(
            NavRoutes.HomeWithArgs,
            NavRoutes.Tasks,
            NavRoutes.History,
            NavRoutes.Map,
            NavRoutes.Assistance,
            NavRoutes.TaskDetailWithArgs,
            NavRoutes.HistoryTaskDetailWithArgs

        )
    }

    //Rota atual no back stack
    val currentRoute =
        navController.currentBackStackEntryAsState().value
            ?.destination
            ?.route

    //Determina se as barras devem ser mostradas
    val showBars = currentRoute in routesWithBars

    val titleRes = when (currentRoute?.substringBefore("?")?.substringBefore("/{")) {
        NavRoutes.Home -> R.string.home
        NavRoutes.Tasks -> R.string.tasks
        NavRoutes.History -> R.string.history
        NavRoutes.Map -> R.string.map
        NavRoutes.Assistance -> R.string.assistance
        "TaskDetail" -> R.string.task_detail
        "HistoryTaskDetail" -> R.string.task_detail
        else -> R.string.app_name
    }


    /**
     * Scaffold define a estrutura base do ecrã:
     * - TopBar
     * - BottomBar
     * - Conteúdo principal (NavHost)
     */
    Scaffold(
        topBar = {
            // Mostra TopBar apenas nas rotas permitidas
                if (showBars) TopBar(
                    navController = navController,
                    titleRes = titleRes,
                    actions = {
                        val currentLocales = androidx.appcompat.app.AppCompatDelegate.getApplicationLocales()
                        val currentTag = currentLocales.get(0)?.language
                            ?: java.util.Locale.getDefault().language

                        if (currentRoute?.startsWith("home") == true) {
                            IconButton(onClick = {
                                val newLocale = if (currentTag.startsWith("pt")) "en" else "pt"
                                androidx.appcompat.app.AppCompatDelegate.setApplicationLocales(
                                    androidx.core.os.LocaleListCompat.forLanguageTags(newLocale)
                                )
                            }) {
                                Text(
                                    text = if (currentTag.startsWith("pt")) "🇵🇹" else "🇬🇧",
                                    fontSize = 24.sp
                                )
                            }
                        }
                    }
                )
        },
        bottomBar = {
            // Mostra BottomNavigation apenas nas rotas permitidas
            if (showBars) {
                BottomNavigationBar(
                    navController = navController,
                    items = listOf(
                        NavigationItem.Home,
                        NavigationItem.Tasks,
                        NavigationItem.History,
                        NavigationItem.Map,
                        NavigationItem.Assistance,
                        // NavigationItem.Perfil
                    )
                )
            }
        },
        modifier = Modifier.background(MaterialTheme.colorScheme.background)
    ) { inner ->

        /**
         * NavHost contém todas as rotas da aplicação.
         *
         * startDestination = Login
         * → a app começa sempre no ecrã de login.
         */
        NavHost(
            navController = navController,
            startDestination = NavRoutes.Login,
            modifier = modifier.padding(inner)
        ) {

            /// ───────────────────── LOGIN ─────────────────────
            // Ecrã de login (sem TopBar nem BottomBar)
            composable(NavRoutes.Login) {
                LoginScreen(
                    windowSize = windowSize,
                    navController = navController
                )
            }

            composable(
                route = NavRoutes.ChangePassword,
                arguments = listOf(navArgument("email") { type = NavType.StringType })
            ) { backStackEntry ->
                val email = backStackEntry.arguments?.getString("email") ?: ""
                com.example.myamover.screens.ChangePasswordScreen(
                    email = email,
                    navController = navController
                )
            }

            // ───────────────────── HOME ─────────────────────
            // Ecrã principal após login (recebe email como argumento)
            composable(
                route = NavRoutes.HomeWithArgs,
                arguments = listOf(
                    navArgument("email") { type = NavType.StringType }
                )
            ) { backStackEntry ->
                val email = backStackEntry.arguments?.getString("email").orEmpty()
                HomeScreen(
                    name = "Amover",
                    email = email,
                    windowSize = windowSize,
                    navController = navController,
                    modifier = modifier,
                    onOpenTasksClick = { navController.navigate(NavRoutes.Tasks) },
                    onOpenHistoryClick = { navController.navigate(NavRoutes.History) },
                    onBackClick = { navController.popBackStack() },

                )
            }

            // ───────────────────── TASKS ─────────────────────
            // Lista de tarefas do dia
            composable(NavRoutes.Tasks) {
                TasksScreen(
                    windowSize = windowSize,
                    modifier = modifier,
                    vm = tasksVm,
                    onOpenMapRoute = { navController.navigate(NavRoutes.Map) },
                    onTaskDetails = { taskId ->
                        navController.navigate(NavRoutes.TaskDetail(taskId))
                    },
                    onOpenMapToStop = { lat, lng ->
                        navController.navigate(NavRoutes.MapToStop(lat, lng))
                    },
                    onBackClick = { navController.popBackStack() },
                    onToggleExpand = { /*TODO*/ },
                    expanded = false,

                )
            }

            // ───────────────────── HISTORY ─────────────────────
            // Histórico de tarefas
            composable(NavRoutes.History) {
                HistoryScreen(
                    modifier = modifier,
                    onBack = { navController.popBackStack() },
                    onOpenMapRoute = { navController.popBackStack() },
                    navController = navController,
                    navigationIcon = {},
                )
            }

            // ───────────────────── MAP ─────────────────────
            // Ecrã do mapa com a rota diária
            composable(NavRoutes.Map) {
                MapScreen(
                    windowSize = windowSize,
                    modifier = modifier,
                    mode = MapMode.FullRoute
                )
            }

            composable(
                route = NavRoutes.MapToStopWithArgs,
                arguments = listOf(
                    navArgument("lat") { type = NavType.StringType },
                    navArgument("lng") { type = NavType.StringType }
                )
            ) { back ->
                val lat = back.arguments?.getString("lat")?.toDoubleOrNull() ?: return@composable
                val lng = back.arguments?.getString("lng")?.toDoubleOrNull() ?: return@composable

                MapScreen(
                    windowSize = windowSize,
                    modifier = modifier,
                    mode = MapMode.ToSingleStop(lat, lng)
                )
            }





            // ───────────────── TASK DETAIL ─────────────────
            // Detalhe de uma tarefa ativa
            composable(
                route = NavRoutes.TaskDetailWithArgs,
                arguments = listOf(navArgument("taskId") { type = NavType.IntType })
            ) { backStackEntry ->
                val taskId = backStackEntry.arguments?.getInt("taskId") ?: return@composable

                TaskDetailRoute(
                    taskId = taskId,
                    windowSize = windowSize,
                    onBack = { navController.popBackStack() },
                    vm = tasksVm  //mesmo vm das tasks
                )
            }

            // ───────────── HISTORY TASK DETAIL ─────────────
            // Detalhe de tarefa histórica
            composable(
                route = NavRoutes.HistoryTaskDetailWithArgs,
                arguments = listOf(navArgument("taskId") { type = NavType.IntType })
            ) { backStackEntry ->
                val taskId = backStackEntry.arguments?.getInt("taskId") ?: return@composable
                HistoryTaskDetailRoute(
                    taskId = taskId,
                    onBack = { navController.popBackStack() }
                )
            }

            composable(NavRoutes.Profile) {
                com.example.myamover.screens.ProfileScreen(
                    navController = navController,
                    modifier = modifier
                )
            }

            // ───────────────── ASSISTANCE / CHAT ─────────────────
            composable(NavRoutes.Assistance) {
                com.example.myamover.screens.AssistanceScreen(
                    navController = navController,
                    modifier = modifier
                )
            }
        }
    }
}
/*
Onde começa a app (startDestination)

✔ Quando aparecem TopBar e BottomBar
✔ Como os ViewModels são partilhados
✔ Como funcionam as rotas com argumentos
✔ Organização clara da navegação por secções
 */



