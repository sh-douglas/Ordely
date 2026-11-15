IMPLEMENTAÇÃO E VALIDAÇÃO • 14/11/2026

# Ordely: permissões, catálogo e financeiro

Grupo Ordely | Carlos Jr, Douglas de Souza, Gabriel Macêdo e Ramon Victor

Registro das alterações no frontend React e backend Express/Prisma, da migração aplicada ao PostgreSQL conectado e dos testes executados nesta entrega.

## 1. O que foi entregue

Área | Comportamento entregue
Permissões | Dois perfis: ADMIN e EMPLOYEE. Equipe e Financeiro exigem administrador na interface e na API.
Funcionários | Administrador cadastra funcionários e altera o acesso entre ativo e Off / desligado. O histórico do cadastro é mantido.
Produtos | Nome único por catálogo, edição mantida e exclusão lógica com confirmação. Pedidos antigos conservam a relação com o produto.
Financeiro | Total vendido, quantidade de pedidos concluídos e vendas por dia. Filtro por intervalo inclusivo de datas.
Banco e acesso | Migração aplicada, cliente Prisma gerado e administrador criado por seed idempotente.

## 2. Identificação e escopo

A implementação usa o modelo atual de uma única loja por banco. Não foi introduzido cadastro de múltiplas lojas. O perfil administrador vale para esta instalação do Ordely. Alterações foram feitas no checkout local; esta entrega não publica o frontend nem reinicia serviços hospedados.

# Regras de acesso e catálogo

## 3. Matriz de permissões

Ação | Visitante | Funcionário | Admin
Cardápio, pedido e rastreamento | Sim | Sim | Sim
Operação de pedidos e catálogo | Não | Sim | Sim
Listar/cadastrar/desativar equipe | Não | Não | Sim
Consultar dashboard financeiro | Não | Não | Sim

Uma conta desativada não consegue fazer login. A API consulta o cadastro em cada requisição autenticada e rejeita tokens já emitidos quando active=false. Contas existentes receberam EMPLOYEE e active=true na migração; o administrador foi criado separadamente.

Novos cadastros pela interface são sempre funcionários. Enviar role=ADMIN no formulário não concede privilégios. Contas de administrador não podem ser desativadas pela tela de equipe, evitando a perda do acesso administrativo.

## 4. Nomes únicos e exclusão

O PostgreSQL aplica um índice único à versão do nome em minúsculas, sem espaços nas extremidades e com sequências de espaços reduzidas a um espaço. Exemplo: “X Burger” e “ x   BURGER ” entram em conflito, inclusive na edição. A regra vale entre categorias; acentos permanecem significativos.

Antes da migração, a consulta de duplicidades encontrou zero grupos conflitantes. O índice também impede duplicações em gravações simultâneas. Se houver conflito, a API retorna HTTP 409.

Excluir preenche deletedAt e define available=false. O produto sai do cardápio e do estoque, não aceita edição ou reativação pelas rotas atuais e não pode compor novos pedidos. O nome permanece reservado, inclusive após exclusão. Não há restauração nesta interface. O histórico mantém os preços registrados nos itens do pedido.

# Financeiro e operação

## 5. Como o total é calculado

Apenas pedidos com status COMPLETED entram no relatório. O valor vem do total gravado no pedido, usando Decimal; não é recalculado com o preço atual dos produtos. Pedidos pendentes, em preparo, prontos e cancelados ficam fora.

O agrupamento usa a data de criação do pedido no horário de São Paulo. Se um pedido for concluído depois, ele passa a compor o dia em que foi criado. Não se trata de conciliação bancária, lucro ou confirmação de pagamento.

O intervalo 14/11/2026 a 15/11/2026 inclui os dois dias: de 14/11 às 00:00 até antes de 16/11 às 00:00. As fronteiras do filtro usam UTC-03; o agrupamento usa America/Sao_Paulo. Períodos históricos com horário de verão não fazem parte da validação desta versão.

Sem filtro, o dashboard mostra todo o período. Sem vendas, mostra total zero e estado vazio. Datas inexistentes, intervalo invertido ou apenas uma data são rejeitados. A tabela exibe somente dias que tiveram vendas.

## 6. Rotas e manutenção

Rota | Regra
GET /auth/employees; POST /auth/signup | Administrador; cadastro padrão EMPLOYEE.
PATCH /auth/employees/:id/status | Administrador; JSON { active: false } ou true.
DELETE /products/:id | Equipe autenticada; exclusão lógica; resposta 204.
GET /finance?from=2026-11-14&to=2026-11-15 | Administrador; total, count, daily, from e to.

Migração: api/prisma/migrations/20261114190000_rbac_finance_products/migration.sql. O índice normalizado é definido em SQL porque usa expressão; deve ser preservado em migrações futuras.

Na pasta api: npm run db:generate; npm run db:migrate; npm run db:seed. O seed usa ADMIN_EMAIL (padrão admin@ordely.local), ADMIN_NAME e ADMIN_PASSWORD (mínimo 12 caracteres para criar). Reexecução preserva a senha; não promove nem reativa silenciosamente uma conta existente.

# Evidências e limites

## 7. Validação executada

Verificação | Resultado
API: npm test | 77 testes aprovados; HTTP com repositórios simulados e verificações dos filtros do repositório.
Frontend: npm test | 30 testes aprovados; interface em jsdom com API simulada.
PostgreSQL: npm run test:db | 1 teste integrado aprovado, com vários asserts. Valida unicidade, edição, defaults, exclusão lógica e fronteiras do financeiro. Dados temporários revertidos.
Compilação | npm run build aprovado na API e no frontend.
Seed | Administrador criado; segunda execução confirmou preservação da senha.
Navegador local | Login real do administrador, navegação em Financeiro e Equipe e financeiro em viewport de celular sem overflow horizontal.

Total: 108 testes automatizados aprovados. O teste integrado usa transação com rollback; sequências numéricas de pedidos podem avançar mesmo com rollback. Nenhum pedido de teste foi mantido.

## 8. Entrega ao grupo

A senha inicial fica em arquivo local separado, ignorado pelo Git, e não consta neste PDF. O plano complementar traz os cenários para execução humana, registro de evidências e relatório de defeitos, seguindo o roteiro anterior de testes funcionais, de uso e de dados.

Ainda dependem da equipe: publicar a revisão, validar o ambiente hospedado e executar a rodada de usabilidade com participantes. Os testes locais e simulados não comprovam que a hospedagem já utiliza esta versão.

Referências locais: api/src, web/src, api/tests, web/src/pages/flows.test.tsx e roteiro anterior output/pdf/ordely-roteiro-testes-funcionais-uso-dados.pdf. Credenciais e dados pessoais dos cadastros não foram incluídos.
