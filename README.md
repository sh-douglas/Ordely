# Ordely

Ordely é uma plataforma de gestão de pedidos que ajuda estabelecimentos a organizar o atendimento, acompanhar pedidos em tempo real e avisar clientes quando estiverem prontos para retirada.

O repositório contém uma API REST com Node.js, TypeScript, Express e Prisma, além do PostgreSQL em Docker. Neste fluxo, **o container executa somente o banco; a API roda na sua máquina**. O frontend React fica em `web` e roda separadamente com Vite. Veja a seção de frontend ao final deste guia.

## 1. Pré-requisitos

Instale Git, Node.js **24.x**, npm **11 ou superior** e Docker com o plugin Docker Compose. Inicie o Docker Desktop ou o serviço Docker antes de continuar.

Confira no terminal:

```sh
git --version
node --version
npm --version
docker --version
docker compose version
docker info
```

Se usar nvm, execute `nvm install` e `nvm use` na raiz do projeto: o arquivo `.nvmrc` seleciona o Node 24.

## 2. Obter o projeto

```sh
git clone https://github.com/sh-douglas/Ordely.git
cd Ordely
```

Se já clonou, abra o terminal na pasta `Ordely`. Os comandos Docker deste guia são executados nessa raiz; os comandos npm, na pasta `api`.

## 3. Configurar os dois arquivos de ambiente

Na raiz, copie os exemplos (não sobrescreva seus `.env` se já estiverem configurados):

```sh
cp .env.example .env
cp api/.env.example api/.env
```

No PowerShell, use `Copy-Item` no lugar de `cp` se necessário. Os arquivos `.env` não são versionados; nunca coloque credenciais reais nos exemplos ou no Git.

### Banco: `.env` da raiz

Abra `.env` em um editor:

```dotenv
POSTGRES_USER=postgres
POSTGRES_PASSWORD=troque_esta_senha_local
POSTGRES_DB=ordely
POSTGRES_PORT=5433
```

| Variável | Significado |
| --- | --- |
| `POSTGRES_USER` | Usuário criado na primeira inicialização do banco. |
| `POSTGRES_PASSWORD` | Senha desse usuário; substitua o exemplo. |
| `POSTGRES_DB` | Nome do banco criado inicialmente. |
| `POSTGRES_PORT` | Porta disponível na sua máquina, publicada para a porta 5432 do container. |

### API: `api/.env`

```dotenv
PORT=5000
DATABASE_URL="postgresql://postgres:troque_esta_senha_local@localhost:5433/ordely?schema=public"
JWT_EXPIRES_IN=1d
JWT_SECRET=cole_aqui_o_segredo_gerado
CORS_ORIGIN=http://localhost:5173
```

- `PORT`: porta HTTP da API.
- `DATABASE_URL`: deve repetir o usuário, senha, porta e banco do `.env` da raiz. Use `localhost` porque a API roda fora do Docker. O arquivo da API não herda automaticamente as variáveis do arquivo da raiz.
- `JWT_SECRET`: gere um segredo, copie o resultado e substitua o valor acima. A aplicação exige pelo menos 16 caracteres; o comando abaixo gera 64 caracteres hexadecimais.
- `JWT_EXPIRES_IN`: aceita `15m`, `30m`, `1h`, `2h`, `12h`, `1d` ou `7d`.
- `CORS_ORIGIN`: origem exata do frontend autorizado, com protocolo e porta, sem caminho ou barra final. `http://localhost:5173` é apenas um exemplo para um frontend local. Requisições sem cabeçalho `Origin`, como curl, também são aceitas.

Gere o segredo JWT:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Na URL, caracteres especiais do usuário e da senha precisam de codificação percentual. Por exemplo, a senha `Minha@Senha` fica `Minha%40Senha` **somente na `DATABASE_URL`**; no `.env` do Docker, mantenha a senha original. Se alterar a porta para `5434`, ajuste a URL para `localhost:5434` também.

## 4. Subir o container PostgreSQL

Na raiz do projeto:

```sh
docker compose up -d --wait
docker compose ps
```

O Compose lê o `.env` da raiz, baixa `postgres:16-alpine` quando necessário, cria o volume persistente e espera o banco ficar saudável. O container se chama `ordely_database`.

Para investigar a inicialização:

```sh
docker compose logs --tail=100 database
```

## 5. Instalar dependências e preparar o banco

Entre na pasta da API e permaneça nela até o fim da próxima seção:

```sh
cd api
npm ci
npm run db:generate
npm run db:migrate
npm run db:check
```

