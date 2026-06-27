package com.example.myamover.screens

import android.content.Context
import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Navigation
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MaterialTheme.colorScheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.example.myamover.R
import com.example.myamover.data.remote.RoutePointRemote
import com.example.myamover.model.TaskRemoteViewModel
import kotlinx.coroutines.launch

@RequiresApi(Build.VERSION_CODES.O)
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TasksScreen(
    windowSize: WindowWidthSizeClass,
    modifier: Modifier = Modifier,
    vm: TaskRemoteViewModel,
    onOpenMapRoute: () -> Unit,
    onTaskDetails: (Int) -> Unit,
    onBackClick: () -> Unit,
    onToggleExpand: () -> Unit,
    expanded: Boolean = false,
    onOpenMapToStop: (Double, Double) -> Unit,
) {
    val uiState by vm.ui.collectAsState()
    val context = LocalContext.current
    val prefs = context.getSharedPreferences("routes_prefs", android.content.Context.MODE_PRIVATE)
    var expandedRouteId by rememberSaveable { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        val finishedIds = prefs.getStringSet("finished_routes", emptySet()) ?: emptySet()
        finishedIds.forEach { vm.acknowledgeRouteFinished(it) }
        vm.loadTasks()
    }

    LaunchedEffect(uiState.autoStartRouteTrigger) {
        uiState.autoStartRouteTrigger?.let { routeId ->
            vm.consumeAutoStartRoute()
            
            val routeGroup = uiState.activeRoutes.find { it.id == routeId }
            if (routeGroup != null) {
                val pendingPointsFiltered = routeGroup.routePoints.filter { 
                    val status = it.task.status ?: ""
                    !status.equals("completed", ignoreCase = true) && !status.equals("concluída", ignoreCase = true)
                }
                val pendingTaskIds = pendingPointsFiltered.map { it.task.id }
                
                if (pendingTaskIds.isNotEmpty()) {
                    val loc = try {
                        com.example.myamover.location.getLastKnownLatLng(context.applicationContext as android.app.Application)
                    } catch (e: Exception) { null }
                    
                    if (loc != null) {
                        vm.reoptimizeRoute(pendingTaskIds, loc.latitude.toFloat(), loc.longitude.toFloat(), routeId) { newGroup ->
                            val pointsToNavigate = newGroup?.routePoints?.takeIf { it.isNotEmpty() } ?: pendingPointsFiltered
                            if (newGroup != null) {
                                expandedRouteId = newGroup.id
                            }
                            openGoogleMapsRoute(context, pointsToNavigate)
                        }
                    } else {
                        // Se não tiver GPS local, usa a rota restante sem reotimização nova
                        expandedRouteId = routeId
                        openGoogleMapsRoute(context, pendingPointsFiltered)
                    }
                }
            }
        }
    }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        contentColor = MaterialTheme.colorScheme.background,
    ) { padding ->

        when {
            uiState.loading -> {
                Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                }
            }
            uiState.error != null -> {
                Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(text = "Error: ${uiState.error}", color = MaterialTheme.colorScheme.error)
                }
            }
            uiState.activeRoutes.isEmpty() -> {
                Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(stringResource(id = R.string.no_tasks), color = MaterialTheme.colorScheme.onBackground)
                }
            }
            else -> {
                val activeRoutes = uiState.activeRoutes
                
                val ongoingRoutes = activeRoutes.filter { routeGroup ->
                    val allFinished = routeGroup.routePoints.isNotEmpty() && routeGroup.routePoints.all { 
                        val status = it.task.status ?: ""
                        status.equals("finished", ignoreCase = true)
                    }
                    !allFinished
                }

                val finishedRoutes = activeRoutes.filter { routeGroup ->
                    val allFinished = routeGroup.routePoints.isNotEmpty() && routeGroup.routePoints.all { 
                        val status = it.task.status ?: ""
                        status.equals("finished", ignoreCase = true)
                    }
                    allFinished
                }

                var selectedTabIndex by rememberSaveable { mutableStateOf(0) }
                val tabs = listOf("Para Fazer", "Concluídas (Hoje)")

                Column(
                    modifier = modifier
                        .fillMaxSize()
                        .padding(padding)
                        .background(colorScheme.background)
                ) {
                    androidx.compose.material3.TabRow(
                        selectedTabIndex = selectedTabIndex,
                        containerColor = colorScheme.surface,
                        contentColor = colorScheme.primary
                    ) {
                        tabs.forEachIndexed { index, title ->
                            androidx.compose.material3.Tab(
                                selected = selectedTabIndex == index,
                                onClick = { selectedTabIndex = index },
                                text = { Text(title, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold) }
                            )
                        }
                    }

                    LazyColumn(
                        modifier = Modifier.weight(1f).fillMaxWidth(),
                        contentPadding = PaddingValues(12.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        val routesToShow = if (selectedTabIndex == 0) ongoingRoutes else finishedRoutes
                        
                        if (routesToShow.isEmpty()) {
                            item {
                                Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                                    Text("Não existem rotas nesta secção.", color = colorScheme.onSurfaceVariant)
                                }
                            }
                        }

                        itemsIndexed(routesToShow, key = { _, item -> item.id }) { index, routeGroup ->
                            val isExpanded = expandedRouteId == routeGroup.id
                            val routeNumber = index + 1

                            ElevatedCard(
                                modifier = Modifier
                                    .fillMaxWidth(0.95f)
                                    .animateContentSize()
                                    .clickable {
                                        expandedRouteId = if (isExpanded) null else routeGroup.id
                                    },
                                elevation = CardDefaults.cardElevation(defaultElevation = if (selectedTabIndex == 0) 6.dp else 2.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = if (selectedTabIndex == 1) {
                                        if (isExpanded) colorScheme.surfaceContainerHighest else colorScheme.surfaceContainer.copy(alpha = 0.6f)
                                    } else {
                                        if (isExpanded) colorScheme.surfaceContainerHighest else colorScheme.surfaceContainer
                                    }
                                ),
                                shape = RoundedCornerShape(12.dp),
                            ) {
                                Column(Modifier.padding(12.dp)) {
                                    Text(
                                        if (selectedTabIndex == 1) "Rota $routeNumber (Finalizada) - ${routeGroup.routePoints.size} Paragens" else "Rota $routeNumber (Otimizada) - ${routeGroup.routePoints.size} Paragens",
                                        color = if (selectedTabIndex == 1) colorScheme.primary else colorScheme.onSurface,
                                        fontWeight = androidx.compose.ui.text.font.FontWeight.Bold,
                                        style = MaterialTheme.typography.titleMedium
                                    )

                                    Spacer(modifier = Modifier.width(8.dp))

                                     AnimatedVisibility(visible = isExpanded) {
                                        Column(
                                            modifier = Modifier.fillMaxWidth().padding(top = 12.dp),
                                            horizontalAlignment = Alignment.Start,
                                            verticalArrangement = Arrangement.spacedBy(12.dp)
                                        ) {
                                             // Botão Global da Rota (Navegar ou Reotimizar)
                                            if (selectedTabIndex == 0) {
                                                Row(
                                                    modifier = Modifier.fillMaxWidth(),
                                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                                ) {
                                                    val scope = androidx.compose.runtime.rememberCoroutineScope()
                                                    Button(
                                                        onClick = { 
                                                                scope.launch {
                                                                    try {
                                                                        val loc = com.example.myamover.location.getLastKnownLatLng(context.applicationContext as android.app.Application)
                                                                        if (loc != null) {
                                                                            val pendingPoints = routeGroup.routePoints.filter { 
                                                                                val status = it.task.status ?: ""
                                                                                !status.equals("completed", ignoreCase = true) && !status.equals("concluída", ignoreCase = true)
                                                                            }
                                                                            if (pendingPoints.isEmpty()) return@launch

                                                                            val taskIds = pendingPoints.map { it.task.id }
                                                                            vm.reoptimizeRoute(taskIds, loc.latitude.toFloat(), loc.longitude.toFloat(), routeGroup.id) { newGroup ->
                                                                                val pointsToNavigate = newGroup?.routePoints?.takeIf { it.isNotEmpty() } ?: pendingPoints
                                                                                if (newGroup != null) {
                                                                                    expandedRouteId = newGroup.id
                                                                                }
                                                                                openGoogleMapsRoute(context, pointsToNavigate)
                                                                            }
                                                                        } else {
                                                                            val pendingPoints = routeGroup.routePoints.filter { 
                                                                                val status = it.task.status ?: ""
                                                                                !status.equals("completed", ignoreCase = true) && !status.equals("concluída", ignoreCase = true)
                                                                            }
                                                                            openGoogleMapsRoute(context, pendingPoints)
                                                                        }
                                                                    } catch (e: Exception) {
                                                                        e.printStackTrace()
                                                                        val pendingPoints = routeGroup.routePoints.filter { 
                                                                            val status = it.task.status ?: ""
                                                                            !status.equals("completed", ignoreCase = true) && !status.equals("concluída", ignoreCase = true)
                                                                        }
                                                                        openGoogleMapsRoute(context, pendingPoints)
                                                                    }
                                                                }
                                                            },
                                                            modifier = Modifier.fillMaxWidth()
                                                        ) {
                                                            Icon(imageVector = Icons.Default.Navigation, contentDescription = null, tint = androidx.compose.ui.graphics.Color.White)
                                                            Spacer(modifier = Modifier.width(8.dp))
                                                            Text("Iniciar Rota (Otimização Automática)", color = androidx.compose.ui.graphics.Color.White)
                                                        }
                                                }
                                            }

                                            // Lista de Tarefas / Paragens
                                            routeGroup.routePoints.sortedBy { it.stopOrder }.forEach { point ->
                                                val task = point.task
                                                val node = task.nodes?.firstOrNull()
                                                
                                                ElevatedCard(
                                                    modifier = Modifier.fillMaxWidth(),
                                                    colors = CardDefaults.cardColors(containerColor = colorScheme.surface)
                                                ) {
                                                    Column(Modifier.padding(8.dp)) {
                                                        Text(
                                                            "${point.stopOrder}º - ${task.type}",
                                                            fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold,
                                                            style = MaterialTheme.typography.bodyLarge,
                                                            color = colorScheme.onSurface
                                                        )
                                                        Text(
                                                            node?.address ?: stringResource(id = R.string.no_address),
                                                            style = MaterialTheme.typography.bodyMedium,
                                                            color = colorScheme.onSurfaceVariant
                                                        )
                                                        Text(
                                                            if (selectedTabIndex == 1) "Estado: Concluída" else "Estado: ${task.status ?: "Pendente"}",
                                                            style = MaterialTheme.typography.bodyMedium,
                                                            color = if (selectedTabIndex == 1 || task.status.equals("completed", ignoreCase = true) || task.status.equals("concluída", ignoreCase = true)) colorScheme.primary else colorScheme.onSurfaceVariant,
                                                            fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
                                                        )

                                                        Row(
                                                            horizontalArrangement = Arrangement.End,
                                                            verticalAlignment = Alignment.CenterVertically,
                                                            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
                                                        ) {
                                                            if (selectedTabIndex == 0) {
                                                                Button(
                                                                    onClick = { onTaskDetails(task.id) },
                                                                    modifier = Modifier.padding(end = 4.dp),
                                                                    colors = ButtonDefaults.buttonColors(
                                                                        containerColor = colorScheme.onSecondary,
                                                                        contentColor = colorScheme.secondary
                                                                    )
                                                                ) {
                                                                    Text(if (task.status.equals("completed", ignoreCase = true) || task.status.equals("concluída", ignoreCase = true)) "Ver Detalhes" else "Validar")
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            
                                            // Botão Vermelho Terminar Rota
                                            val allTasksCompleted = routeGroup.routePoints.isNotEmpty() && routeGroup.routePoints.all {
                                                val status = it.task.status ?: ""
                                                status.equals("completed", ignoreCase = true) || status.equals("concluída", ignoreCase = true)
                                            }
                                            
                                            if (allTasksCompleted && selectedTabIndex == 0) {
                                                Spacer(modifier = Modifier.height(16.dp))
                                                Button(
                                                    onClick = {
                                                        vm.finishRouteGroup(
                                                            routeGroupId = routeGroup.id,
                                                            onSuccess = {
                                                                // Sucesso mostrado pelo backend
                                                            },
                                                            onError = { msg ->
                                                                android.widget.Toast.makeText(context, msg, android.widget.Toast.LENGTH_LONG).show()
                                                            }
                                                        )
                                                    },
                                                    modifier = Modifier.fillMaxWidth().height(56.dp).padding(horizontal = 16.dp),
                                                    colors = ButtonDefaults.buttonColors(
                                                        containerColor = colorScheme.error,
                                                        contentColor = colorScheme.onError
                                                    ),
                                                    shape = RoundedCornerShape(12.dp)
                                                ) {
                                                    Text("TERMINAR ROTA", fontWeight = androidx.compose.ui.text.font.FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    }
                }
            }
        }
    }
}

fun openGoogleMapsRoute(context: Context, routePoints: List<RoutePointRemote>) {
    if (routePoints.isEmpty()) return

    val sortedPoints = routePoints.sortedBy { it.stopOrder }
    val destination = sortedPoints.last()
    val destLat = destination.task.nodes?.firstOrNull()?.latitude
    val destLng = destination.task.nodes?.firstOrNull()?.longintude

    if (destLat == null || destLng == null) {
        android.widget.Toast.makeText(context, "A rota contém tarefas sem endereço ou coordenadas associadas.", android.widget.Toast.LENGTH_LONG).show()
        return
    }

    val waypoints = sortedPoints.dropLast(1).mapNotNull { point ->
        val lat = point.task.nodes?.firstOrNull()?.latitude
        val lng = point.task.nodes?.firstOrNull()?.longintude
        if (lat != null && lng != null) "$lat,$lng" else null
    }.joinToString("|")

    var url = "https://www.google.com/maps/dir/?api=1&destination=$destLat,$destLng"
    if (waypoints.isNotEmpty()) {
        url += "&waypoints=$waypoints"
    }

    val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(url))
    intent.setPackage("com.google.android.apps.maps")
    try {
        context.startActivity(intent)
    } catch (e: Exception) {
        val fallbackIntent = android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(url))
        context.startActivity(fallbackIntent)
    }
}
