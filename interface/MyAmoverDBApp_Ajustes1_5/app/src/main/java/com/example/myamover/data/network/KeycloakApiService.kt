package com.example.myamover.data.network

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded
import retrofit2.http.POST

@Serializable
data class KeycloakTokenResponse(
    @SerialName("access_token") val accessToken: String,
    @SerialName("expires_in") val expiresIn: Int,
    @SerialName("refresh_expires_in") val refreshExpiresIn: Int,
    @SerialName("refresh_token") val refreshToken: String,
    @SerialName("token_type") val tokenType: String,
    @SerialName("not-before-policy") val notBeforePolicy: Int = 0,
    @SerialName("session_state") val sessionState: String = "",
    @SerialName("scope") val scope: String = ""
)

interface KeycloakApiService {
    @FormUrlEncoded
    @POST("realms/amover-realm/protocol/openid-connect/token")
    suspend fun login(
        @Field("username") username: String,
        @Field("password") password: String,
        @Field("client_id") clientId: String = "amover-api",
        @Field("grant_type") grantType: String = "password"
    ): KeycloakTokenResponse
}
