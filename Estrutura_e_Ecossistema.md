# Estrutura e Funcionamento do Ecossistema A-MoVeR 🌍

Este documento detalha o funcionamento e a interação entre todos os componentes que formam a plataforma de logística verde "A-MoVeR".

O projeto foi desenhado seguindo uma **arquitetura de microsserviços modularizada**, permitindo alta escalabilidade e separação clara de responsabilidades. Todo o sistema assenta em contentores geridos por `Docker Compose`.

---

## 1. Visão Geral dos Componentes

O sistema é constituído por 6 peças fundamentais:

1. **Plataforma de Gestão Web (Frontend)** - *React, TypeScript, Tailwind CSS, Vite*
2. **Aplicação Móvel para Condutores (App)** - *Android Nativo, Kotlin, Jetpack Compose*
3. **Serviço Central (Backend API)** - *C# .NET 8, Entity Framework Core*
4. **Motor de Otimização de Rotas** - *Python, Flask, Google OR-Tools*
5. **Servidor de Autenticação e Identidade** - *Keycloak (Java)*
6. **Base de Dados Principal** - *PostgreSQL*

---

## 2. Como Funciona a Autenticação (Fluxo Keycloak)

A segurança do ecossistema é delegada ao **Keycloak**, funcionando como o único ponto de entrada para identificação de utilizadores (SSO - Single Sign-On).

- A base de dados do Keycloak guarda credenciais, tokens e atribui *roles* (ex: `manager` vs `driver`).
- O Backend interage diretamente com o Keycloak via "Keycloak Admin REST API" (em C#) para criar novos utilizadores, repor passwords temporárias e apagar contas de forma transparente, mantendo a sincronização entre a tabela local de `Users` no Postgres e o cofre do Keycloak.

---

## 3. O Coração do Sistema: Backend (.NET 8 API)

O serviço em `C#` atua como o maestro do sistema. 
- **Gestão de Dados:** Expondo REST APIs para gerir Empresas, Motas, Clientes, Tarefas, Rotas, e Alertas.
- **Integração com Postgres:** Usa `Entity Framework Core` (ORM) para gravar o estado de todas as entidades.
- **Lógica de Negócio:**
  - Quando um Gestor atribui tarefas a uma Mota numa determinada data, o Backend regista essas tarefas como pendentes de roteamento.
  - O Backend nunca otimiza rotas diretamente; ele delega tarefas complexas.

---

## 4. Otimização Inteligente (Python Flask)

O módulo de otimização de logística está isolado em Python (pasta `routes`).

1. Quando um Gestor clica em **"Gerar Rota"** no Frontend Web:
2. O Backend (.NET) reúne as coordenadas GPS das tarefas do dia atribuídas àquela Mota.
3. O Backend faz um pedido HTTP interno `POST /optimize` ao Contentor Python (`amover-routes-optimizer`).
4. O Python usa a biblioteca **Google OR-Tools** (VRP/TSP) para calcular a ordem exata em que o condutor deve visitar os clientes para poupar tempo e energia.
5. O Python devolve a "ordem ideal" ao Backend.
6. O Backend grava a Rota Final na Base de Dados e notifica a App do Condutor.

---

## 5. Plataforma de Gestão (Painel Web)

Usada exclusivamente pelos gestores/administradores (via browser). Fica alojada na pasta `PlataformaGestao`.
Comunica via HTTP diretamente com o Backend (.NET).

- **Gestão Global:** Permite CRUD (Criar, Ler, Atualizar, Apagar) de Frotas de Motas Elétricas e Condutores.
- **Despacho:** Permite visualizar as rotas otimizadas.
- **Manutenção e Design:** Conta agora com modo diurno/noturno totalmente funcional e adaptado aos olhos do utilizador.

---

## 6. Aplicação Android (Interface do Condutor)

A app corre nos telemóveis dos condutores das motas (pasta `interface`).
- Ao fazer login, a App puxa apenas as **tarefas atribuídas ao utilizador logado** para aquele dia específico.
- **Workflow Diário:**
  1. Condutor verifica a Rota gerada.
  2. Inicia uma Tarefa (Estado passa a *Em Progresso*).
  3. Navega até ao Cliente.
  4. Finaliza a Tarefa (Estado passa a *Concluído*).
  5. Se houver um problema na mota, o condutor regista um pedido de Assistência diretamente na App.

---

## 7. Estrutura de Pastas e Redes no Docker

- `backend/` -> Código C# (.NET 8).
- `PlataformaGestao/` -> Código frontend Web React.
- `interface/` -> Código fonte móvel Android.
- `routes/` -> Motor de IA/Google OR-Tools (Python).
- `kc-export/` -> Definições e reinos (Realm) do Keycloak.
- `BD-Logistica/` -> Ficheiros SQL opcionais para a Base de Dados.

O `docker-compose.yml` na raiz agrupa tudo numa rede interna isolada, expondo apenas as portas 80 (React), 5029 (Backend API), 5435 (Postgres direto) e 8080 (Keycloak).
