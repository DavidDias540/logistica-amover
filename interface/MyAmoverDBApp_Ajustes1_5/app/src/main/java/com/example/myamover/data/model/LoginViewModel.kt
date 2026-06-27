package com.example.myamover.model

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.myamover.data.repository.AuthRepository
import com.example.myamover.data.repository.AuthUserData
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable

import com.example.myamover.data.remote.VehicleRemote
import com.example.myamover.data.repository.CourierRepository
import com.example.myamover.data.network.RetrofitProvider

@Serializable
data class User(
    val id: String,
    val email: String,
    val name: String,
    val photoUrl: String? = null,
    val requiresPasswordChange: Boolean = false
)

data class LoginUiState(
    val loading: Boolean = false,
    val loggedInUser: User? = null,
    val message: String? = null,
    val forgotPasswordMessage: String? = null,
    val assignedVehicle: VehicleRemote? = null
)

class LoginViewModel(
    private val authRepository: AuthRepository = AuthRepository(),
    private val courierRepository: CourierRepository = CourierRepository(authRepository = AuthRepository())
) : ViewModel() {

    private val _ui = MutableStateFlow(LoginUiState())
    val ui: StateFlow<LoginUiState> = _ui

    init {
        viewModelScope.launch {
            val current = authRepository.getCurrentUser()
            if (current != null) {
                _ui.value = _ui.value.copy(
                    loggedInUser = current.toUser(),
                    message = null,
                    loading = false
                )
                fetchAssignedVehicle()
            }
        }
    }

    private suspend fun fetchAssignedVehicle() {
        try {
            val courierId = courierRepository.getCourierIdByCurrentUser()
            if (courierId != null) {
                val api = RetrofitProvider.taskApi
                val vehicles = api.getAllVehicles()
                val vehicle = vehicles.find { it.ownerID == courierId }
                _ui.value = _ui.value.copy(assignedVehicle = vehicle)
            }
        } catch (e: Exception) {
            // Silently fail or handle error
        }
    }

    private fun AuthUserData.toUser(): User {
        return User(
            id = this.id,
            email = this.email,
            name = this.name,
            photoUrl = this.photoUrl,
            requiresPasswordChange = this.requiresPasswordChange
        )
    }

    fun login(email: String, password: String) {
        _ui.value = _ui.value.copy(
            loading = true,
            message = null
        )

        viewModelScope.launch {
            authRepository.login(email, password)
                .onSuccess { currentUser ->
                    _ui.value = _ui.value.copy(
                        loading = false,
                        loggedInUser = currentUser.toUser(),
                        message = null
                    )
                    fetchAssignedVehicle()
                }
                .onFailure { error ->
                    _ui.value = _ui.value.copy(
                        loading = false,
                        loggedInUser = null,
                        message = error.message ?: "Falha no login"
                    )
                }
        }
    }

    fun clearForgotMessage() {
        _ui.value = _ui.value.copy(forgotPasswordMessage = null)
    }

    fun forgotPassword(email: String) {
        _ui.value = _ui.value.copy(loading = true, forgotPasswordMessage = null)
        viewModelScope.launch {
            authRepository.forgotPassword(email)
                .onSuccess { message ->
                    _ui.value = _ui.value.copy(
                        loading = false,
                        forgotPasswordMessage = message
                    )
                }
                .onFailure { error ->
                    _ui.value = _ui.value.copy(
                        loading = false,
                        forgotPasswordMessage = error.message ?: "Erro ao solicitar nova password"
                    )
                }
        }
    }

    fun logout() {
        viewModelScope.launch {
            runCatching {
                authRepository.logout()
            }.onSuccess {
                _ui.value = _ui.value.copy(
                    loggedInUser = null,
                    message = null
                )
            }.onFailure {
                _ui.value = _ui.value.copy(
                    message = "Erro ao terminar sessão"
                )
            }
        }
    }
}
