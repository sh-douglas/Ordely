# Ordely Web

Frontend do Ordely em React, TypeScript, Vite, Tailwind CSS, React Router, Zod e Axios. Consome a API da pasta `api` e apresenta os fluxos de cliente, funcionário e administrador de uma única loja.

Este guia inclui as alterações de **14/11/2026**: páginas restritas por perfil, desativação/reativação de funcionários, exclusão lógica de produtos, tratamento de nome duplicado e dashboard financeiro. A autorização e a unicidade são garantidas pela API/banco; ocultar um botão ou link não substitui essas verificações.

## Preparar e iniciar

Use Node.js 24.x e npm 11 ou superior. Configure a API, o PostgreSQL, as migrações e o seed do administrador conforme o [README principal](../README.md). Um PostgreSQL já provisionado pode ser usado; Docker é apenas uma opção local.

Dentro de `web`, copie o exemplo se ainda não existir `.env`:

```sh
cp .env.example .env
npm ci
```

Edite `web/.env` para a URL efetiva da API:

```dotenv
VITE_API_URL=http://localhost:5000
```

Em `api/.env`, configure a origem do frontend:

```dotenv
CORS_ORIGIN=http://localhost:5173
```

Com a API em execução, inicie o frontend:

```sh
npm run dev
```

Abra `http://localhost:5173`. A configuração usa porta fixa (`strictPort`); se estiver ocupada, o processo falha. A API também aceita `127.0.0.1` como alias de `localhost`, mantendo protocolo e porta. Reinicie os processos ao alterar as variáveis.

`VITE_API_URL` é incorporada ao build e é pública. Credenciais do banco, JWT e senha do administrador pertencem à configuração privada da API, nunca a variáveis `VITE_*`. Não há usuário ou senha embutidos no frontend: o primeiro administrador é criado com `npm run db:seed` na pasta `api`.

## Telas e permissões

Equipe ativa significa usuário autenticado com `active=true`, seja funcionário ou administrador.

| Endereço | Acesso | Fluxo |
| --- | --- | --- |
| `/` | Público | Cardápio, busca, categorias, sacola e checkout para retirada. |
| `/acompanhar` | Público | Busca pelo UUID de acompanhamento. |
| `/acompanhar/:code` | Público | Status, itens, valor e link do pedido. |
| `/entrar` | Público | Login de funcionário ou administrador ativo. |
| `/painel` | Equipe ativa | Pedidos ativos, filtros, avanço de etapas e cancelamento. |
| `/painel/historico` | Equipe ativa | Pedidos concluídos e cancelados. |
| `/painel/produtos` | Equipe ativa | Cadastro, edição, disponibilidade e exclusão de produtos. |
| `/painel/categorias` | Equipe ativa | Consulta, cadastro e edição de categorias. |
| `/painel/equipe` | Admin ativo | Listagem/cadastro e desativação/reativação de funcionários. |
| `/painel/financeiro` | Admin ativo | Total de vendas concluídas, quantidade de pedidos e vendas diárias com filtro de datas. |
| Outros endereços | Público | Página 404 com caminhos para voltar à aplicação. |

Sem sessão, o acesso a uma rota protegida encaminha para `/entrar`. Para funcionários, os links Equipe e Financeiro ficam ocultos e o acesso direto retorna a `/painel`. A API aplica os mesmos limites e responde `403` quando uma conta ativa não tem perfil administrativo.

## Operação da equipe

### Funcionários

O administrador acessa **Equipe** para cadastrar usuários com nome, e-mail, senha e confirmação. O cadastro cria sempre `EMPLOYEE`; não há seletor de cargo. A lista mostra perfil e status de acesso.

**Desativar acesso** e **Reativar acesso** pedem confirmação. Uma conta Off/desligada mantém seu cadastro, mas não pode fazer login nem usar a API enquanto estiver inativa. Tokens já emitidos são recusados na próxima requisição autenticada; ao receber `401`, o frontend encerra a sessão. Contas admin não oferecem a ação de desativação e são protegidas também na API.

### Produtos e categorias