- `npm ci` instala as versões do `package-lock.json`, incluindo as ferramentas de desenvolvimento. Use-o também para recuperar uma instalação incompleta de `node_modules`.
- `db:generate` gera o cliente em `api/src/generated/prisma`, que não é versionado.
- `db:migrate` aplica as migrações já versionadas com `prisma migrate deploy`. Pode ser repetido: migrações já aplicadas não são reaplicadas.
- `db:check` faz uma consulta real e deve imprimir `Database successfully connected!`.

Não é necessário criar uma migração `init`: o projeto já contém as migrações. O `migrate deploy` não gera o cliente, por isso a geração é uma etapa explícita.

## 6. Iniciar e verificar a API

Na pasta `api`:

```sh
npm run dev
```

Esse comando gera o cliente Prisma e inicia a API com reinicialização automática após alterações. A mensagem esperada é `App is running on port 5000.` quando `PORT=5000`.

Em outro terminal:

```sh
curl http://localhost:5000/health
curl http://localhost:5000/products/menu
```

O primeiro retorna `{"status":"Running"}`. O segundo consulta o cardápio, inicialmente vazio. `/health` verifica a resposta HTTP; use `npm run db:check` para verificar o banco. No PowerShell, use `curl.exe` ou `Invoke-RestMethod`.

### Executar o JavaScript compilado

Pare o modo de desenvolvimento com `Ctrl+C` antes de usar a mesma porta:

```sh
npm run typecheck
npm run build
npm start
```

`typecheck` e `build` geram o cliente antes de executar o TypeScript. O build cria `api/dist`; `start` executa `dist/server.js`. Execute esses comandos dentro de `api` para carregar seu `.env`. O container do banco deve continuar em execução.

## 7. Primeiro funcionário e autenticação

O projeto ainda não tem seed automático. `/auth/signup` exige autenticação, então um banco novo precisa de um primeiro funcionário criado manualmente para permitir login.

Para desenvolvimento local, na pasta `api`, gere um hash bcrypt de uma senha temporária (substitua o texto do exemplo):

```sh
node --input-type=module -e "import bcrypt from 'bcrypt'; console.log(await bcrypt.hash('TroqueEstaSenhaLocal123', 12))"
npx prisma studio
```

Abra a URL indicada pelo Studio, selecione o model `Employee` (tabela `employees`) e crie um registro com `name`, `email` e o hash gerado em `passwordHash`. Se o Studio pedir `id`, gere um UUID com `node -e "console.log(require('node:crypto').randomUUID())"`. Preencha `createdAt` e `updatedAt` com a data/hora atual se não forem preenchidos: os padrões definidos pelo Prisma nem sempre são padrões do PostgreSQL. Não grave a senha em texto puro. Encerre o Studio com `Ctrl+C` ao terminar.

Com a API em execução, autentique usando o mesmo e-mail e a senha original:

```sh
curl -X POST http://localhost:5000/auth/signin \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"TroqueEstaSenhaLocal123"}'
```

Use o token retornado no cabeçalho `Authorization: Bearer SEU_TOKEN` das rotas protegidas, incluindo `/auth/me` e `/auth/signup`. Ajuste os dados do exemplo para o funcionário criado.

## Comandos do dia a dia

Na pasta `api`:

| Comando | Uso |
| --- | --- |
| `npm run dev` | Iniciar desenvolvimento com watch. |
| `npm test` | Executar testes HTTP de regressão com repositórios simulados, sem acessar o banco local. |
| `npm run typecheck` | Gerar cliente e verificar tipos sem emitir JavaScript. |
| `npm run build` / `npm start` | Compilar / executar o build. |
| `npm run db:generate` | Regenerar cliente após mudanças no schema ou atualização do Prisma. |
| `npm run db:migrate` | Aplicar migrações existentes. |
| `npm run db:check` | Validar conexão e consulta ao banco. |
| `npx prisma migrate dev --name nome_da_alteracao` | Criar migração após editar o schema, apenas em banco de desenvolvimento; depois execute `npm run db:generate`. |
| `npx prisma studio` | Inspecionar e editar dados locais. |
| `npm audit` | Consultar vulnerabilidades conhecidas, incluindo ferramentas de desenvolvimento. |
| `npm ls --depth=0` | Conferir instalação das dependências diretas. |

As versões de `prisma`, `@prisma/client` e `@prisma/adapter-pg` estão alinhadas. Ao atualizá-las, mantenha esse alinhamento, gere novamente o cliente, valide os tipos e revise o resultado do audit. Versione também o lockfile. Evite `npm audit fix --force` sem revisar as mudanças de compatibilidade.

