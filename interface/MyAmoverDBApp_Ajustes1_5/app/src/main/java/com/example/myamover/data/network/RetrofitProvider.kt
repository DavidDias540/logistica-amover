package com.example.myamover.data.network

import com.example.myamover.BuildConfig
import com.example.myamover.data.remote.TaskApiService
import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import kotlinx.serialization.json.Json
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Response
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.http.Body
import retrofit2.http.POST


/**
 * RetrofitProvider
 *
 * Singleton responsÃ¡vel por:
 * - configurar o Retrofit
 * - configurar o OkHttp
 * - definir a URL base da API
 * - criar a instÃ¢ncia do TaskApiService
 *
 * Toda a app usa este provider para fazer chamadas HTTP.
 */
object RetrofitProvider {

    private val BASE_URL = BuildConfig.BASE_URL
    private val KEYCLOAK_URL = BuildConfig.KEYCLOAK_URL

    private val authInterceptor = Interceptor { chain ->
        val original = chain.request()

        val token = TokenManager.getAccessToken()

        val request = original.newBuilder().apply {
            if (token != null) header("Authorization", "Bearer $token")
        }.build()

        chain.proceed(request)
    }

    private val logging = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttp = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(logging)
        .build()

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        coerceInputValues = true
    }

    private val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttp)
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()

    private val keycloakRetrofit: Retrofit = Retrofit.Builder()
        .baseUrl(KEYCLOAK_URL)
        .client(OkHttpClient.Builder().addInterceptor(logging).build()) // Sem interceptor de auth para o login
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()

    val taskApi: TaskApiService = retrofit.create(TaskApiService::class.java)
    val keycloakApi: KeycloakApiService = keycloakRetrofit.create(KeycloakApiService::class.java)

    data class RegisterTokenBody(
        val user_id: String,
        val fcm_token: String,
        val platform: String = "android"
    )

    interface PushApi {
        @POST("push/register-token")
        suspend fun register(@Body body: RegisterTokenBody): Response
    }


}


/*
O que este ficheiro explica:

Onde alterar a URL da API
Como ativar autenticaÃ§Ã£o por token no futuro
Porque usar ignoreUnknownKeys, isLenient, coerceInputValues
Onde adicionar novos interceptors (timeout, cache, etc.)
 */