Em Produtos, **Novo produto** cria um item disponível. **Editar** permite alterar nome, preço, categoria, descrição e URL da imagem. Descrição/imagem vazias são enviadas como `null` para remover o conteúdo. Preço aceita vírgula e é convertido para string decimal com ponto.

Nomes de produtos são únicos entre todas as categorias, ignorando maiúsculas/minúsculas e diferenças de espaços conforme o índice do banco. Acentos são preservados. A regra também vale na edição e para nomes de produtos já excluídos. Em conflito, a API retorna `409` e a tela apresenta mensagem de duplicidade.

**Excluir** pede confirmação e remove o produto do catálogo/estoque por exclusão lógica. Pedidos antigos permanecem vinculados; o nome continua reservado e não existe restauração pela interface. A chave **Disponível/Indisponível** apenas controla a oferta de produtos não excluídos, sem quantidade de estoque.

Categorias permitem cadastro e edição, com nomes únicos; não há ação de exclusão de categorias. Imagens de produtos usam URLs HTTP(S), sem upload.

### Financeiro

Ao abrir Financeiro, o admin vê todo o período. Pode informar **Data inicial** e **Data final**, clicar em **Filtrar período** ou restaurar a consulta geral com **Todo o período**.

A API soma somente pedidos `COMPLETED`, pelo total gravado e **data de criação do pedido**. Pedidos concluídos depois entram no dia em que foram criados. O filtro inclui os dois dias informados. Intervalos sem vendas mostram zero; a tabela contém somente dias com vendas.

O agrupamento usa `America/Sao_Paulo`; os limites do filtro são calculados em UTC-03 fixo, sem ajuste para períodos históricos de horário de verão. O valor mostrado não é lucro, saldo ou pagamento confirmado; não há cobrança online.

## Comportamento do cliente e contratos

- O cliente consulta o cardápio e envia pedidos sem criar conta. O checkout exige nome com pelo menos três caracteres, celular com DDD e 11 dígitos e forma de pagamento.
- A sacola fica em memória e é limpa ao sair do cardápio ou recarregar. A interface limita cada produto a 99 unidades; isso não define um limite equivalente na API.
- A criação envia IDs e quantidades. O backend calcula preços e total com os valores vigentes ao receber o pedido. O total da sacola é estimado; uma mudança de preço não gera uma etapa de reconfirmação.
- Pix, dinheiro, débito e crédito registram a forma combinada para a retirada; não há integração com gateway.
- A resposta de criação inclui `trackingCode`. O cliente deve guardar o link; não há busca pública de pedidos por telefone.
- Acompanhamento e fila ativa consultam a API a cada 10 segundos enquanto a aba está visível. Histórico e financeiro não usam essa atualização periódica. Há botões para atualização/nova tentativa conforme a tela.
- O aviso de pedido pronto aparece na própria tela de acompanhamento. Não há WebSocket, SMS, WhatsApp ou notificações push.
- Pedidos seguem recebido → preparo → pronto → concluído. Cancelamento, com confirmação, é permitido apenas em recebido/preparo. Encerrados não reabrem.
- O histórico usa o preço unitário salvo no pedido, mas consulta o nome atual do produto.
- O JWT fica em `sessionStorage`, por aba/sessão, e segue no cabeçalho `Authorization: Bearer`. A restauração da sessão consulta `/auth/me`; cada requisição protegida é autorizada pela API.
- A interface impede envio simultâneo da mesma ação, mas a API não tem idempotência. Se uma resposta de criação se perder, confira com o atendimento antes de reenviar.
- **Observações/personalizações no pedido ainda não foram implementadas**, embora constem em documentos de requisitos anteriores. Também não há recuperação de senha, troca de perfil na interface ou estoque quantitativo.

## Endpoints usados nas funções adicionadas

| Ação | Requisição |
| --- | --- |
| Restaurar sessão e identificar perfil | `GET /auth/me`, que retorna `role` e `active` além dos dados públicos. |
| Listar equipe | `GET /auth/employees` — admin. |
| Cadastrar funcionário | `POST /auth/signup` — admin; nome, e-mail, senha e confirmação. |
| Alterar acesso | `PATCH /auth/employees/:id/status` — admin; `{ "active": false }` ou `true`. |
| Excluir produto | `DELETE /products/:id` — equipe ativa; sucesso `204` sem corpo. |
| Consultar financeiro | `GET /finance` — admin; opcionalmente `?from=2026-11-14&to=2026-11-15`. |

