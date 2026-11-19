# Roadmap — ATINA II

Roadmap inicial de reconstrução. As regras de jogo e decisões técnicas ainda precisam de validação; itens abaixo não pressupõem decisões finais.

## Fase 0 — Fundação

- [x] Criar repositório GitHub
- [x] Documentação inicial
- [x] Registar visão e princípios
- [ ] Definir regras de jogo e requisitos detalhados
- [ ] Escolher stack e arquitetura
- [ ] Definir estratégia de ambiente, deploy e rollback

## Fase 1 — Especificação do jogo

- [ ] Especificar fluxo de Solo do início ao fim
- [ ] Especificar fluxo de Sala: criar, entrar, lobby, início, rondas e encerramento
- [ ] Definir sincronização, autoridade de estado e reconexão
- [ ] Definir regras de resposta, revelação, feedback e pontuação
- [ ] Definir estados de ronda e transições válidas
- [ ] Definir acessibilidade, responsividade e comportamento em dispositivos móveis
- [ ] Definir requisitos de privacidade e segurança

## Fase 2 — Fundação técnica

- [ ] Escolher e registar stack
- [ ] Criar estrutura de aplicação e ambientes
- [ ] Configurar lint, tipos e testes
- [ ] Configurar CI para validações automáticas
- [ ] Configurar observabilidade sem expor dados sensíveis
- [ ] Rever segurança e dependências

## Fase 3 — MVP Solo

- [ ] Implementar seleção/carregamento de desafio
- [ ] Implementar resposta e validação
- [ ] Implementar feedback visual correto/incorreto
- [ ] Implementar revelação de solução
- [ ] Implementar imagem e texto da solução quando aplicável
- [ ] Implementar pontuação e resumo final
- [ ] Testar fluxo completo e regressões

## Fase 4 — MVP Sala online (prioridade)

- [ ] Criar sala e código de entrada
- [ ] Lobby com participantes reais
- [ ] Sincronização de estado entre clientes
- [ ] Iniciar/avançar rondas com estado consistente
- [ ] Temporizador sincronizado e comportamento definido quando termina
- [ ] Resposta e revelação funcionais segundo as regras
- [ ] Feedback visual consistente com Solo
- [ ] Pontuação de jogadores/equipas A e B
- [ ] Imagem e solução visíveis na fase correta
- [ ] Reconexão e recuperação de sessão
- [ ] Tratamento de saída de jogadores e anfitrião
- [ ] Testes com vários clientes reais; **não usar bots de jogo**

## Fase 5 — Validação e lançamento

- [ ] Testes unitários, integração e end-to-end
- [ ] Testar vários clientes em simultâneo e latência/reconexão
- [ ] Validar acessibilidade e layouts em tamanhos de ecrã
- [ ] Testar segurança e permissões
- [ ] Rever logs e erros
- [ ] Documentar deploy, rollback e operação
- [ ] Validar com utilizadores reais

## Regras de operação e segurança

- Não introduzir bots, jogadores artificiais ou participantes falsos.
- Não tratar `atina-development` como ambiente descartável: se ligado, é produção.
- Não executar ações destrutivas no Supabase, alterações de schema, migrações ou remoções sem confirmação/revisão de impacto.
- Não afirmar que uma funcionalidade, teste, correção ou deploy está concluído sem evidência.
- Fazer alterações pequenas, rastreáveis e verificáveis; preferir branch e PR para revisão.

## Decisões

Registar aqui decisões com data, contexto, alternativas e impacto.
