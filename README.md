# ATINA II

> Nova geração do ATINA: reconstrução organizada, focada em jogo funcional, partidas online em sala e experiência solo.

## Visão (rascunho inicial)

Criar uma plataforma de jogo de desafios visuais em que os jogadores identificam respostas a partir de imagens, com modos Solo e Sala online. O modo Sala é uma prioridade central: deve funcionar de forma fiável em tempo real, com sincronização entre participantes, pontuação consistente e feedback claro.

## Princípios de produto

- **Sem bots no jogo:** não criar jogadores automatizados, bots de jogo ou participantes falsos.
- **Online primeiro para o modo Sala:** estado de partida, temporizadores, respostas, pontuação e feedback devem sincronizar corretamente entre jogadores.
- **Solo funcional:** manter uma experiência individual completa, incluindo feedback, solução e pontuação.
- **Dados reais:** não inventar jogadores, desafios, respostas, estados ou resultados.
- **Segurança:** proteger autenticação, sessões, permissões e dados; nunca expor segredos no cliente ou no Git.
- **Qualidade verificável:** testar fluxos completos, não apenas componentes isolados.

## Modos previstos

- **Solo:** jogar desafios individualmente, responder, revelar/confirmar solução e consultar resultado.
- **Sala online:** criar/entrar numa sala, sincronizar participantes e ronda, responder, revelar solução e atualizar pontuação de equipa/jogador.

Os detalhes de regras, formatos de ronda, limites de tempo e condições de vitória devem ser definidos antes de implementar.

## Prioridades

1. Corrigir e estabilizar a experiência de Sala online.
2. Garantir paridade e consistência do feedback e da solução entre Solo e Sala.
3. Estabelecer testes automatizados e validação de regressões.
4. Construir UI responsiva e acessível.
5. Documentar arquitetura e decisões.

## Estado atual

- Repositório criado e documentação base existente.
- Aplicação e stack ainda por definir.
- Esta visão é uma base de planeamento, não uma especificação final.

## Estrutura

```
Atina-II/
├── README.md
├── CONTRIBUTING.md
├── SECURITY.md
└── docs/
    └── ROADMAP.md
```

## Começar

```bash
git clone https://github.com/lufime/Atina-II.git
cd Atina-II
```

Consultar `docs/ROADMAP.md` para o planeamento.

## Ambiente e dados

O Supabase `atina-development` deve ser tratado como **produção**, caso seja utilizado por este projeto. Não executar operações destrutivas, migrações, limpeza de dados, alterações de permissões ou alterações de schema sem revisão explícita e validação de impacto.

## Contribuição

Consultar `CONTRIBUTING.md`. Não incluir credenciais, tokens, dados pessoais ou ficheiros locais sensíveis.

## Licença

A licença será definida quando o âmbito de distribuição estiver decidido.
