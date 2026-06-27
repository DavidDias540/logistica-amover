package com.example.myamover.screens.details


import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.myamover.R
import com.example.myamover.data.remote.ClientRemote
import com.example.myamover.data.remote.TaskRemote
import com.example.myamover.route.utils.formatIsoDateTime


/**
 * HistoryDetailScreen
 *
 * Ecrã de detalhe de uma tarefa HISTÓRICA (já concluída).
 *
 * Este ecrã é apenas informativo:
 * - não permite editar
 * - não permite completar tarefas
 *
 * Mostra:
 * - informação geral da tarefa
 * - estado e tipo
 * - dados do cliente
 * - notas e janelas temporais
 */
@OptIn(ExperimentalMaterial3Api::class)
@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun HistoryDetailScreen(
    task: TaskRemote, //tarefa selecionada (histórico)
    client: ClientRemote, //cliente associado à tarefa
    modifier: Modifier = Modifier,
    onBack: () -> Unit, //callback para voltar atrás

    ) {

    val startDate = formatIsoDateTime(task.creationDate, "dd-MM-yyyy")
    val startTime = formatIsoDateTime(task.creationDate, "HH:mm")
    val updated_at = formatIsoDateTime(task.creationDate, "dd-MM-yyyy")


    val endDate = formatIsoDateTime(task.creationDate, "dd-MM-yyyy")
    val endTime = formatIsoDateTime(task.creationDate, "HH:mm")

    /**
     * Scaffold fornece a estrutura base do ecrã.
     *
     * Aqui:
     * - não usamos TopBar nem BottomBar
     * - removemos insets do sistema para layout total
     */
    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
    ) { padding ->

        /**
         * LazyColumn:
         * - permite scroll vertical
         * - organiza os conteúdos em blocos (cards)
         */
        LazyColumn(
            modifier = modifier.padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {

            //---------------- Título ---------------
            item {
                Text("Task ORD-${task.id}", style = MaterialTheme.typography.titleLarge)
            }

            // ───────────── ESTADO E TIPO ─────────────
            item {
                ElevatedCard {
                    Column(Modifier.padding(16.dp)) {
                        Text(stringResource(id = R.string.status) +" ${task.status ?: "-"}")
                        Text(stringResource(id = R.string.type_label) +" ${task.type ?: "-"}")
                    }
                }
            }

            // ───────────── CLIENTE ─────────────
            item {
                ElevatedCard {
                    Column(Modifier.padding(16.dp)) {
                        Text(stringResource(id = R.string.address), fontWeight = FontWeight.Bold)
                        Text(task.nodes?.firstOrNull()?.address ?: "N/A")

                    }
                }
            }

            // ───────────── INFORMAÇÃO DA TAREFA ─────────────
            item {
                ElevatedCard {
                    Column(Modifier.padding(16.dp)) {
                        Text(stringResource(id = R.string.info), fontWeight = FontWeight.Bold)
                        Text(stringResource(id = R.string.annotation)+" ${task.description ?: "-"}")
                        Text(stringResource(id = R.string.client_label)+"${client.name ?: "N/A"} ")
                        Text(client.address ?: "N/A")
                        Text(stringResource(id = R.string.window) +" $startDate $startTime - $endDate $endTime")
                        Text(stringResource(id = R.string.date_update) + " $updated_at")
                    }
                }
            }

            // ───────────── BOTÃO VOLTAR ─────────────
            item {
                TextButton(onClick = onBack) { Text(stringResource(id = R.string.back)) }
            }
        }
    }
}




