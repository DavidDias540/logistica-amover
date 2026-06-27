package com.example.myamover.screens

import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarScrollBehavior
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import com.example.myamover.data.model.AssistanceViewModel
import com.example.myamover.data.network.TokenManager
import com.example.myamover.data.remote.AssistanceMessageRemote
import com.example.myamover.data.remote.AssistanceRequestRemote
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class)
@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun AssistanceScreen(
    navController: NavHostController,
    modifier: Modifier = Modifier,
    vm: AssistanceViewModel = viewModel(),
    scrollBehavior: TopAppBarScrollBehavior? = null,
) {
    LaunchedEffect(Unit) { vm.loadRequests() }

    val context = LocalContext.current
    val errorMsg = vm.error.value
    LaunchedEffect(errorMsg) {
        if (errorMsg != null) {
            android.widget.Toast.makeText(context, "Erro: $errorMsg", android.widget.Toast.LENGTH_LONG).show()
            vm.error.value = null
        }
    }

    val requestsList = vm.requests
    var selectedRequestId by remember { mutableStateOf<Int?>(null) }
    val selectedRequest = requestsList.find { it.id == selectedRequestId }
    var newMessage by remember { mutableStateOf("") }
    val currentName = TokenManager.getUserName() ?: "Condutor"

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Assistance / Chat") },
                navigationIcon = {
                    IconButton(onClick = {
                        if (selectedRequestId != null) {
                            selectedRequestId = null
                        } else {
                            navController.popBackStack()
                        }
                    }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Voltar")
                    }
                },
                scrollBehavior = scrollBehavior
            )
        }
    ) { padding ->
        Box(
            modifier = modifier
                .fillMaxSize()
                .padding(padding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            when {
                vm.isLoading.value -> {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                }
                vm.error.value != null -> {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("Erro: ${vm.error.value}", color = MaterialTheme.colorScheme.error)
                    }
                }
                selectedRequest == null -> {
                    val openRequests = requestsList.filter { it.status != "Closed" }
                    if (openRequests.isEmpty()) {
                        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            Text("Sem pedidos ou alertas.", color = MaterialTheme.colorScheme.onBackground)
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize().padding(12.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            items(openRequests, key = { it.id }) { request ->
                                RequestListItem(request = request, onClick = { selectedRequestId = request.id })
                            }
                        }
                    }
                }
                else -> {
                    ChatView(
                        request = selectedRequest!!,
                        currentName = currentName,
                        newMessage = newMessage,
                        onNewMessageChange = { newMessage = it },
                        onSend = {
                            if (newMessage.isNotBlank()) {
                                vm.sendMessage(selectedRequest!!.id, newMessage, currentName) {
                                    newMessage = ""
                                }
                            }
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun RequestListItem(
    request: AssistanceRequestRemote,
    onClick: () -> Unit
) {
    ElevatedCard(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer)
    ) {
        Column(Modifier.padding(16.dp)) {
            Text(
                text = request.reason,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurface,
                fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
            )
            Spacer(Modifier.height(4.dp))
            Text(
                text = request.subject,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 2
            )
            Spacer(Modifier.height(8.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = formatDate(request.date),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.primary
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    text = "${request.messages.size} mensagens",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
private fun ChatView(
    request: AssistanceRequestRemote,
    currentName: String,
    newMessage: String,
    onNewMessageChange: (String) -> Unit,
    onSend: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(12.dp)
    ) {
        Text(
            text = request.reason,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
        )
        Text(
            text = request.subject,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(Modifier.height(8.dp))

        LazyColumn(
            modifier = Modifier.weight(1f).fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            val sortedMessages = request.messages.sortedBy { it.timestamp }
            items(sortedMessages, key = { it.id }) { message ->
                val isOwn = message.sender.startsWith(currentName)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = if (isOwn) Arrangement.End else Arrangement.Start
                ) {
                    Column(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(
                                if (isOwn) MaterialTheme.colorScheme.primary
                                else MaterialTheme.colorScheme.surface
                            )
                            .border(
                                width = if (isOwn) 0.dp else 1.dp,
                                color = MaterialTheme.colorScheme.outline,
                                shape = RoundedCornerShape(12.dp)
                            )
                            .padding(12.dp)
                            .fillMaxWidth(0.75f)
                    ) {
                        Text(
                            text = message.sender,
                            style = MaterialTheme.typography.labelSmall,
                            color = if (isOwn) androidx.compose.ui.graphics.Color.White
                                   else MaterialTheme.colorScheme.primary,
                            fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
                        )
                        Spacer(Modifier.height(2.dp))
                        Text(
                            text = message.text,
                            style = MaterialTheme.typography.bodyMedium,
                            color = if (isOwn) androidx.compose.ui.graphics.Color.White
                                   else MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(Modifier.height(2.dp))
                        Text(
                            text = formatDate(message.timestamp),
                            style = MaterialTheme.typography.labelSmall,
                            color = if (isOwn) MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.7f)
                                   else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }

        Spacer(Modifier.height(8.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = newMessage,
                onValueChange = onNewMessageChange,
                modifier = Modifier.weight(1f),
                placeholder = { Text("Escreva uma mensagem...") },
                singleLine = true
            )
            Spacer(Modifier.width(8.dp))
            IconButton(onClick = onSend) {
                Icon(Icons.Default.Send, contentDescription = "Enviar")
            }
        }
    }
}

private fun formatDate(iso: String): String {
    return try {
        val parsed = OffsetDateTime.parse(iso)
        parsed.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
    } catch (e: Exception) {
        iso
    }
}
