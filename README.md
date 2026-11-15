# Ordely

Ordely é uma aplicação web de gerenciamento de pedidos para retirada, desenvolvida para organizar o atendimento do Quiosque do Didi. O cliente consulta o cardápio, monta o pedido e acompanha seu andamento por um link. A equipe administra o catálogo e a fila; o administrador também gerencia acessos e consulta as vendas concluídas.

Este guia descreve o escopo implementado, incluindo as alterações de **14/11/2026**. A aplicação considera **uma loja por banco de dados**. A versão do código não comprova, por si só, a versão publicada na hospedagem.

## Funcionalidades implementadas

| Área | O que está disponível |
| --- | --- |
| Cliente | Cardápio público, busca, categorias, sacola, quantidades e pedido com nome, celular e forma de pagamento. |
| Acompanhamento | Consulta pública pelo UUID/link do pedido, com atualização a cada 10 segundos enquanto a aba está visível e botão de atualização manual. |
| Atendimento | Fila ordenada por criação, filtros por status, avanço de etapas, cancelamento e histórico de pedidos encerrados. |
| Categorias | Consulta, cadastro e edição; nomes únicos. |
| Produtos | Cadastro, edição, disponibilidade, nome único e exclusão lógica com confirmação. |
| Funcionários | Login, listagem, cadastro e desativação/reativação de acesso pelo administrador. |
| Permissões | Perfis `ADMIN` e `EMPLOYEE`, com autorização na API e proteção de páginas na interface. |
| Financeiro | Dashboard exclusivo do administrador com total vendido, quantidade de pedidos concluídos e vendas por dia, com filtro de datas. |
| Navegação | Interface responsiva e página 404 para rotas desconhecidas. |

A forma de pagamento (Pix, dinheiro, débito ou crédito) é uma informação do pedido. O sistema **não processa pagamentos**. O aviso de pedido pronto aparece na tela de acompanhamento; não há envio por WhatsApp, SMS ou push.

## O que foi adicionado em 14/11/2026

- RBAC básico: Equipe e Financeiro restritos a administradores, inclusive nas chamadas diretas à API.
- Campos `role` e `active` em funcionários; status Off/desligado bloqueia login e requisições feitas com tokens existentes enquanto a conta estiver inativa.
- Índice único de nome de produto, considerando maiúsculas/minúsculas e espaços; exclusão lógica com `deletedAt`.
- Relatório financeiro de pedidos concluídos e filtro inclusivo por período.
- Seed idempotente para criar um administrador, sem sobrescrever a senha de uma conta já existente.
- Migração PostgreSQL, testes de permissões/interface e teste integrado de banco com rollback.

Edição de produtos/categorias, listagem da equipe e página 404 já existiam antes dessa atualização. A restrição da equipe ao administrador faz parte da mudança atual.

## Perfis e permissões

Neste guia, **equipe ativa** significa um usuário autenticado com `active=true`, seja `EMPLOYEE` ou `ADMIN`.

| Operação | Visitante | Funcionário ativo | Administrador ativo |
| --- | --- | --- | --- |
| Consultar cardápio, criar pedido e acompanhar por código | Sim | Sim | Sim |
| Consultar fila/histórico e alterar status de pedidos | Não | Sim | Sim |
| Cadastrar/editar categorias e produtos; excluir produtos | Não | Sim | Sim |
| Listar/cadastrar funcionários e desativar/reativar acessos | Não | Não | Sim |
| Consultar Financeiro | Não | Não | Sim |

O cadastro normal cria sempre `EMPLOYEE`. Enviar um campo `role` no cadastro não promove a conta. A interface não oferece troca de perfil. A rota de status da equipe não permite alterar contas `ADMIN`.

A API consulta o cadastro a cada requisição autenticada. Uma conta inativa recebe `401`, mesmo com JWT ainda não expirado; a interface encerra a sessão ao receber essa resposta. Funcionário ativo em rota administrativa recebe `403`. No frontend, os links administrativos ficam ocultos e o acesso direto às páginas restritas retorna ao painel.

## Regras do catálogo, pedidos e financeiro

### Produtos

O nome é único em todo o catálogo, inclusive entre categorias e para produtos excluídos. O índice PostgreSQL compara o nome em minúsculas, remove espaços nas extremidades e reduz sequências de espaços a um espaço. Assim, `X Burger` e ` x   BURGER ` entram em conflito. Acentos continuam significativos. A API retorna `409` em caso de duplicidade no cadastro ou na edição.

