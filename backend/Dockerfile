FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copiar apenas o csproj primeiro e fazer restore das dependências
COPY *.csproj ./
RUN dotnet restore

# Copiar o resto do código e compilar
COPY . ./
RUN dotnet publish -c Release -o out

# Gerar imagem final usando o runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out ./

# A API irá escutar na porta 80 dentro do contentor
ENV ASPNETCORE_URLS=http://+:80

ENTRYPOINT ["dotnet", "AMoVeR-Logistica.dll"]
