package com.example.myamover.data.repository

import com.example.myamover.data.network.RetrofitProvider
import com.example.myamover.data.network.TokenManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import android.util.Base64
import org.json.JSONObject

class AuthRepository {

    private val keycloakApi = RetrofitProvider.keycloakApi

    suspend fun login(
        email: String,
        password: String
    ): Result<AuthUserData> {
        return withContext(Dispatchers.IO) {
            try {
                // 1. tenta autenticar
                val response = keycloakApi.login(username = email, password = password)

                // 2. decode JWT to get User ID, Email and Name
                val parts = response.accessToken.split(".")
                if (parts.size < 2) throw Exception("Invalid token")
                val decodedPayload = String(Base64.decode(parts[1], Base64.URL_SAFE))
                val json = JSONObject(decodedPayload)
                val userId = json.optString("sub", "")
                val userEmail = json.optString("email", email)
                val userName = json.optString("name", json.optString("preferred_username", "Motorista"))

                // 3. Save tokens immediately so backend calls are authenticated
                TokenManager.saveTokens(
                    accessToken = response.accessToken,
                    refreshToken = response.refreshToken,
                    userId = userId,
                    email = userEmail,
                    name = userName,
                    photoUrl = null
                )

                // 4. Obter info completa do utilizador (incluindo photoUrl e requiresPasswordChange) da API
                val backendUser = try {
                    RetrofitProvider.taskApi.getUserByEmail(userEmail)
                } catch (e: Exception) {
                    null
                }

                val finalName = backendUser?.name ?: userName
                val photoUrl = backendUser?.photoUrl
                val requiresPassChange = backendUser?.requiresPasswordChange ?: false

                // 5. Update stored name/photo if backend provided them
                TokenManager.saveTokens(
                    accessToken = response.accessToken,
                    refreshToken = response.refreshToken,
                    userId = userId,
                    email = userEmail,
                    name = finalName,
                    photoUrl = photoUrl
                )

                Result.success(AuthUserData(id = userId, email = userEmail, name = finalName, photoUrl = photoUrl, requiresPasswordChange = requiresPassChange))

            } catch (e: Exception) {
                Result.failure(Exception("Email ou palavra-passe incorretos."))
            }
        }
    }

    suspend fun getCurrentUser(): AuthUserData? {
        return withContext(Dispatchers.IO) {
            val userId = TokenManager.getUserId()
            val email = TokenManager.getUserEmail()
            val name = TokenManager.getUserName() ?: "Motorista"
            val photoUrl = TokenManager.getUserPhoto()
            if (userId != null && email != null) {
                AuthUserData(id = userId, email = email, name = name, photoUrl = photoUrl)
            } else {
                null
            }
        }
    }

    suspend fun getCurrentUserUuid(): String? {
        return withContext(Dispatchers.IO) {
            TokenManager.getUserId()
        }
    }

    suspend fun requireCurrentUserUuid(): String {
        return getCurrentUserUuid()
            ?: throw IllegalStateException("Utilizador não autenticado")
    }

    suspend fun logout() {
        TokenManager.clear()
    }

    suspend fun forgotPassword(email: String): Result<String> {
        return withContext(Dispatchers.IO) {
            try {
                val response = RetrofitProvider.taskApi.forgotPassword(
                    com.example.myamover.data.remote.TaskApiService.ForgotPasswordRequest(email)
                )
                Result.success(response.message)
            } catch (e: Exception) {
                Result.failure(Exception("Ocorreu um erro ao pedir a recuperação de password."))
            }
        }
    }
}

// o DTO simples que a app realmente usa
/**
 * AuthUserData
 *
 * DTO simples que a app realmente usa.
 *
 * Evita expor diretamente o token/utilizador remoto
 * ao resto da aplicação.
 */
data class AuthUserData(
    val id: String,
    val email: String,
    val name: String = "",
    val photoUrl: String? = null,
    val requiresPasswordChange: Boolean = false
)

/*
Separação correta Repository ↔ ViewModel
✔ Uso adequado de Result<T> para sucesso/erro
✔ Normalização de mensagens para o utilizador
✔ Proteção contra erros de thread (Dispatchers.IO)
✔ Conversão limpa entre modelo remoto e modelo da app
Sugestões futuras (opcionais)

1. Adicionar refresh de sessão com refresh_token do Keycloak

2. Suporte a outros providers
Google
GitHub
OTP

3. Mapear tipos de erro mais específicos
utilizador bloqueado
email não confirmado
 */