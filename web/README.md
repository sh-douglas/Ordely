# Ordely Web

Frontend em React + TypeScript, Vite, Tailwind CSS, Zod, React Router e Axios. Usa a API da pasta `../api`; não contém dados fictícios, contas padrão ou backend alternativo.

## Rodar localmente

Requisitos: Node 24 e npm 11+. Primeiro configure e inicie o PostgreSQL e a API seguindo o README da raiz.

Dentro de `web`:

```sh
cp .env.example .env
npm ci
npm run dev
```

Edite `web/.env` para corresponder à porta da API:

```dotenv
VITE_API_URL=http://localhost:5000
```

Se `api/.env` usa `PORT=3000`, use `VITE_API_URL=http://localhost:3000`. O arquivo local preparado nesta implementação aponta para 3000, mas o exemplo versionado acompanha o padrão 5000 do README da API.

Em `api/.env`, configure:

```dotenv
CORS_ORIGIN=http://localhost:5173
```

Abra **http://localhost:5173**. A API também aceita o alias `http://127.0.0.1:5173` quando `CORS_ORIGIN` aponta para localhost, preservando protocolo e porta. Outros domínios continuam exigindo correspondência exata. A porta 5173 é fixa; se estiver ocupada, encerre o outro processo. Reinicie o Vite depois de editar `.env` e a API depois de alterar seu CORS.

As variáveis `VITE_*` são públicas e incorporadas ao build. Nunca coloque JWT_SECRET, senha do banco ou outras credenciais nelas.

## Telas

| Endereço | Fluxo |
| --- | --- |
| `/` | Cardápio público, busca, categorias, sacola e checkout para retirada. |
| `/acompanhar` | Busca pelo UUID de acompanhamento. |
| `/acompanhar/:code` | Situação, itens, valor e link do pedido; consulta a cada 10 segundos enquanto a aba está visível. |
| `/entrar` | Login dos funcionários. |
| `/painel` | Pedidos ativos, filtros e transições de status; atualização a cada 10 segundos. |
| `/painel/historico` | Pedidos concluídos e cancelados. |
| `/painel/produtos` | Cadastro de produtos e alteração de disponibilidade. |
| `/painel/categorias` | Consulta e cadastro de categorias. |
| `/painel/equipe` | Cadastro de funcionários, apenas com sessão autenticada. |

O primeiro funcionário precisa existir no banco, conforme o procedimento do README da raiz. A API não oferece cadastro inicial público, recuperação de senha, listagem de funcionários, edição geral ou exclusão de produtos; a interface respeita esses limites.

## Comportamento e contratos

- O JWT fica em `sessionStorage`, por sessão/aba, e segue em `Authorization: Bearer`. Ao receber 401 de uma chamada autenticada, a sessão é encerrada. As rotas protegidas conferem `/auth/me` ao restaurar a sessão. A autorização efetiva continua sendo responsabilidade da API.
- A sacola fica em memória: sair do cardápio ou recarregar a página a limpa. Quantidades são agrupadas por produto, com limite de 99 unidades por linha na interface.
- O checkout exige nome, celular com DDD e 11 dígitos e forma de pagamento. A requisição envia IDs e quantidades; o backend calcula os preços e o total. O valor exibido na sacola é estimado.
- Pix/dinheiro/cartão indicam a forma combinada para pagamento na retirada. Não existe cobrança online ou integração com gateway.
- A resposta de criação fornece o `trackingCode`. Guarde o link exibido: não há consulta pública por telefone ou listagem dos pedidos de um cliente.
- O acompanhamento usa polling, sem WebSocket, notificações push ou SMS. Não solicita permissões do navegador.
- A atualização de pedidos respeita o fluxo do backend: recebido → preparo ou cancelamento; preparo → pronto ou cancelamento; pronto → concluído. Cancelamento pede confirmação.
- Preços usam strings decimais no cadastro. A interface aceita vírgula e converte para ponto. Valores em reais são formatados com `Intl.NumberFormat`.
- Imagens são URLs HTTP(S) opcionais; não há upload de arquivos. Produtos sem imagem usam uma ilustração neutra.
- Erros de conexão, validação, autenticação e negócio têm feedback na tela. Não há envio automático repetido de pedidos: se uma resposta se perder na rede após o servidor aceitar a criação, confira com o atendimento antes de reenviar, pois a API ainda não oferece idempotência.

## Validação

```sh
npm test
npm run typecheck
npm run build
npm audit
```

A suíte contém 19 testes com Vitest, Testing Library e jsdom. Confere normalização de dados, valores monetários, contratos Zod, sacola/checkout, login, proteção do painel, pedidos, disponibilidade, cadastros, rastreamento e falhas de conexão. Axios é simulado nesses testes; eles não acessam o banco.

Além da suíte, foi validado no navegador um fluxo real com API e PostgreSQL descartáveis: cardápio → criação de pedido → acompanhamento → login → preparo → pronto → retirada → histórico. Os dados e o banco de teste foram removidos. Layouts público e administrativo foram inspecionados em desktop e viewport reduzida.

`npm run format` formata os arquivos do frontend. `npm run build` produz `dist`. Para inspecionar o build, use `npm run preview`; autorize a origem da porta de preview no CORS da API durante esse teste.

## Estrutura

- `src/lib/api.ts`: cliente Axios, token e mensagens de erro.
- `src/lib/auth.tsx`: estado da sessão e proteção de rotas.
- `src/lib/domain.ts`: contratos, validadores, tipos e formatação.
- `src/lib/hooks.ts`: carregamento/cancelamento, polling e proteção contra envios simultâneos.
- `src/components`: componentes de interface compartilhados.
- `src/pages`: telas públicas e administrativas.
- `src/styles.css`: Tailwind e estilos da identidade visual responsiva.

## Hospedagem futura

O frontend é uma SPA. Configure fallback de todas as rotas para `index.html`, defina `VITE_API_URL` antes do build e autorize a origem HTTPS do frontend no CORS do backend. Esta implementação não publica, não executa push e não provisiona hospedagem.