O financeiro retorna `total` como string decimal, `count`, `from`, `to` e `daily` com data, quantidade e total por dia. Datas inválidas, intervalo invertido ou filtro com apenas uma das datas são recusados pela API.

Os endpoints existentes de cadastro e edição de produtos (`POST /products`, `PATCH /products/:id`) agora podem responder `409` por nome duplicado. A edição/alteração de disponibilidade de produto excluído é recusada. Os contratos completos estão no [README principal](../README.md#contratos-da-api).

## Testes e build

Na pasta `web`:

```sh
npm test
npm run typecheck
npm run build
```

Na execução registrada em **14/11/2026**, os **30 testes de frontend** passaram. A suíte usa Vitest, Testing Library, jsdom e Axios simulado. Inclui validação de dados, sacola/checkout, login, painel, catálogo, acompanhamento, confirmação de exclusão/desativação, bloqueio de páginas administrativas e filtros do financeiro.

A validação conjunta daquela revisão somou **108 testes**: 30 de frontend, 77 de API/repositório e 1 integrado ao PostgreSQL. As suítes da API são executadas em `api` com `npm test` e `npm run test:db`. O teste integrado não faz parte de `npm test` do frontend.

Os builds passaram e houve conferência no navegador local do login do admin, navegação Equipe/Financeiro e layout financeiro em viewport de celular. Isso não comprova homologação da versão hospedada ou teste de usabilidade com participantes.

`npm run format` formata o código do frontend. `npm run build` gera `dist`; `npm run preview` permite inspecionar esse build, com a origem correspondente autorizada no CORS da API.

## Estrutura

- `src/App.tsx`: rotas, layouts e links conforme perfil.
- `src/lib/auth.tsx`: sessão e proteção de páginas, inclusive administrador.
- `src/lib/api.ts`: cliente Axios, token e mensagens de erro.
- `src/lib/domain.ts`: tipos, validadores e formatação.
- `src/lib/hooks.ts`: consultas, polling e controle de ações.
- `src/pages/Management.tsx`: categorias e equipe.
- `src/pages/Inventory.tsx`: produtos, disponibilidade e exclusão.
- `src/pages/Finance.tsx`: consulta financeira e filtro por período.
- `src/pages/Menu.tsx`, `Tracking.tsx`, `Orders.tsx`, `Login.tsx`, `NotFound.tsx`: demais fluxos.
- `src/components/` e `src/styles.css`: componentes e estilos compartilhados.

## Publicação e compatibilidade com a API

O frontend é uma SPA. Na Vercel, configure Root Directory `web`, build `npm run build`, saída `dist` e `VITE_API_URL` com a URL pública da API. Autorize a origem em `CORS_ORIGIN` na API. O arquivo `vercel.json` mantém o fallback para abrir links diretos do React.

A versão atual exige a API com RBAC/financeiro/exclusão e a migração `20261114190000_rbac_finance_products` aplicada. Prepare o banco, crie o administrador com seed e publique/reinicie a API antes de validar o frontend atualizado. **Publicar somente a interface não disponibiliza essas funções.**

Após o deploy, confira login de admin e funcionário, bloqueios por perfil, desativação, nome duplicado, exclusão, financeiro e o fluxo completo de pedido. Registre as revisões de API/frontend e o ambiente usado.

A página 404 visual da SPA pode responder HTTP 200 pelo fallback; os erros HTTP da API são independentes.

## Documentação

- [Instalação, regras e contratos completos](../README.md).
- [Implementação de 14/11/2026](../docs/implementacao-rbac-financeiro-2026-11-14.md).
- [Plano de testes atualizado](../docs/plano-de-testes-2026-11-14.md).
- [Relatório histórico de 11/11/2026](../docs/alteracoes-e-testes-2026-11-11.md): mantém os resultados da versão anterior, sem substituir as regras atuais.

PDFs em `output/pdf/` são entregáveis locais ignorados pelo Git; use os documentos Markdown versionados para consulta em um clone novo.