Excluir um produto define `deletedAt` e `available=false`: ele sai do cardápio e do estoque, deixa de aceitar edição/alteração de disponibilidade e não pode ser selecionado em novos pedidos. Os vínculos com pedidos antigos permanecem. **O nome continua reservado e não há restauração pela interface.**

Disponibilidade é apenas uma chave de oferta; não representa quantidade em estoque. Imagens são URLs HTTP(S), sem upload. Descrição e imagem podem ser removidas na edição. Preços de cadastro são positivos, com até duas casas decimais.

### Pedidos

O checkout exige nome com pelo menos três caracteres, celular com DDD e 11 dígitos e forma de pagamento. O backend calcula o total com os preços vigentes ao receber o pedido e salva o preço unitário em cada item. Alterações futuras de preço não recalculam pedidos antigos; renomear o produto pode mudar o nome exibido no histórico.

| Estado | Próximos estados permitidos |
| --- | --- |
| `PENDING` — Recebido | `IN_PROGRESS` ou `CANCELED` |
| `IN_PROGRESS` — Em preparo | `READY` ou `CANCELED` |
| `READY` — Pronto para retirar | `COMPLETED` |
| `COMPLETED` — Concluído | Nenhum |
| `CANCELED` — Cancelado | Nenhum |

Cancelamento mantém o pedido no histórico. Pedidos prontos não podem ser cancelados pelas rotas atuais; pedidos encerrados não podem ser reabertos.

### Financeiro

O dashboard soma somente pedidos `COMPLETED`, usando o total gravado no pedido e agrupando pela **data de criação**, não pela data da conclusão. Pedidos pendentes, em preparo, prontos ou cancelados ficam fora. Valores são calculados com `Decimal`.

Sem filtro, mostra todo o período. O filtro exige as duas datas em `YYYY-MM-DD`, com início anterior ou igual ao fim. Por exemplo, `14/11/2026` a `15/11/2026` inclui ambos os dias: de 14/11 às 00:00 até antes de 16/11 às 00:00. Intervalo vazio retorna total zero; a tabela lista somente dias com vendas.

O agrupamento usa `America/Sao_Paulo`; as fronteiras do filtro usam o deslocamento fixo UTC-03. Períodos históricos com horário de verão não são corretamente representados por essa regra fixa. O relatório não representa lucro, saldo bancário, conciliação nem confirmação de pagamento.

## Estrutura e requisitos

- `api/`: Node.js, TypeScript, Express, Prisma, PostgreSQL, Zod, JWT e bcrypt.
- `web/`: React, TypeScript, Vite, Tailwind CSS, React Router e Axios.
- `api/prisma/`: schema, migrações SQL e seed.
- `docs/`: relatórios de implementação e planos de testes.
- `compose.yml`: opção de PostgreSQL local em Docker; o container executa somente o banco.

Use Git, **Node.js 24.x** e **npm 11 ou superior**, conforme os pacotes. Com nvm, execute `nvm install` e `nvm use` na raiz. Docker com Compose é necessário somente se optar pelo banco local; um PostgreSQL já provisionado pode ser usado por `DATABASE_URL`.

## Instalação e configuração

### 1. Obter o projeto

```sh
git clone https://github.com/sh-douglas/Ordely.git
cd Ordely
```

### 2. Configurar a API

Copie o exemplo apenas se ainda não houver configuração local:

```sh
cp api/.env.example api/.env
```

No PowerShell, use `Copy-Item`. Edite `api/.env`:

```dotenv
PORT=5000
DATABASE_URL="postgresql://postgres:SENHA_DO_BANCO@localhost:5433/ordely?schema=public"
JWT_EXPIRES_IN=1d
JWT_SECRET=SUBSTITUA_POR_UM_SEGREDO_ALEATORIO
CORS_ORIGIN=http://localhost:5173
ADMIN_EMAIL=admin@ordely.local
ADMIN_NAME="Administrador Ordely"
ADMIN_PASSWORD=SUBSTITUA_POR_UMA_SENHA_FORTE
```

Os valores de senha e segredo acima são marcadores: substitua-os. Gere um segredo JWT com:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

`JWT_SECRET` exige pelo menos 16 caracteres. `JWT_EXPIRES_IN` aceita `15m`, `30m`, `1h`, `2h`, `12h`, `1d` ou `7d`. `DATABASE_URL` deve começar com `postgresql://` e apontar ao banco desejado; codifique caracteres especiais de usuário/senha na URL.

