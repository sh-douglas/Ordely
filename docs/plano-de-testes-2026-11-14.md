PLANO DE TESTES • REVISÃO 14/11/2026

# Validação funcional, de uso e de dados

Grupo Ordely | Carlos Jr, Douglas de Souza, Gabriel Macêdo e Ramon Victor

Material para o integrante responsável pela execução. Atualiza o roteiro anterior “Roteiro de testes funcionais, de uso e de dados”, mantendo as três frentes e acrescentando RBAC, desligamento, exclusão, unicidade e financeiro.

## 1. Preparação e critérios

Use uma instalação de testes com frontend, API e PostgreSQL na mesma revisão. Registre commit, URL, data, responsável, navegador e dispositivo. Separe contas ADMIN, EMPLOYEE ativo e EMPLOYEE desativado; nunca inclua senhas nas evidências.

Prepare duas categorias, produtos fictícios e pedidos de diferentes status. Para as datas, use o horário de São Paulo. Mantenha os dados de teste separados dos dados reais. Para validar valores financeiros, anote o total inicial antes de criar novos pedidos.

Aprovação: todos os casos críticos passam; nenhuma falha de autorização, duplicidade ou divergência de valores fica aberta. Demais falhas precisam de descrição, impacto e decisão registrada pelo grupo. Resultado manual inicial de cada caso: NÃO EXECUTADO.

## 2. Automação já executada

Comando / local | Resultado registrado
api: npm test | 77 aprovados (HTTP e repositórios simulados).
web: npm test | 30 aprovados (interface com API simulada).
api: npm run test:db | 1 integrado aprovado no PostgreSQL; rollback dos dados.
api e web: npm run build | Ambos aprovados.

Os 108 testes aprovados e a inspeção local do navegador são evidência técnica desta revisão. Não substituem os cenários humanos, a verificação da hospedagem ou a rodada de usabilidade abaixo.

# 3. Casos funcionais críticos

ID / prioridade | Procedimento | Resultado esperado
RB01 / crítica | Sem sessão, abrir Equipe e Financeiro; chamar as rotas da API. | Interface encaminha ao login; API retorna 401.
RB02 / crítica | Entrar como funcionário; conferir menu e abrir /painel/equipe e /painel/financeiro diretamente. Chamar GET /finance e GET /auth/employees com o token. | Links ocultos; acesso direto retorna ao painel; API responde 403.
RB03 / crítica | Entrar como admin, listar equipe e cadastrar funcionário. Tentar enviar role=ADMIN no cadastro. | Cadastro acessível ao admin; nova conta permanece EMPLOYEE.
RB04 / crítica | Manter funcionário logado em outra janela. Admin confirma Desativar acesso; funcionário tenta nova ação e novo login. | Status Off; ação retorna 401 e encerra sessão; login recusado.
RB05 / alta | Cancelar a desativação e depois confirmar; reativar o funcionário. Tentar desativar admin pela API. | Cancelamento não altera nada; reativação permite login; admin protegido com 409.
PR01 / crítica | Cadastrar “X Burger”; tentar “ x   BURGER ” em outra categoria e duas requisições simultâneas equivalentes. | Somente um cadastro equivalente persiste; demais recebem 409.
PR02 / alta | Editar outro produto para nome existente. Depois alterar somente preço/descrição de um produto. | Nome repetido bloqueado; edição válida salva e permanece após recarregar.
PR03 / crítica | Excluir produto usado em pedido: cancelar primeiro, depois confirmar. Abrir cardápio, estoque e histórico. | Cancelamento preserva produto; confirmação remove do catálogo e estoque, preservando itens e preços do pedido.
PR04 / alta | Usar ID excluído em novo pedido, edição e disponibilidade. Tentar cadastrar novamente o mesmo nome. | Produto indisponível para novas operações; nome continua reservado.

# 4. Financeiro e regressão

ID / prioridade | Procedimento | Resultado esperado
FI01 / crítica | Concluir pedidos de R$ 10,10 e R$ 20,20 no período; manter outro pendente e um cancelado. Comparar com o total inicial. | Incremento exato de R$ 30,30 e dois pedidos; outros status não entram.
FI02 / crítica | Em ambiente de testes, preparar pedidos nas fronteiras de 14/11/2026 e 15/11/2026. Filtrar esses dois dias. | Inclui 14/11 00:00 e 15/11 23:59:59; exclui 13/11 23:59:59 e 16/11 00:00 (São Paulo).
FI03 / alta | Filtrar um único dia, depois período sem vendas; clicar Todo o período. | Mesmo dia é aceito; vazio mostra zero; reset restaura total geral.
FI04 / alta | Tentar data impossível, início posterior ao fim e API com apenas uma data. | API retorna 400; interface orienta corrigir intervalo.
FI05 / alta | Concluir hoje pedido criado no dia anterior; alterar preço atual do produto. | Valor aparece no dia de criação; preço atual não modifica total histórico.
RG01 / alta | Cardápio → sacola → pedido → rastreamento → preparo → pronto → conclusão. | Fluxo funciona e status acompanha a operação.
RG02 / média | Testar login inválido, campos vazios, telefone inválido, preço negativo e edição de categoria. | Validações e mensagens permanecem funcionais.
RG03 / alta | Desconectar API durante consulta e ação; reconectar e tentar novamente. | Erro visível; nenhum sucesso falso nem valor fictício.

## 5. Persistência e migração

Recarregue as telas após mudanças; confira status, nomes e totais no banco por consulta controlada. Verifique role/active nos funcionários e deletedAt/available nos produtos excluídos. Execute seed duas vezes: a conta não deve duplicar e a senha não deve mudar. Em uma base de teste com nomes duplicados, a migração deve falhar sem remover ou renomear dados.

# 6. Uso, evidências e entrega

Convide de três a cinco pessoas, incluindo alguém fora do desenvolvimento. Peça tarefas sem ensinar onde clicar: fazer pedido com dois produtos e acompanhá-lo; iniciar preparo; alterar preço; desativar funcionário como admin; consultar vendas entre dois dias. Use computador e celular.

Registre conclusão, tempo aproximado, hesitações, necessidade de ajuda, compreensão de Off/desligado e da confirmação de exclusão. Observe legibilidade, foco por teclado, mensagens de erro e ausência de rolagem horizontal. A rodada com participantes ainda não foi executada nesta entrega.

## 7. Modelo de registro por caso

Campo | Preencher durante a execução
Identificação | ID do caso, responsável, data/hora, commit e ambiente.
Preparação | Perfil, dados fictícios usados e estado inicial.
Execução | Passos realizados e resultado observado.
Resultado | Aprovado / Reprovado / Bloqueado / Não executado.
Evidência | Captura ou vídeo e, quando necessário, código HTTP/log sem token ou senha.
Defeito | ID, severidade, esperado x observado, passos para reproduzir e responsável.
Reteste | Revisão corrigida, data e resultado do novo teste.

## 8. Pacote para encaminhar ao grupo

Entregar este plano preenchido, evidências nomeadas pelo ID do caso, lista de defeitos e resumo com quantidade de casos aprovados, reprovados e bloqueados. Anexar os logs dos testes automatizados executados na revisão validada.

Critério de saída: casos críticos aprovados, regressão principal concluída e pendências explicitamente aceitas. Se houver bloqueio de ambiente ou falta de dados, marque Bloqueado; não registre como aprovado.

Referência: roteiro local de 11/11/2026. Este documento não inventa execução manual nem aprovação de usuários; os resultados técnicos executados estão separados na seção 2.