Consulte a documentação do [Prisma Client](https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/generating-prisma-client) e dos [comandos de migração](https://www.prisma.io/docs/orm/v7/reference/prisma-cli-reference).

### Respostas HTTP

Consultas e atualizações retornam `200`; criações retornam `201`. Entradas inválidas retornam `400`, autenticação ausente ou inválida retorna `401`, origem CORS não permitida retorna `403`, recursos inexistentes retornam `404` e conflitos retornam `409`. Corpos acima do limite retornam `413`; charset ou codificação não suportados retornam `415`. Falhas inesperadas retornam `500`, sem expor detalhes internos.

A alteração de status em `PATCH /orders/:id/status` exige `Authorization: Bearer SEU_TOKEN`, assim como as demais operações de funcionários. IDs de pedidos devem ser inteiros positivos de até 2147483647; IDs de produtos e códigos de acompanhamento devem ser UUIDs válidos.

## Parar e reiniciar

Pare a API com `Ctrl+C`. Na raiz (use `cd ..` se estiver em `api`):

```sh
docker compose stop
# Para retomar:
docker compose up -d --wait
```

`docker compose down` remove o container e a rede, mas preserva os dados no volume. **`docker compose down -v` apaga o banco deste projeto**; só use para descartar seus dados locais intencionalmente. Depois de recriar um volume vazio, aplique as migrações e crie novamente o primeiro funcionário.

## Solução de problemas

| Sintoma | O que conferir |
| --- | --- |
| Docker não conecta / `permission denied` no socket | Inicie o serviço ou Docker Desktop e confira as permissões do seu usuário no Docker. `docker info` deve funcionar antes de subir o banco. |
| Porta do banco ocupada | Altere `POSTGRES_PORT` na raiz e a porta de `DATABASE_URL` na API; recrie o container com `docker compose up -d --wait`. |
| API acusa `EADDRINUSE` | Pare outra instância ou altere `PORT`; ajuste os URLs dos testes. |
| `Invalid environment variables` | Preencha `api/.env`, especialmente `JWT_SECRET`, e execute npm dentro de `api`. Confira os valores aceitos de expiração e as URLs. |
| Prisma não conecta / autenticação falha | Confira `docker compose ps`, logs e a correspondência entre os dois `.env`. A porta externa padrão do exemplo é 5433. |
| Alterar a senha no `.env` não altera o banco | As variáveis `POSTGRES_*` inicializam apenas volumes vazios. Para um banco existente, altere as credenciais no PostgreSQL e sincronize os arquivos; não apague volumes com dados que precise manter. |
| `Cannot find type definition file for 'node'` | Use Node 24 e execute `npm ci` dentro de `api`, sem omitir devDependencies. No editor, selecione o TypeScript instalado no workspace e reinicie o servidor de TypeScript se o erro persistir. |
| Não encontra `generated/prisma/client.js` ou tipos Prisma | Execute `npm run db:generate`; `dev`, `typecheck` e `build` também fazem essa etapa. Não crie os arquivos gerados manualmente. |
| Tabelas inexistentes | Execute `npm run db:migrate` apontando para o banco correto. |
| `Origin is not allowed.` | Ajuste `CORS_ORIGIN` para a origem exata enviada pelo frontend e reinicie a API. |
| Login não funciona em banco novo | Crie o primeiro funcionário conforme a seção de autenticação; não existe seed automático. |


## Frontend React (`web`)

Com banco e API em execução, abra outro terminal na raiz:

```sh
cd web
cp .env.example .env
npm ci
npm run dev
```

Antes de iniciar, ajuste `VITE_API_URL` em `web/.env` para a porta definida por `PORT` em `api/.env` (ex.: `http://localhost:3000` ou `http://localhost:5000`). Use `CORS_ORIGIN=http://localhost:5173` na API e acesse **http://localhost:5173**. Reinicie cada processo após alterar seu arquivo de ambiente. Não sobrescreva um `.env` já configurado.

A interface inclui cardápio, sacola, checkout para retirada, acompanhamento, login e painel com pedidos, histórico, produtos, categorias e cadastro de funcionários. O primeiro funcionário continua sendo criado conforme a seção de autenticação deste guia. O banco começa vazio: categorias e produtos cadastrados no painel passam a aparecer no cardápio.

Consulte [web/README.md](web/README.md) para os contratos, limites e instruções de build. Na pasta `web`, `npm test` executa os 19 testes do frontend e `npm run build` valida os tipos e gera a versão de produção. São suítes separadas dos 50 testes da API.