`CORS_ORIGIN` define a origem do frontend. Para desenvolvimento local, `localhost` e `127.0.0.1` são aliases aceitos, mantendo protocolo e porta. Arquivos `.env` não são versionados e a API não herda automaticamente o `.env` da raiz. Execute os comandos da API dentro de `api`.

### 3. Preparar o PostgreSQL

**Banco já conectado:** use a conexão existente em `api/.env` e avance para as migrações. Não é necessário subir outro PostgreSQL.

**Banco local por Docker:** na raiz, copie `.env.example` para `.env` e configure:

```dotenv
POSTGRES_USER=postgres
POSTGRES_PASSWORD=SENHA_DO_BANCO
POSTGRES_DB=ordely
POSTGRES_PORT=5433
```

Use os mesmos dados na URL da API. Depois:

```sh
docker compose up -d --wait
docker compose ps
```

O Compose usa `postgres:16-alpine`, container `ordely_database` e volume persistente. Para diagnóstico, execute `docker compose logs --tail=100 database`. `docker compose stop` preserva o banco; **`docker compose down -v` apaga o volume e seus dados**.

### 4. Instalar dependências e aplicar migrações

```sh
cd api
npm ci
npm run db:generate
npm run db:migrate
npm run db:check
```

`db:migrate` executa `prisma migrate deploy`, aplicando apenas migrações pendentes. Não precisa criar outra migração `init`. `db:generate` gera o cliente em `src/generated/prisma`; `db:check` consulta o PostgreSQL.

A migração `20261114190000_rbac_finance_products` adiciona `EmployeeRole`, `role`, `active`, `deletedAt`, o índice único de nome e o índice para consultas financeiras. Funcionários preexistentes recebem `EMPLOYEE` e `active=true`; nenhum é promovido automaticamente.

Se houver produtos com nomes equivalentes, a criação do índice único falha em vez de renomear ou apagar dados. Revise os cadastros antes de aplicar em outra base. O índice usa uma expressão SQL e precisa ser preservado em migrações futuras.

### 5. Criar o administrador com seed

Com `api/.env` configurado, ainda na pasta `api`:

```sh
npm run db:seed
```

- Cria uma conta ativa com `role=ADMIN` e senha armazenada como hash bcrypt.
- `ADMIN_PASSWORD` precisa ter pelo menos 12 caracteres para criar a conta; não existe senha padrão.
- Se `ADMIN_EMAIL` for omitido, usa `admin@ordely.local`; se `ADMIN_NAME` for omitido, usa `Administrador Ordely`.
- Repetir com o e-mail de um admin ativo preserva a conta e sua senha; não redefine credenciais.
- Se o e-mail já pertencer a funcionário ou admin inativo, o seed falha sem promover ou reativar a conta.
- Não cria categorias, produtos ou pedidos de demonstração.

O seed lê `api/.env` e variáveis do processo. Um arquivo com outro nome, como `.env.admin.local`, **não é carregado automaticamente**. Após criar a conta, `ADMIN_PASSWORD` pode ser removida da configuração usada pela aplicação.

Entre pela tela `/entrar` com o e-mail e a senha definidos. O administrador cadastra os demais usuários em **Equipe**; esses cadastros recebem `EMPLOYEE`. Não há cadastro público inicial ou recuperação de senha na interface.

### 6. Iniciar API e frontend

Na pasta `api`:

```sh
npm run dev
```

O comando gera o cliente Prisma e inicia a API com watch. Com a porta padrão, verifique:

```sh
curl http://localhost:5000/health
curl http://localhost:5000/products/menu
```

`/health` verifica HTTP, não a conexão com banco. Use `npm run db:check` para isso. No PowerShell, use `curl.exe` ou `Invoke-RestMethod`.

Em outro terminal, a partir da raiz:

```sh
cd web
cp .env.example .env
npm ci
npm run dev
```

Não sobrescreva um `.env` existente. Configure `VITE_API_URL=http://localhost:5000` (ou a URL efetiva da API). Abra `http://localhost:5173`; o Vite usa porta fixa e falha se ela estiver ocupada. Reinicie os processos após alterar variáveis de ambiente. Veja [o guia do frontend](web/README.md).

## Contratos da API

Rotas de equipe e administrador exigem `Authorization: Bearer SEU_TOKEN`. Os perfis e o status ativo são consultados no banco.

