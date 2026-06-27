package com.example.myamover

import android.Manifest
import android.content.Context
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.annotation.StringRes
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.TopAppBarScrollBehavior
import androidx.compose.material3.windowsizeclass.ExperimentalMaterial3WindowSizeClassApi
import androidx.compose.material3.windowsizeclass.calculateWindowSizeClass
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavDestination
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavHostController
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.myamover.data.firebase.RequestNotificationPermissionDialog
import com.example.myamover.navigation.AppNavGraph
import com.example.myamover.navigation.NavRoutes
import com.example.myamover.navigation.NavigationItem
import com.example.myamover.route.utils.ensureMessageChannel
import com.example.myamover.ui.theme.MyAmoverTheme
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import com.google.firebase.Firebase
import com.google.firebase.messaging.messaging


import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    @OptIn(ExperimentalMaterial3WindowSizeClassApi::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        ensureMessageChannel(this)
        com.example.myamover.data.network.TokenManager.init(this)
        setContent {
            MyAmoverTheme {
                AppNavGraph(windowSize = calculateWindowSizeClass(this).widthSizeClass)
                //MainScreen()

            }
        }
        retrieveToken()
    }

    private fun retrieveToken() {
        Firebase.messaging.token.addOnCompleteListener {
            if (it.isSuccessful) {
                Log.d("FCM", "Token=${it.result}")
            } else {
                Log.w("FCM", "Failed to get token", it.exception)
            }
        }
    }
    private fun saveLanguage(context: Context, language: String) {
        val sharedPreferences = context.getSharedPreferences("MyPrefs", Context.MODE_PRIVATE)
    }

}


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TopBar(
    navController: NavHostController,
    @StringRes titleRes: Int,
    @StringRes subtitleRes: Int? = null,
    modifier: Modifier = Modifier,
    navigationIcon: @Composable () -> Unit = {},
    actions: @Composable RowScope.() -> Unit = {},
    windowInsets: WindowInsets = TopAppBarDefaults.windowInsets,
    scrollBehavior: TopAppBarScrollBehavior? = null,
) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentBase = navBackStackEntry?.destination?.route
        ?.substringBefore("?")?.substringBefore("/{")
    val isHome = currentBase == NavRoutes.Home
    val canPop = navController.previousBackStackEntry != null
    val title = stringResource(id = titleRes)
    val subtitle = subtitleRes?.let { stringResource(id = it) }
    TopAppBar(
        modifier = modifier
            .padding(0.dp),
            //.verticalScroll(rememberScrollState()),
        actions = actions,
        scrollBehavior = scrollBehavior,
        windowInsets = windowInsets,
        title = {
            Row(
                modifier = Modifier,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    fontSize = 18.sp,
                    style = MaterialTheme.typography.titleMedium,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                if (subtitle != null) {
                    Text(
                        text = " - $subtitle",
                        fontSize = 12.sp,
                        style = MaterialTheme.typography.titleSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        },
        navigationIcon = {
            when {
                isHome -> {
                    // Sem botão de voltar na homepage
                }
                canPop -> { // seta de voltar nas outras telas
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                }
                else -> { /* sem ícone */
                }
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MaterialTheme.colorScheme.primary,
            titleContentColor = MaterialTheme.colorScheme.onPrimary,
            navigationIconContentColor = MaterialTheme.colorScheme.onPrimary
        )
    )
}

private fun NavDestination?.baseRoute(): String? =
    this?.hierarchy?.firstNotNullOfOrNull { d ->
        d.route?.substringBefore("?")?.substringBefore("/{")
    }



@Composable
fun BottomNavigationBar(
    navController: NavHostController,
    items: List<NavigationItem>
) {
    NavigationBar(
        containerColor = MaterialTheme.colorScheme.primary,
        contentColor = MaterialTheme.colorScheme.onPrimary
    ) {
        val navBackStackEntry by navController.currentBackStackEntryAsState()
        val currentRoute = navBackStackEntry?.destination?.route
        items.forEach { item ->
            val label = stringResource(item.titleRes)
            //val selected = currentDest?.hierarchy?.any { it.route == item.route } == true
            NavigationBarItem(
                icon = {
                    Icon(
                        imageVector = item.icon,
                        contentDescription = label
                    )
                },
                label = { Text(text = label) },
                alwaysShowLabel = true,
                selected = currentRoute == item.route,
                onClick = {
                    navController.navigate(item.route) {
                        navController.graph.startDestinationRoute?.let { route ->
                            popUpTo(route) {
                                saveState = true
                            }
                        }
                        launchSingleTop = true
                        restoreState = true
                    }
                }
            )
        }
    }
}


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen() {
    val navController = rememberNavController()

    Scaffold(
        topBar = {
            TopBar(
                navController = rememberNavController(),
                titleRes = R.string.app_name
            )
        },
        bottomBar = {
            BottomNavigationBar(
                navController = navController,
                items = listOf(
                    NavigationItem.Home,
                    NavigationItem.Tasks,
                    NavigationItem.Map,
                    NavigationItem.Perfil,
                    NavigationItem.TasKDetail
                )
            )
        },
        content = { padding -> // We have to pass the scaffold inner padding to our content. That's why we use Box.
            Box(modifier = Modifier.padding(padding)) {
                /* Add code later */
            }
        },
        modifier = Modifier.background(MaterialTheme.colorScheme.background), // Set background color to avoid the white flashing when you switch between screens
    )
}

@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    val openDialog = remember { mutableStateOf(false) }

    val notificationPermissionState =
        rememberPermissionState(permission = Manifest.permission.POST_NOTIFICATIONS)


    if (openDialog.value) {
        RequestNotificationPermissionDialog(
            openDialog = openDialog,
            permissionState = notificationPermissionState
        )
    }
    LaunchedEffect(key1 = Unit) {
        if (!notificationPermissionState.status.isGranted || Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            Firebase.messaging.subscribeToTopic("all")
        } else {
            openDialog.value = true
        }
    }

    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Firebase Cloud Messaging")
    }


}



