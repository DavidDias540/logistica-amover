# Montagem e Execução da Solução "A-MoVeR"

Este documento detalha os passos necessários para configurar, compilar e executar toda a infraestrutura tecnológica do projeto **A-MoVeR**. Graças à contentorização, não é necessário instalar manualmente dependências, bases de dados ou linguagens de programação na máquina anfitriã.

## Pré-Requisitos

1. **Docker e Docker Compose**
   - É obrigatório ter o [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e em execução no seu computador.
2. **Portas de Rede**
   - Certifique-se de que as seguintes portas estão livres na sua máquina:
     - `8080` e `8443` (Autenticação / Keycloak)
     - `5435` (Base de Dados PostgreSQL)
     - `5029` (Backend API / C# .NET)
     - `3000` (Plataforma de Gestão / Web Frontend)
     - `5000` (Algoritmo de Otimização de Rotas / Python)

---

## 1. Como Iniciar o Sistema (Web, Backend e BD)

Todo o ambiente de servidores foi orquestrado num único ficheiro `docker-compose.yml`.

1. Abra um **Terminal** (Linha de Comandos, CMD ou PowerShell) e navegue até à pasta raiz deste projeto (`logistica-amover`).
2. Execute o seguinte comando:
   ```bash
   docker-compose up -d --build
   ```
3. Aguarde alguns minutos. O Docker irá transferir as imagens base, compilar o código fonte da API e da plataforma Web, e montar a base de dados (incluindo o pré-carregamento dos dados do Keycloak com os utilizadores e permissões já configurados).
4. Quando o processo terminar, pode aceder aos serviços através do seu browser:
   - **Plataforma de Gestão Web:** [http://localhost:3000](http://localhost:3000)
   - **Documentação da API Backend:** [http://localhost:5029/swagger](http://localhost:5029/swagger)
   - **Servidor de Autenticação (Keycloak):** [http://localhost:8080](http://localhost:8080)

---

## 2. Instalação da Aplicação Móvel (Android)

A aplicação móvel para os condutores já se encontra pré-compilada para facilitar o processo de avaliação e teste.

1. Navegue até à pasta **`builds_móvel`** localizada na raiz do projeto.
2. Lá dentro, encontrará o ficheiro **`.apk`**.
3. Transfira este ficheiro para um dispositivo Android (via cabo USB, e-mail, Google Drive, etc.) ou arraste-o para dentro de um Emulador Android (como o Android Studio Emulator).
4. Instale a aplicação e abra-a. 

> **Nota:** Certifique-se de que o dispositivo móvel se encontra na mesma rede que o computador onde o Docker está a correr, caso esteja a tentar testar a conectividade em tempo real.

---

## 3. (Opcional) Como Recompilar a Aplicação Móvel

Caso faça alterações ao código fonte da aplicação móvel (na pasta `interface/MyAmoverDBApp_Ajustes1_5`) e queira gerar um novo APK final sem ter de instalar ou configurar o Android Studio, o nosso Docker resolve esse problema:

1. No terminal, na raiz do projeto, execute:
   ```bash
   docker-compose up --build android-builder
   ```
2. Este comando vai instanciar um contentor temporário com as ferramentas do Android (Gradle e SDK), compilar o seu código, gerar o `.apk` e guardá-lo automaticamente na pasta `builds_móvel`.
3. Assim que terminar, o contentor encerra-se para libertar a memória do seu computador.

---

## Estrutura de Pastas Relevante

- `/backend`: Código-fonte da API em C# .NET.
- `/PlataformaGestao`: Código-fonte da plataforma Web desenvolvida em React.
- `/routes/Projeto Final`: Código-fonte do algoritmo de otimização de rotas em Python.
- `/interface`: Código-fonte da aplicação móvel nativa em Android (Kotlin).
- `/kc-export`: Ficheiros cruciais de exportação do Keycloak (Não Apagar!). Contém os *Realms* e contas de utilizador pré-configuradas.
- `/BD-Logistica`: Scripts SQL e dumps para inicialização da base de dados PostgreSQL.