| Método e rota | Acesso | Finalidade |
| --- | --- | --- |
| `GET /health` | Público | Estado HTTP da API. |
| `POST /auth/signin` | Público | Login de conta ativa; retorna token e funcionário. |
| `GET /auth/me` | Equipe ativa | Dados do usuário atual. |
| `GET /auth/employees` | Admin | Listagem com perfil e status, sem hash de senha. |
| `POST /auth/signup` | Admin | Cria funcionário; recebe nome, e-mail, senha e confirmação. |
| `PATCH /auth/employees/:id/status` | Admin | Recebe `{ "active": false }` ou `true`; protege contas admin. |
| `GET /categories` | Público | Lista categorias. |
| `POST /categories`; `PATCH /categories/:id` | Equipe ativa | Cadastro e edição de categoria. |
| `GET /products/menu` | Público | Produtos disponíveis e não excluídos. |
| `GET /products/inventory` | Equipe ativa | Produtos não excluídos, inclusive indisponíveis. |
| `POST /products`; `PATCH /products/:id` | Equipe ativa | Cadastro e edição de produto. |
| `PATCH /products/:id/availability` | Equipe ativa | Recebe `{ "available": true }` ou `false`. |
| `DELETE /products/:id` | Equipe ativa | Exclusão lógica, com resposta `204` sem corpo. |
| `POST /orders` | Público | Cria pedido com preços calculados pela API. |
| `GET /orders/track/:trackingCode` | Público | Acompanhamento por UUID, sem login do cliente. |
| `GET /orders`; `GET /orders/history`; `GET /orders/:id` | Equipe ativa | Fila ativa, histórico e consulta individual. |
| `PATCH /orders/:id/status` | Equipe ativa | Recebe `{ "status": "IN_PROGRESS" }`, respeitando as transições. |
| `GET /finance` | Admin | Totais gerais ou filtrados por `from` e `to`. |

Exemplo de filtro: `/finance?from=2026-11-14&to=2026-11-15`. A resposta contém `total` (string decimal), `count`, `from`, `to` e `daily` com `date`, `count` e `total` por dia.

Na edição de produto, `description` e `imageUrl` aceitam `null` para remover o valor; campos omitidos são preservados. IDs de produtos/categorias/funcionários e tracking codes são UUIDs; IDs de pedidos são inteiros positivos até 2147483647.

Consultas/atualizações retornam `200`, criações `201` e exclusão de produto `204`. Erros: `400` para entrada inválida, `401` para autenticação ausente/inválida ou conta inativa, `403` para falta de permissão ou origem CORS não autorizada, `404` para recurso inexistente e `409` para conflito. Falhas inesperadas retornam `500` sem detalhes internos; o parser também trata `413` e `415`.

## Testes e comandos de manutenção

| Pasta | Comando | Uso |
| --- | --- | --- |
| `api` | `npm test` | Testes HTTP e de repositório com banco simulado. |
| `api` | `npm run test:db` | Teste integrado no PostgreSQL configurado, com dados temporários e rollback. |
| `api` | `npm run typecheck` | Gera cliente Prisma e verifica TypeScript. |
| `api` | `npm run build`; `npm start` | Compila em `dist` e inicia `dist/server.js`. |
| `api` | `npm run db:generate`; `npm run db:migrate`; `npm run db:seed`; `npm run db:check` | Cliente, migrações, administrador e verificação de banco. |
| `web` | `npm test` | Testes de interface/domínio com Vitest e API simulada. |
| `web` | `npm run typecheck`; `npm run build` | Verifica tipos e gera o frontend em `dist`. |
| `web` | `npm run preview` | Inspeciona o build local; ajuste CORS para a origem usada. |

Na execução registrada em **14/11/2026**, passaram **77 testes da API/repositório, 30 do frontend e 1 integrado de banco: 108 ao todo**, além dos builds. A contagem é um registro daquela revisão, não percentual de cobertura. Foram verificados login real do administrador, acesso a Equipe/Financeiro e layout financeiro no navegador local.

`test:db` acessa o banco indicado por `DATABASE_URL` e precisa das migrações aplicadas. Reverte os registros de teste, mas sequências de IDs podem avançar. Prefira uma base de teste para reexecuções. `npm test` da API abre uma porta temporária em loopback. Esses resultados não substituem testes de carga, piloto com usuários ou validação da versão hospedada.

Para criar novas migrações em desenvolvimento: `npx prisma migrate dev --name nome_da_alteracao`, seguido de `npm run db:generate`. `npx prisma studio` permite inspecionar dados. Mantenha Prisma Client, CLI e adapter na mesma versão ao atualizar dependências.

## Publicação e atualização de instalações existentes

