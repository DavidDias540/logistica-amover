package com.example.myamover.screens

import com.example.myamover.navigation.NavRoutes
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
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material3.AssistChip
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MaterialTheme.colorScheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBarScrollBehavior
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import com.example.myamover.R
import com.example.myamover.data.remote.RouteGroupRemote
import com.example.myamover.model.TaskRemoteViewModel
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class)
@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun HistoryScreen(
    navController: NavHostController,
    modifier: Modifier = Modifier,
    onBack: (() -> Unit)? = null,
    onOpenMapRoute: (() -> Unit)? = null,
    vm: TaskRemoteViewModel = viewModel(),
    navigationIcon: @Composable () -> Unit = {},
    scrollBehavior: TopAppBarScrollBehavior? = null,
) {
    val uiState by vm.ui.collectAsState()

    var showDateDialog by remember { mutableStateOf(false) }
    var selectedDate by rememberSaveable { mutableStateOf<LocalDate?>(LocalDate.now()) }
    var expandedRouteId by rememberSaveable { mutableStateOf<String?>(null) }

    LaunchedEffect(selectedDate) {
        val dateString = selectedDate?.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))
        if (dateString != null) {
            vm.loadHistoryRoutes(dateString)
        }
    }

    Scaffold(
        contentWindowInsets = WindowInsets.safeDrawing,
    ) { padding ->

        when {
            uiState.loading -> {
                Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            }
            uiState.error != null -> {
                Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                    Text(stringResource(id = R.string.error_prefix) + ": ${uiState.error}", color = MaterialTheme.colorScheme.error)
                }
            }
            else -> {
                Column(
                    modifier = modifier
                        .fillMaxSize()
                        .padding(padding)
                        .background(colorScheme.background)
                ) {
                    // Header with Date Picker logic
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        val dateLabel = selectedDate?.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) ?: stringResource(id = R.string.select_a_date)
                        AssistChip(
                            onClick = { showDateDialog = true },
                            label = { Text("${stringResource(id = R.string.date_label)} $dateLabel") },
                            leadingIcon = { Icon(Icons.Default.CalendarMonth, contentDescription = null) }
                        )
                    }

                    if (uiState.historyRoutes.isEmpty()) {
                        Box(Modifier.fillMaxSize().weight(1f), contentAlignment = Alignment.Center) {
                            Text(stringResource(id = R.string.no_route_day), color = colorScheme.onBackground)
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier.weight(1f).fillMaxWidth(),
                            contentPadding = PaddingValues(12.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            items(uiState.historyRoutes, key = { it.id }) { routeGroup ->
                                val isExpanded = expandedRouteId == routeGroup.id

                                ElevatedCard(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .animateContentSize()
                                        .clickable { expandedRouteId = if (isExpanded) null else routeGroup.id },
                                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
                                    colors = CardDefaults.cardColors(
                                        containerColor = if (isExpanded) colorScheme.surfaceContainerHighest else colorScheme.surfaceContainer
                                    ),
                                    shape = RoundedCornerShape(12.dp),
                                ) {
                                    Column(Modifier.padding(16.dp)) {
                                        val isCompleted = routeGroup.routePoints.all { 
                                            val status = it.task.status ?: ""
                                            status.equals("completed", ignoreCase = true) || status.equals("concluída", ignoreCase = true)
                                        }
                                        val routeTitle = if (isCompleted) stringResource(id = R.string.route_completed) else stringResource(id = R.string.route_pending)
                                        Text(
                                            "$routeTitle - ${routeGroup.routePoints.size} ${stringResource(id = R.string.stops)}",
                                            color = colorScheme.onSurface,
                                            fontWeight = FontWeight.Bold,
                                            style = MaterialTheme.typography.titleMedium
                                        )

                                        Spacer(modifier = Modifier.height(8.dp))

                                        AnimatedVisibility(visible = isExpanded) {
                                            Column(
                                                modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                                                verticalArrangement = Arrangement.spacedBy(8.dp)
                                            ) {
                                                routeGroup.routePoints.sortedBy { it.stopOrder }.forEach { point ->
                                                    val task = point.task
                                                    val node = task.nodes?.firstOrNull()

                                                    ElevatedCard(
                                                        modifier = Modifier.fillMaxWidth().clickable {
                                                            navController.navigate(NavRoutes.HistoryTaskDetail(task.id))
                                                        },
                                                        colors = CardDefaults.cardColors(containerColor = colorScheme.surface)
                                                    ) {
                                                        Column(Modifier.padding(8.dp)) {
                                                            Text(
                                                                "${point.stopOrder}º - ${task.type}",
                                                                fontWeight = FontWeight.SemiBold,
                                                                style = MaterialTheme.typography.bodyMedium,
                                                                color = colorScheme.onSurface
                                                            )
                                                            Text(
                                                                node?.address ?: stringResource(id = R.string.no_address),
                                                                style = MaterialTheme.typography.bodySmall,
                                                                color = colorScheme.onSurfaceVariant
                                                            )
                                                            Text(
                                                                "Status: ${task.status}",
                                                                style = MaterialTheme.typography.labelSmall,
                                                                color = colorScheme.primary,
                                                                modifier = Modifier.padding(top = 4.dp)
                                                            )
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
    }

    if (showDateDialog) {
        val datePickerState = rememberDatePickerState(
            initialSelectedDateMillis = selectedDate?.atStartOfDay(ZoneId.systemDefault())?.toInstant()?.toEpochMilli()
        )
        DatePickerDialog(
            onDismissRequest = { showDateDialog = false },
            confirmButton = {
                TextButton(onClick = {
                    datePickerState.selectedDateMillis?.let {
                        selectedDate = Instant.ofEpochMilli(it).atZone(ZoneId.systemDefault()).toLocalDate()
                    }
                    showDateDialog = false
                }) { Text("OK") }
            },
            dismissButton = {
                TextButton(onClick = { showDateDialog = false }) { Text("Cancel") }
            }
        ) {
            DatePicker(state = datePickerState)
        }
    }
}
