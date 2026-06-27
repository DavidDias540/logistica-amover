package com.example.myamover.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.TextButton
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MaterialTheme.colorScheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.myamover.R
import com.example.myamover.model.LoginViewModel
import com.example.myamover.navigation.NavRoutes


/**
 * LoginScreen
 *
 * Ecrã de login da aplicação.
 *
 * Responsável por:
 * - recolher email e password
 * - validar campos localmente
 * - chamar o LoginViewModel
 * - reagir ao sucesso/falha de autenticação
 * - navegar para o Home após login bem-sucedido
 *
 *  Não contém lógica de autenticação direta.
 * Toda a lógica está no LoginViewModel.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    windowSize: WindowWidthSizeClass,
    modifier: Modifier = Modifier,
    navController: NavController, // NavController recebido do AppNavGraph
) {
    // --- VIEWMODEL & STATE GLOBAL ---
    val viewModel: LoginViewModel = viewModel() //responsável pela autenticação
    val uiState by viewModel.ui.collectAsState()  // Estado exposto pelo ViewModel (StateFlow)

    // --- ESTADO LOCAL DOS CAMPOS ---
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    // Controla se a password está visível ou não
    var passwordVisible by remember { mutableStateOf(false) }

    // Mensagem de erro locais (validação)
    var emailError by remember { mutableStateOf("") }
    var passwordError by remember { mutableStateOf("") }



    // se o utilizador autenticou com sucesso -> navega para home/{email}
    /**
     * LaunchedEffect
     *
     * Observa alterações no utilizador autenticado.
     *
     * Quando o login é bem-sucedido:
     * - recebe o utilizador
     * - navega automaticamente para o Home
     */
    LaunchedEffect(uiState.loggedInUser) {
        uiState.loggedInUser?.let { user ->
            // protegemos o email para meter na rota (nav routes não gostam de caracteres especiais tipo '@')
            val encodedEmail = user.email.replace("@", "%40")

            if (user.requiresPasswordChange) {
                navController.navigate(NavRoutes.changePassword(encodedEmail)) {
                    popUpTo(NavRoutes.Login) { inclusive = true }
                    launchSingleTop = true
                }
            } else {
                navController.navigate(NavRoutes.home(encodedEmail)) {
                    // remove o login do histórico para não voltar atrás com back
                    popUpTo(NavRoutes.Login) { inclusive = true }
                    // Evita múltiplas instâncias da mesma screen
                    launchSingleTop = true
                }
            }
        }
    }

    // ───────────── LAYOUT PRINCIPAL ─────────────

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(colorScheme.background),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {

        // ───────────── HEADER (LOGO + FUNDO VERDE) ─────────────

        // HEADER verde + logo + nome app
        Box(modifier = Modifier.fillMaxWidth()) {
            Box(
                Modifier
                    .fillMaxWidth()
                    .height(120.dp)
                    .background(colorScheme.primary),
            )
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 82.dp),
                color = colorScheme.background,
                shape = RoundedCornerShape(50.dp)
            ) {
                Row(
                    modifier = Modifier
                        .padding(
                            start = 16.dp, end = 16.dp,
                            top = 4.dp, bottom = 16.dp
                        )
                ) {
                    Spacer(Modifier.size(96.dp))
                    Card(
                        modifier = Modifier
                            .width(120.dp)
                            .height(120.dp)
                            .offset(x = 50.dp, y = 5.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = colorScheme.background
                        ),
                    ) {
                        Text(
                            text = stringResource(id = R.string.logistics),
                            style = MaterialTheme.typography.titleLarge,
                            color = colorScheme.secondary
                        )
                    }
                }
            }

            // LOGO
            Card(
                modifier = Modifier
                    .size(128.dp)
                    .align(Alignment.TopStart)
                    .offset(x = 16.dp, y = 20.dp),
                shape = RoundedCornerShape(20.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
                colors = CardDefaults.cardColors(
                    containerColor = colorScheme.background
                )
            ) {
                Image(
                    painter = painterResource(R.drawable.logo_verde),
                    contentDescription = "Logo AmoVeR",
                    modifier = Modifier
                        .fillMaxSize()
                        .clip(RoundedCornerShape(20.dp))
                        ,
                    contentScale = ContentScale.Fit,
                    alignment = Alignment.Center
                )
            }
        }
        Spacer(modifier = Modifier.height(60.dp))


        // ───────────── TÍTULO ─────────────
        Text(
            text = stringResource(id = R.string.login),
            style = MaterialTheme.typography.bodyLarge,
            color = colorScheme.onBackground,
            fontSize = 35.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier
                .align(Alignment.CenterHorizontally)
                .padding(top = 46.dp)
        )

        Spacer(modifier = Modifier.height(40.dp))

        // ───────────── CAMPO EMAIL ─────────────
        OutlinedTextField(
            value = email,
            onValueChange = {
                email = it
                if (emailError.isNotEmpty()) emailError = ""
            },
            label = {
                Text(
                    emailError.ifEmpty { stringResource(id = R.string.email_label) },
                    color = if (emailError.isNotEmpty()) colorScheme.error else Color.Unspecified
                )
            },
            leadingIcon = {
                Icon(
                    imageVector = Icons.Default.AccountCircle,
                    contentDescription = stringResource(id = R.string.email_label)
                )
            },
            modifier = Modifier
                .padding(horizontal = 26.dp)
                .fillMaxWidth(),
            shape = MaterialTheme.shapes.medium,
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color.White,
                unfocusedContainerColor = colorScheme.surfaceContainerLowest,
                disabledContainerColor = Color.LightGray,
                errorContainerColor = colorScheme.errorContainer,
                focusedIndicatorColor = colorScheme.primary,
                unfocusedIndicatorColor = colorScheme.primary,
                focusedTextColor = colorScheme.primary,
                unfocusedTextColor = colorScheme.primary,
                focusedLabelColor = colorScheme.primary,
                unfocusedLabelColor = colorScheme.primary,
                focusedLeadingIconColor = colorScheme.primary,
                unfocusedLeadingIconColor = colorScheme.primary,
            ),
            singleLine = true,
            isError = emailError.isNotEmpty()
        )

        Spacer(modifier = Modifier.height(20.dp))

        // ───────────── CAMPO PASSWORD ─────────────
        OutlinedTextField(
            value = password,
            onValueChange = {
                password = it
                if (passwordError.isNotEmpty()) passwordError = ""
            },
            label = {
                Text(
                    passwordError.ifEmpty { stringResource(id = R.string.password) },
                    color = if (passwordError.isNotEmpty()) {
                        colorScheme.error
                    } else Color.Unspecified
                )
            },
            leadingIcon = {
                Icon(
                    imageVector = Icons.Default.Lock,
                    contentDescription = stringResource(id = R.string.password)
                )
            },
            visualTransformation = if (passwordVisible) {
                VisualTransformation.None
            } else {
                PasswordVisualTransformation()
            },
            trailingIcon = {
                val image = if (passwordVisible)
                    painterResource(id = R.drawable.visibility_24)
                else painterResource(id = R.drawable.visibility_off_24)

                Icon(
                    painter = image,
                    contentDescription = if (passwordVisible) stringResource(id = R.string.hide_password) else "stringResource.show_password",
                    modifier = Modifier.clickable { passwordVisible = !passwordVisible }
                )
            },
            modifier = Modifier
                .padding(horizontal = 26.dp)
                .fillMaxWidth(),
            shape = MaterialTheme.shapes.medium,
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color.White,
                unfocusedContainerColor = colorScheme.surfaceContainerLowest,
                disabledContainerColor = Color.LightGray,
                errorContainerColor = colorScheme.errorContainer,
                focusedIndicatorColor = colorScheme.primary,
                unfocusedIndicatorColor = colorScheme.primary,
                focusedTextColor = colorScheme.primary,
                unfocusedTextColor = colorScheme.primary,
                focusedLabelColor = colorScheme.primary,
                unfocusedLabelColor = colorScheme.primary,
                focusedLeadingIconColor = colorScheme.primary,
                unfocusedLeadingIconColor = colorScheme.primary,
                focusedTrailingIconColor = colorScheme.primary,
                unfocusedTrailingIconColor = colorScheme.primary,
            ),
            singleLine = true,
            isError = passwordError.isNotEmpty()
        )

        Spacer(modifier = Modifier.height(30.dp))

        // ───────────── BOTÃO LOGIN ─────────────

        val emailRequired = stringResource(id = R.string.email_is_required)
        val passwordRequired = stringResource(id = R.string.password_is_required)
        Button(
            onClick = {
                //Validação local
                emailError = if (email.isBlank()) emailRequired else ""
                passwordError = if (password.isBlank()) passwordRequired else ""

                //chama o VM se os campos forem válidos
                if (emailError.isEmpty() && passwordError.isEmpty()) {
                    viewModel.login(email, password)
                }
            },
            colors = ButtonDefaults.buttonColors(
                containerColor = colorScheme.primary,
                contentColor = colorScheme.onPrimary,
            ),
            modifier = Modifier
                .padding(horizontal = 36.dp)
                .fillMaxWidth(),
            enabled = !uiState.loading,

        ) {

            //Indicador de loading durante autenticação
            if (uiState.loading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(18.dp),
                    strokeWidth = 2.dp,
                )
                Spacer(modifier = Modifier.width(8.dp))
            }
            Text(
                text = stringResource(id = R.string.login),
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp,

            )
        }

        // ───────────── ERRO GLOBAL (AUTH) ─────────────(ex. auth falhou)
        if (uiState.message != null && uiState.loggedInUser == null) {
            Text(
                text = stringResource(id = R.string.error_login),
                color = colorScheme.error,
                fontSize = 15.sp,
                modifier = Modifier
                    .padding(horizontal = 26.dp, vertical = 16.dp)
            )
        }

        Spacer(modifier = Modifier.height(30.dp))

        var showForgotDialog by remember { mutableStateOf(false) }
        var forgotEmail by remember { mutableStateOf("") }

        // ───────────── FORGOT PASSWORD ─────────────
        Text(
            text = stringResource(id = R.string.forgot_password),
            color = colorScheme.onBackground,
            fontSize = 15.sp,
            modifier = Modifier
                .padding(horizontal = 26.dp)
                .clickable {
                    showForgotDialog = true
                }
        )

        if (showForgotDialog) {
            AlertDialog(
                onDismissRequest = { showForgotDialog = false },
                title = { Text(text = "Recuperar Password") },
                text = {
                    Column {
                        Text("Insira o seu email. Se a conta existir, receberá uma password temporária.")
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = forgotEmail,
                            onValueChange = { forgotEmail = it },
                            label = { Text("Email") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                        val msg = uiState.forgotPasswordMessage
                        if (msg != null) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(text = msg, color = colorScheme.primary)
                        }
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            viewModel.forgotPassword(forgotEmail)
                        },
                        enabled = !uiState.loading
                    ) {
                        Text("Enviar")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { 
                        showForgotDialog = false
                        viewModel.clearForgotMessage()
                    }) {
                        Text("Cancelar")
                    }
                }
            )
        }

    }
}

/*
Separação entre UI e autenticação

✔ Uso correto de LaunchedEffect para navegação
✔ Validação local simples
✔ Fluxo completo: login → ViewModel → Home
✔ Porque o NavController é recebido e não criado aqui
 */

