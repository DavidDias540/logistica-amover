package com.example.myamover.data.repository

import com.example.myamover.data.remote.ClientRemote
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class ClientRemoteRepository {

    suspend fun getAllClient():List<ClientRemote> = withContext(Dispatchers.IO){
        emptyList()
    }

    suspend fun getClientById(clientId: Int): ClientRemote = withContext(Dispatchers.IO) {
        ClientRemote(id = clientId, name = "Mock", email = "", phone = "", address = "Mock Address", lat = 0.0, lng = 0.0)
    }
}

/*

Porque existe um Repository entre ViewModel e backend

✔ Como funciona o acesso via API REST
✔ Onde alterar o nome da tabela/coluna
✔ Porque usar Dispatchers.IO para chamadas de rede
✔ Diferença entre listas e objetos únicos

Sugestões futuras (opcionais)

1️.Tratar erro de “cliente não encontrado”
runCatching { ... }.getOrElse { throw Exception("Cliente não encontrado") }


2️.Uniformizar nomes
eq("id", clientId) // preferível a "ID"


3️. Adicionar cache local (Room) se a lista crescer.

 */