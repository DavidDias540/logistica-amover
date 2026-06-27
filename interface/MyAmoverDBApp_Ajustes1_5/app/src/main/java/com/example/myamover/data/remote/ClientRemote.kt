package com.example.myamover.data.remote

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable


/**
 * ClientRemote
 *
 * Modelo de dados que representa um cliente
 * tal como vem do backend.
 *
 * Este modelo é usado sobretudo:
 * - quando carregas clientes da API
 * - para associar um cliente a uma task
 * - para mostrar dados do cliente na UI
 *
 * O sufixo "Remote" indica que este modelo
 * corresponde diretamente ao formato remoto (JSON).
 */
@Serializable
data class ClientRemote(

    /**
     * Identificador único do cliente na base de dados.
     *
     * Mapeado diretamente do campo "id" do JSON.
     */
    @SerialName("id")
    val id: Int,

    /**
     * Nome do cliente.
     *
     * Exemplo:
     * - "Farmácia Central"
     * - "João Silva"
     */
    val name: String,

    /**
     * Número de Identificação Fiscal (opcional).
     *
     * Pode ser null caso o cliente seja particular
     * ou o dado não esteja registado.
     */
    val nif: Int? = null,

    /**
     * Morada do cliente.
     *
     * Usada para:
     * - mostrar na UI
     * - cálculo/visualização da rota
     */
    val address: String,

    /**
     * Número de telefone do cliente (opcional).
     */
    val phone: String? = null,

    /**
     * Email do cliente (opcional).
     */
    val email: String? = null,

    /**
     * Longitude da localização do cliente.
     *
     * Usada no mapa e no cálculo da rota.
     */
    val lng: Double,


    /**
     * Latitude da localização do cliente.
     *
     * Usada no mapa e no cálculo da rota.
     */
    val lat: Double,

    )
