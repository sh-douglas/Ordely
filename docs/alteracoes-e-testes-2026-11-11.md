# Ordely - Alterações e testes

Data: 11/11/2026. Relatório da validação local.

## O que mudou

### Resumo

O Ordely recebeu correção de configuração para links diretos de acompanhamento, lista de funcionários, edição de produtos e categorias e uma página 404 personalizada. As mudanças estão no código local e ainda dependem da publicação do frontend e da API.

### Acompanhar um pedido

Foi adicionado o fallback da Vercel para carregar a aplicação ao abrir um endereço como /acompanhar/:code diretamente. A rota de acompanhamento já existia no React. O comportamento no domínio publicado ainda precisa ser conferido após o deploy.

### Consultar a equipe

No painel, abra Equipe. A lista apresenta nome e e-mail dos funcionários cadastrados, ordenados por nome. Após criar um acesso, a tela solicita a lista atualizada. Senhas e hashes não são enviados na listagem.

### Editar um produto

Abra Produtos, clique em Editar, altere nome, preço, categoria, descrição ou URL da imagem e clique em Salvar produto. O formulário começa com os dados atuais. Preços aceitam vírgula, como 29,90. Apagar a descrição ou a imagem remove o valor salvo. Cancelar fecha o formulário sem enviar alterações.

### Editar uma categoria

Abra Categorias, clique em Editar na categoria desejada, altere o nome e clique em Salvar categoria. O sistema impede usar o nome de outra categoria. Manter o próprio nome é permitido.

### Encontrar o caminho de volta

Endereços desconhecidos exibem a página 404 com a mensagem “Esse endereço saiu do cardápio.” Há links para voltar ao cardápio, acompanhar pedido e acessar a área da equipe, com cabeçalho e rodapé da aplicação.

## Testes das novas funções

### Como ler os resultados

Todos os cenários abaixo foram aprovados em testes automatizados locais. A interface foi exercitada em ambiente simulado, e a API respondeu com repositórios simulados. Isso verifica interações e regras, mas não comprova gravação no banco real nem funcionamento da hospedagem em produção.

### 01 | Ver os funcionários - aprovado

Ao abrir Equipe, o nome e o e-mail retornados aparecem na tela. Na API, a resposta inclui apenas dados públicos do funcionário; o hash da senha é excluído. Consultar a lista sem autenticação é bloqueado.

### 02 | Alterar o preço - aprovado

Ao clicar em Editar, o nome atual aparece preenchido. Trocar o preço para 29,90 e salvar envia 29.90 para o produto correto e mostra confirmação de sucesso. A API encaminha os campos atualizados ao repositório; descrição e imagem vazias são enviadas como null para remoção.

### 03 | Impedir alterações inválidas - aprovado

Preços negativos, zero ou com mais de duas casas decimais são rejeitados pela API. Produto ou categoria inexistente gera resposta de não encontrado. A edição sem autenticação é bloqueada.

### 04 | Renomear uma categoria - aprovado

Editar Lanches para Lanches especiais envia o novo nome para a categoria correta. Na API, manter o próprio nome é aceito; usar o nome de outra categoria é rejeitado. Categoria inexistente e acesso sem autenticação também são tratados.

### 05 | Abrir um endereço desconhecido - aprovado

Os caminhos /pagina-inexistente e /painel/pagina-inexistente exibem a página 404 e os links de saída. Clicar em Acompanhar pedido leva ao formulário para informar o código. Os destinos dos links de cardápio e login foram conferidos.

### 06 | Consultar o acompanhamento - aprovado, com limite

O teste de interface abre uma rota com código de acompanhamento, consulta a API simulada e exibe os itens do pedido. A API também responde à consulta pública por código. Colar o link no domínio real da Vercel não foi testado nesta rodada.

## Regressão e entrega

### 88 testes aprovados

Foram aprovados 25 testes do frontend e 63 testes da API em 11/11/2026. Os builds do frontend e da API também passaram. As suítes cobrem os cenários desta atualização e comportamentos já existentes.

### Fluxos do cliente preservados

Os testes existentes conferem adicionar à sacola, preencher os dados de retirada, enviar o pedido e navegar ao acompanhamento. Também verificam busca sem resultados, telefone inválido, sacola vazia, quantidades inválidas, cálculo do total e mensagens de falha de conexão.

### Fluxos da equipe preservados

A regressão confere login e proteção do painel, cadastro de categoria e funcionário, criação de produto, alteração de disponibilidade, início do preparo e confirmação antes de cancelar. Regras de senha, transições de status e acesso autenticado também são verificadas.

### Publicar a atualização

Publicar a API e o frontend. Na Vercel, usar Root Directory web, preset Vite, build npm run build e saída dist. Configurar VITE_API_URL com a URL pública da API e CORS_ORIGIN com a origem do frontend. Não há nova migração de banco nesta atualização.

### Conferência em produção - ainda pendente

1. Copiar um link de pedido válido, colar em outra aba e atualizar a página.
2. Abrir um endereço desconhecido e usar os links da página 404.
3. Entrar no painel, consultar a equipe e cadastrar um funcionário de teste autorizado.
4. Editar preço e categoria de um produto de teste; recarregar e conferir os dados no painel e no cardápio.
5. Renomear uma categoria de teste e conferir seus produtos.
6. Conferir as telas no celular e no computador; restaurar os dados de teste.

### Rastreabilidade e limites

Testes: web/src/pages/flows.test.tsx, web/src/pages/NotFound.test.tsx, web/src/lib/domain.test.ts, api/tests/http.test.mjs e api/tests/cors.test.mjs. Executar npm test e npm run build em web e api para reproduzir. Os testes HTTP precisam abrir uma porta local. A página 404 da SPA pode ser servida com HTTP 200; os erros 404 da API continuam independentes.

## Contratos adicionados

- `GET /auth/employees`: listagem autenticada, sem senha ou hash.
- `PATCH /products/:id`: atualização parcial; descrição e imagem aceitam `null`.
- `PATCH /categories/:id`: alteração de nome com verificação de duplicidade.

A configuração de links diretos segue a [documentação da Vercel para Vite](https://vercel.com/docs/frameworks/frontend/vite).
