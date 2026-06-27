package com.example.myamover.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MaterialTheme.colorScheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.TwoWheeler
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import androidx.navigation.NavGraph.Companion.findStartDestination
import com.example.myamover.R
import com.example.myamover.model.LoginViewModel
import com.example.myamover.navigation.NavRoutes


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    email: String,
    name: String,
    windowSize: WindowWidthSizeClass,
    modifier: Modifier = Modifier,
    onOpenTasksClick: () -> Unit,
    onBackClick: () -> Unit,
    onOpenHistoryClick: () -> Unit,
    navController: NavController,
    //user: UserRemote,

) {
    when (windowSize) {
        WindowWidthSizeClass.Compact -> {
        }

        WindowWidthSizeClass.Medium -> {
        }

        WindowWidthSizeClass.Expanded -> {
        }

        else -> {
        }
    }

    val loginViewModel: LoginViewModel = viewModel()




    Column(
        modifier = modifier
            .fillMaxSize()
            .background(colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            val uiState = loginViewModel.ui.collectAsState().value

            // Left Side: Vehicle Info
            if (uiState.assignedVehicle != null) {
                Column {
                    Text(
                        text = stringResource(id = R.string.assigned_motorcycle),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        androidx.compose.material3.Icon(
                            imageVector = Icons.Default.TwoWheeler,
                            contentDescription = stringResource(id = R.string.vehicle),
                            tint = MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "${uiState.assignedVehicle.brand ?: ""} ${uiState.assignedVehicle.vid ?: ""}".trim(),
                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = androidx.compose.ui.text.font.FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            } else {
                Spacer(modifier = Modifier.width(8.dp))
            }

            // Right Side: User Profile
            OutlinedButton(
                onClick = { navController.navigate(NavRoutes.Profile) },
                shape = RoundedCornerShape(18.dp), // “pill”
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                colors = ButtonDefaults.outlinedButtonColors(
                    containerColor = colorScheme.background,
                    contentColor = MaterialTheme.colorScheme.onSurface
                ),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    val photoUrl = uiState.loggedInUser?.photoUrl
                    if (!photoUrl.isNullOrEmpty()) {
                        val cleanBase64 = photoUrl.substringAfter("base64,")
                        val bitmap = androidx.compose.runtime.remember(cleanBase64) {
                            try {
                                val decodedBytes = android.util.Base64.decode(cleanBase64, android.util.Base64.DEFAULT)
                                val bmp = android.graphics.BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
                                bmp?.asImageBitmap()
                            } catch (e: Exception) { null }
                        }
                        if (bitmap != null) {
                            androidx.compose.foundation.Image(
                                bitmap = bitmap,
                                contentDescription = stringResource(id = R.string.perfil),
                                modifier = Modifier
                                    .size(32.dp)
                                    .clip(androidx.compose.foundation.shape.CircleShape),
                                contentScale = ContentScale.Crop
                            )
                        } else {
                            androidx.compose.foundation.layout.Box(
                                modifier = Modifier
                                    .size(32.dp)
                                    .clip(androidx.compose.foundation.shape.CircleShape)
                                    .background(MaterialTheme.colorScheme.surfaceVariant),
                                contentAlignment = Alignment.Center
                            ) {
                                androidx.compose.material3.Icon(
                                    imageVector = androidx.compose.material.icons.Icons.Default.Person,
                                    contentDescription = stringResource(id = R.string.no_photo),
                                    modifier = Modifier.size(20.dp),
                                    tint = androidx.compose.ui.graphics.Color.White
                                )
                            }
                        }
                    } else {
                        androidx.compose.foundation.layout.Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(androidx.compose.foundation.shape.CircleShape)
                                .background(MaterialTheme.colorScheme.surfaceVariant),
                            contentAlignment = Alignment.Center
                        ) {
                            androidx.compose.material3.Icon(
                                imageVector = androidx.compose.material.icons.Icons.Default.Person,
                                contentDescription = stringResource(id = R.string.no_photo),
                                modifier = Modifier.size(20.dp),
                                tint = androidx.compose.ui.graphics.Color.White
                            )
                        }
                    }
                    Spacer(Modifier.width(8.dp))
                    Text(
                        text = uiState.loggedInUser?.name ?: name,
                        style = MaterialTheme.typography.bodyMedium,
                        color = colorScheme.scrim,
                    )
                }
            }
        }

            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 24.dp),
                colors = CardDefaults.cardColors(containerColor = colorScheme.background),
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // LOGO
                    Card(
                        modifier = Modifier.size(width = 240.dp, height = 96.dp),
                        shape = RoundedCornerShape(30.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
                        colors = CardDefaults.cardColors(containerColor = colorScheme.outlineVariant)
                    ) {
                        Image(
                            painter = painterResource(R.drawable.logo_verde),
                            contentDescription = stringResource(id = R.string.app_name),
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Fit
                        )
                    }

                    Spacer(Modifier.height(12.dp))

                    Text(
                        text = stringResource(id = R.string.logistics),
                        style = MaterialTheme.typography.headlineMedium.copy(fontWeight = androidx.compose.ui.text.font.FontWeight.Bold),
                        color = colorScheme.primary,
                        letterSpacing = 2.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(120.dp))
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 4.dp),
                //color = colorScheme.background
            ) {


                //TASKS
                Button(
                    onClick = onOpenTasksClick,
                    modifier = modifier
                        .fillMaxWidth()
                        .height(60.dp)
                        .padding(horizontal = 40.dp)
                        .shadow(10.dp),
                    shape = MaterialTheme.shapes.large,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = colorScheme.primaryContainer,
                        contentColor = colorScheme.scrim
                    ),

                    ) {
                    Text(
                        text = stringResource(id = R.string.tasks),
                        style = MaterialTheme.typography.titleLarge,
                        modifier = modifier.padding(8.dp)
                    )

                }

                Spacer(modifier = Modifier.height(60.dp))


                //History
                Button(
                    onClick = onOpenHistoryClick,
                    modifier = modifier
                        .fillMaxWidth()
                        .height(60.dp)
                        .padding(horizontal = 40.dp)
                        .shadow(10.dp),  // mais alto que o normal
                    shape = MaterialTheme.shapes.large, // usa o shape do seu Shape.kt
                    colors = ButtonDefaults.buttonColors(
                        containerColor = colorScheme.primaryContainer,
                        contentColor = colorScheme.scrim
                    )
                ) {
                    Text(
                        text = stringResource(id = R.string.history),
                        style = MaterialTheme.typography.titleLarge,
                    )
                }
            }
        }
    }