1. Configurar as variáveis da API para o PostgreSQL de destino.
2. Instalar dependências, gerar o cliente e aplicar as migrações pendentes. A atualização de RBAC/catálogo/financeiro **exige migração**.
3. Configurar e executar o seed para criar o admin necessário; contas anteriores continuam como funcionários.
4. Executar `npm run build` em `api` e iniciar/reiniciar o serviço com `npm start`.
5. Publicar `web` com `VITE_API_URL` apontando à API pública. Na Vercel, usar Root Directory `web`, build `npm run build` e saída `dist`.
6. Autorizar a origem do frontend em `CORS_ORIGIN` e verificar login, perfis, catálogo, fluxo de pedidos e financeiro no ambiente publicado.

`web/vercel.json` contém o fallback das rotas React para `index.html`. A página 404 visual da SPA pode responder HTTP 200; erros da API são independentes. Fazer push do código não comprova que API, migração e frontend já estão publicados na mesma revisão.

## Limites atuais

- Observações/personalizações de pedido previstas no RF3 ainda não foram implementadas.
- Não há pagamento online, contabilidade, gestão financeira completa ou múltiplas lojas isoladas no mesmo banco.
- Não há upload de imagens, estoque quantitativo, restauração de produto excluído, recuperação de senha ou troca de perfil pela interface.
- A sacola fica em memória e é perdida ao sair do cardápio ou recarregar. O limite de 99 unidades por produto é da interface, não um limite máximo definido na API.
- Mudança de preço durante a compra não pede nova confirmação: a API calcula com o valor vigente ao receber o pedido.
- Há trava de envio simultâneo na interface, mas a API não tem idempotência para evitar duplicação após reenvio de requisição.
- O histórico preserva preços, mas não uma cópia do nome original do produto.
- As transições de status são validadas, porém leitura e gravação não usam controle de versão; a proteção contra sobrescrita de status por requisições concorrentes permanece uma melhoria pendente.
- Acompanhamento exige guardar o link/código; não há conta de cliente nem busca pública por telefone.

## Solução de problemas

| Sintoma | O que conferir |
| --- | --- |
| Falha de conexão com o banco | `DATABASE_URL`, credenciais, porta e disponibilidade do PostgreSQL; no Docker, confira `docker compose ps` e os logs. |
| Variáveis de ambiente inválidas | Preencha `api/.env`, especialmente JWT, expiração e origem; execute os comandos dentro de `api`. |
| Cliente Prisma ou tabelas ausentes | Execute `npm run db:generate` e `npm run db:migrate` na API. |
| Migração falha por nome duplicado | Revise produtos que colidem após normalização; a migração não resolve os conflitos automaticamente. |
| Seed exige senha ou recusa e-mail existente | Defina `ADMIN_PASSWORD` com 12 ou mais caracteres para criação; conta existente precisa já ser admin ativo. O seed não redefine senha nem promove funcionários. |
| Login falha em banco novo | Execute o seed e use as credenciais configuradas; não há senha padrão. |
| Funcionário não acessa Equipe/Financeiro | Restrição esperada: esses módulos exigem admin ativo. |
| `Origin is not allowed.` | Ajuste `CORS_ORIGIN` à origem do frontend e reinicie a API. |
| Porta ocupada | Encerre a instância conflitante ou ajuste a configuração e as URLs correspondentes. |
| Senha alterada no `.env` do Docker não funciona | Variáveis `POSTGRES_*` inicializam somente volumes vazios. Alterar o arquivo não muda a senha de uma base existente. |

## Documentação e histórico

- [Implementação de RBAC, catálogo e financeiro — 14/11/2026](docs/implementacao-rbac-financeiro-2026-11-14.md).
- [Plano de testes atualizado — 14/11/2026](docs/plano-de-testes-2026-11-14.md).
- [Guia do frontend](web/README.md).
- [Relatório histórico de alterações e testes — 11/11/2026](docs/alteracoes-e-testes-2026-11-11.md): registra 88 testes e as mudanças daquela data, não o escopo atual.
- [Manual histórico — 11/11/2026](docs/manual-operacao-ordely.md): referência anterior ao RBAC, exclusão e financeiro; os procedimentos atuais são os deste README.

Os PDFs gerados em `output/pdf/` são entregáveis locais ignorados pelo Git; um clone novo não inclui automaticamente esses arquivos. Os textos versionados acima permitem consultar a documentação no repositório. Relatórios históricos preservam seus resultados e limitações de origem.
