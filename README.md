# Grupo Serviços de Logística A-MoVeR

## Agenda 📑 

<div style="text-align: center">
    <img src="/images/A-MoVeR.jpg" width="300" height: auto;>
</div>
The A-Mover Agenda aims to bring about a substantial change in the industrial development model in the Region of Trás-os-Montes and Alto Douro, through the realisation of a series of industrial investments that will allow the participating companies to enter international segments with high added value and a strong concern for global sustainability. As a result, a mobility services management platform is being developed that integrates technology in a compact and agile format.


## See Also 👀
<br>
<div style="text-align: center">
    <a href="https://www.utad.pt/gpfe/a-mover/">
        <img src="/images/utad.png" width="300" height: auto;>
    </a>
</div>

## Contributing 📃

The development process of an integrated mobility services management platform aimed at supporting the professional use of electric motorcycles. The platform's architecture involves a complex and efficient integration between frontend modules and a web platform, complemented by a backend system. The objective is to create an interface for drivers, facilitating access to a wide range of mobility options and providing detailed and relevant information. The creation of a web platform for fleet management and maintenance, along with a robust backend that ensures an updated and consistent data flow, significantly contributes to enhancing the user experience and the efficiency of operational management.

## Partnership 🤝
<div style="text-align: center">
    <img src="/images/OIP.jpeg" width="300" height: auto;>
</div>

AJP Motos, a Portuguese company that designs and manufactures motorcycles. This partnership contributes to technical and technological advancement, strengthens the connection between the different stakeholders in the project, drives innovation, and ensures the practical application of the developed solutions.

## Guia de Instalação Rápida (Para Avaliadores / Novos Membros) 🚀

Para testar ou correr todo este ecossistema (Plataforma Web, Backend, Algoritmo de Rotas, Base de Dados e Keycloak) de forma automática, **não é necessário instalar nenhuma linguagem de programação** na máquina hospedeira. Apenas precisas do Docker!

### 1. Pré-requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e a correr.
- Portas disponíveis no teu computador: `8080`, `8443` (Keycloak), `5435` (PostgreSQL), `5029` (Backend API), `3000` (Frontend), `5000` (Algoritmo).

### 2. Como iniciar o projeto
1. Abre a linha de comandos (Terminal, CMD ou PowerShell) dentro desta pasta raiz do projeto.
2. Executa o seguinte comando mágico:
   ```bash
   docker-compose up -d --build
   ```
3. O Docker vai automaticamente transferir as imagens, construir o código-fonte, criar a Base de Dados e iniciar todo o sistema integrado. O processo de build pode demorar alguns minutos na primeira execução.

### 3. Aceder às Plataformas
Após o comando terminar e os contentores estarem "Up", podes aceder através do browser:

- **Plataforma de Gestão (Web)**: [http://localhost:3000](http://localhost:3000)
- **Documentação da API (Backend)**: [http://localhost:5029/swagger](http://localhost:5029/swagger)
- **Keycloak (Autenticação)**: [http://localhost:8080](http://localhost:8080)

### 4. App Móvel (Android)
- Se precisares de instalar a aplicação no telemóvel dos condutores, acede à pasta `builds_móvel` localizada na raiz do projeto.
- Encontrarás lá o ficheiro **`.apk`** final pronto a ser instalado em qualquer dispositivo Android real ou Emulador.
- *(Opcional)*: Se quiseres gerar um APK novo a partir do código atual sem usar o Android Studio, executa: `docker-compose up --build android-builder` e o novo APK será exportado magicamente para a pasta `builds_móvel`.


## About us 📑 
Our group consists of:
<br>

* Prof. Tiago Pinto(coordinator)
* Beatriz Teixeira
* David Dias
* Gonçalo Penelas
* João Ferreira
* Soraia Fernandes

Ex-members:
* Ana Vigário
* Nuno Oliveira
* Rodrigo Fernandes
