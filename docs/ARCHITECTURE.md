# ATINA II — Arquitetura inicial

## Estado
Arquitetura inicial proposta, ainda sem integração com backend ou UI.

## Stack
- Frontend: HTML/CSS/JavaScript moderno em módulos ES, sem framework obrigatório na fase inicial.
- Backend: Supabase (Auth, Postgres e RPC) para estado autoritativo, validação, pontuação e salas.
- Testes: Node.js `node:test` para lógica pura; testes de integração/E2E serão adicionados quando a UI e backend estiverem ligados.
- Deploy: GitHub Pages ou outro destino estático apenas após validar workflows e configuração.


## Princípios
- Sem bots, participantes artificiais ou jogadores automáticos no jogo.
- O cliente nunca decide correção nem pontuação em modos online.
- Dados secretos (respostas, alternativas privadas e soluções não reveladas) nunca são enviados antecipadamente ao cliente.
- Sala: o servidor é autoritativo; o cliente apresenta estado recebido e envia ações.
- Todas as transições são explícitas, validadas e idempotentes quando possível.
- Nenhuma dependência do Supabase de produção (`atina-development`) durante desenvolvimento local ou testes.

## Separação de módulos
- `src/game`: regras puras, estados e transições sem rede/UI.
- `src/room`: contratos de sala e adaptadores de sincronização (a implementar).
- `src/ui`: apresentação e interação (a implementar).
- `src/data`: adaptadores de catálogo (a implementar; sem respostas privadas).
- `tests`: testes unitários e de integração.

## Ciclo de ronda (proposta)
`waiting` → `ready` → `active` → `answering` → `revealing` → `finished`

As transições concretas, timer e regras de pontuação precisam de validação de produto antes de ligação ao backend.

## Segurança e ambiente
- Configuração local e testes não usam credenciais reais.
- Supabase `atina-development` é produção: não executar alterações de schema, permissões, limpeza ou dados nesse projeto sem revisão explícita.
- Backend deverá validar sessão/token, participante, ronda, prazo e ação antes de aceitar alterações.
