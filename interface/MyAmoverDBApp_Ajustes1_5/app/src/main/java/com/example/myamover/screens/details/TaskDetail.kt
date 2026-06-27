package com.example.myamover.screens.details


import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MaterialTheme.colorScheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.FileProvider
import com.example.myamover.R
import com.example.myamover.data.remote.LocationNodeRemote
import com.example.myamover.data.network.confirmations.SignaturePad
import com.example.myamover.data.remote.ClientRemote
import com.example.myamover.data.remote.TaskRemote
import java.io.File


/* --- Ecrã principal --- */
@OptIn(ExperimentalMaterial3Api::class)
@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun TaskDetailScreen(
    task: TaskRemote,
    client: ClientRemote,
    node: LocationNodeRemote?,
    onComplete: (status: String, photos: List<Uri>, signatureUri: Uri?, dispatcherNotes: String) -> Unit

) {
    val context = LocalContext.current

    val phone = client.phone ?: client.phone ?: "" // adapta ao nome real do campo
    val canCall = phone.isNotBlank()

    fun openDialer(number: String) {
        val intent = Intent(Intent.ACTION_DIAL).apply {
            data = Uri.parse("tel:${number.trim()}")
        }
        context.startActivity(intent)
    }


    // ---- estado da prova de entrega ----
    val photos = remember { mutableStateListOf<Uri>() }
    var signatureUri by remember { mutableStateOf<Uri?>(null) }
    var dispatcherNotes by remember { mutableStateOf("") }

    // ---- dialogs ----
    var showSignature by remember { mutableStateOf(false) }
    var showNotesDialog by remember { mutableStateOf(false) }

    var showCompleteDialog by remember { mutableStateOf(false) }
    var selectedStatus by rememberSaveable { mutableStateOf(CompletionStatus.COMPLETED) }


    // ---- Camera launcher ----
    val takePictureLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicture()
    ) { success ->
        if (!success && photos.isNotEmpty()) {
            photos.removeAt(photos.lastIndex)
        }
    }

    val createImageUri = remember {
        {
            val file = File(context.cacheDir, "photo_${System.currentTimeMillis()}.jpg")
            FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                file
            )
        }
    }

    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {

        item(key = "title") {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "ORD - ${task.id}",
                    style = MaterialTheme.typography.titleLarge
                )
                Text(
                    stringResource(id = R.string.time_delivery) + ": ",
                    fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
                )
                Text("${node?.status ?: "N/A"}")
            }
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                "Status: ${node?.status ?: "N/A"}",
                fontWeight = androidx.compose.ui.text.font.FontWeight.Bold,
                style = MaterialTheme.typography.titleMedium
            )

        }


        item(key = "stop") {
            ElevatedCard {
                Column(Modifier.padding(16.dp)) {
                    Text(node?.address ?: "N/A")


                }
            }
        }

        item(key = "client") {
            ElevatedCard {
                Column(
                    Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(stringResource(id = R.string.client), fontWeight = FontWeight.Bold)
                    Text(client.name ?: "N/A")

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = if (canCall) phone else stringResource(id = R.string.contactless),
                            modifier = Modifier.weight(1f)
                        )

                        val Call_phone = stringResource(id = R.string.call)
                        OutlinedButton(

                            onClick = { openDialer(phone) },
                            enabled = canCall
                        ) {
                            Icon(Icons.Default.Call, contentDescription = null)
                            Spacer(Modifier.width(8.dp))
                            Text(text = Call_phone)
                        }
                    }
                }
            }
        }


        item(key = "task_info") {
            ElevatedCard {
                Column(Modifier.padding(16.dp)) {
                    Text(stringResource(id = R.string.task_info), fontWeight = FontWeight.Bold)
                    Text(stringResource(id = R.string.note) + "${task.description ?: "-"}")
                    Text(stringResource(id = R.string.instruction) + " ${task.description ?: "-"}")

                }
            }
        }

        item(key = "proof") {

            ElevatedCard {
                Column(
                    Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {

                    Text(stringResource(id = R.string.photos), fontWeight = FontWeight.SemiBold)
                    val adPhoto = stringResource(id = R.string.add_photo)
                    val photosP = stringResource(id = R.string.photos)


                    ActionRowDetail(
                        title = adPhoto,
                        actionText = if (photos.isEmpty())
                            photosP
                        else
                            photosP + "(${photos.size})",
                        onClick = {
                            val uri = createImageUri()
                            photos.add(uri)
                            takePictureLauncher.launch(uri)
                        }
                    )

                    Text(stringResource(id = R.string.signature), fontWeight = FontWeight.SemiBold)
                    val signature = stringResource(id = R.string.signature)
                    val adsignature = stringResource(id = R.string.add_signature)
                    val signatureP = stringResource(id = R.string.signature_added)

                    ActionRowDetail(
                        title = stringResource(id = R.string.signature),
                        actionText = if (signatureUri == null)
                            stringResource(id = R.string.add_signature)
                        else
                            stringResource(id = R.string.signature_added),
                        onClick = { showSignature = true }
                    )

                    Text(stringResource(id = R.string.notes_to_dispatcher), fontWeight = FontWeight.SemiBold)

                    val addNotes = stringResource(R.string.add_notes)
                    val editNotes = stringResource(R.string.edit_notes)

                    ActionRowDetail(
                        title = "",
                        actionText = if (dispatcherNotes.isBlank())
                            addNotes
                        else
                            editNotes,
                        onClick = { showNotesDialog = true }
                    )
                }
            }
        }

        item(key = "complete_button") {
            Button(
                modifier = Modifier.fillMaxWidth(),
                onClick = { showCompleteDialog = true },
                colors = ButtonDefaults.buttonColors(
                    containerColor = colorScheme.primary,
                    contentColor = colorScheme.onBackground
                ),
            ) {
                Icon(imageVector = Icons.Default.Check, contentDescription = null)
                Text(stringResource(id = R.string.complete_task))
            }

        }

    }


    // --------- Dialog: Notes ---------
    if (showNotesDialog) {
        var temp by rememberSaveable { mutableStateOf(dispatcherNotes) }

        AlertDialog(
            onDismissRequest = { showNotesDialog = false },
            title = { Text(stringResource(id = R.string.notes_to_dispatcher)) },
            text = {
                OutlinedTextField(
                    value = temp,
                    onValueChange = { temp = it },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    dispatcherNotes = temp
                    showNotesDialog = false
                }) { Text("Save") }
            },
            dismissButton = {
                TextButton(onClick = { showNotesDialog = false }) {
                    Text(stringResource(id = R.string.cancel))
                }
            }
        )
    }

    // --------- Dialog: Signature ---------
    if (showSignature) {
        AlertDialog(
            onDismissRequest = { showSignature = false },
            title = { Text(stringResource(id = R.string.signature)) },
            text = {
                SignaturePad(
                    modifier = Modifier.fillMaxWidth(),
                    onSaved = { uri ->
                        signatureUri = uri
                        showSignature = false
                    }
                )
            },
            confirmButton = {},
            dismissButton = {
                TextButton(onClick = { showSignature = false }) {
                    Text(stringResource(id = R.string.close))
                }
            }
        )
    }
    if (showCompleteDialog) {
        AlertDialog(
            onDismissRequest = { showCompleteDialog = false },
            title = { Text(stringResource(id = R.string.complete_task)) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {


                    Row(verticalAlignment = Alignment.CenterVertically) {
                        androidx.compose.material3.RadioButton(
                            selected = selectedStatus == CompletionStatus.COMPLETED,
                            onClick = { selectedStatus = CompletionStatus.COMPLETED }
                        )
                        Spacer(Modifier.width(8.dp))
                        Text(stringResource(id = R.string.completed))
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        androidx.compose.material3.RadioButton(
                            selected = selectedStatus == CompletionStatus.NOT_COMPLETED,
                            onClick = { selectedStatus = CompletionStatus.NOT_COMPLETED }
                        )
                        Spacer(Modifier.width(8.dp))
                        Text(stringResource(id = R.string.not_completed))
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    showCompleteDialog = false
                    onComplete(
                        selectedStatus.toApiValue(),
                        photos.toList(),
                        signatureUri,
                        dispatcherNotes
                    )
                }) { Text(stringResource(id = R.string.confirm)) }
            },
            dismissButton = {
                TextButton(onClick = { showCompleteDialog = false }) { Text(stringResource(id = R.string.cancel)) }
            }
        )
    }

}

@Composable
fun ActionRowDetail(
    title: String,
    actionText: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.SemiBold
        )
        TextButton(onClick = onClick) {
            Icon(
                imageVector = Icons.Outlined.Add,
                contentDescription = null
            )
            Spacer(Modifier.width(6.dp))

            Text(text = actionText)
        }
    }
}

enum class CompletionStatus { COMPLETED, NOT_COMPLETED }

private fun CompletionStatus.toApiValue(): String =
    if (this == CompletionStatus.COMPLETED) "completed" else "not_completed"




