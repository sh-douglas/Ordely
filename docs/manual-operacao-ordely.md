# DOCUMENTAÇÃO DE ACESSO,
OPERAÇÃO E EVOLUÇÃO DO ORDELY

**Projeto:** Ordely – Sistema de Gerenciamento de Pedidos

**Data:** 11/11/2026

**Participantes:** Carlos Jr, Douglas de Souza, Gabriel Macêdo, Ramon Victor

**Versão apresentada:** 1.0.0, conforme os pacotes do repositório; revisão de referência 74a013f. A revisão exata publicada não foi confirmada.

## 1 APRESENTAÇÃO E ESCOPO

O Ordely organiza pedidos para retirada no estabelecimento. O cliente consulta o cardápio, monta a sacola, envia o pedido e acompanha seu andamento. A equipe administra o catálogo, recebe os pedidos e registra as etapas até a retirada.

Esta documentação atende à tarefa 13, reunindo acesso, operação, referência de instalação, limitações e próximos passos. A versão documentada foi conferida no código local. O acesso público também foi verificado no endereço informado pelo responsável; as operações autenticadas não foram executadas em produção nesta revisão.

## 2 ACESSO AO SISTEMA

**Endereço público:** [https://ordely-iota.vercel.app/](https://ordely-iota.vercel.app/)

O uso ocorre pelo navegador e requer internet. Não é necessário instalar a aplicação para consultar o cardápio ou enviar pedidos. A interface possui adaptação para telas menores; não há, nesta entrega, uma matriz de compatibilidade validada por navegador e dispositivo.

Área | Como acessar

Cardápio | Abra o endereço público. O cliente não precisa de conta.

Acompanhamento | Clique em Acompanhar pedido ou abra o link recebido após o envio.

Equipe | Clique em Área da equipe e informe e-mail e senha cadastrados.

Se ainda não tiver acesso ao painel, solicite o cadastro a um funcionário autorizado. Não há cadastro público de funcionários nem recuperação de senha pela interface. A página de login também está disponível em [https://ordely-iota.vercel.app/entrar](https://ordely-iota.vercel.app/entrar).

## 3 OPERAÇÃO DO CLIENTE

### 3.1 Escolher produtos e organizar a sacola

1. Abra o Cardápio. Use o campo de busca ou selecione uma categoria para localizar produtos. Clique em Todos para remover o filtro de categoria.

2. Clique no botão de adição do produto. Em Sua sacola, use + e - para ajustar a quantidade. Reduzir a quantidade a zero remove o item.

3. Confira os itens e o Total estimado. Use Limpar sacola se quiser remover todos os produtos. O limite da interface é de 99 unidades por produto.

**Resultado:** a sacola apresenta os itens escolhidos e o total estimado. Ela fica apenas na memória da página; recarregar ou sair do cardápio apaga seu conteúdo.

### 3.2 Enviar um pedido para retirada

1. Com ao menos um produto na sacola, clique em Continuar pedido.

2. Preencha Seu nome, com pelo menos três caracteres, e Celular com DDD, com 11 dígitos. Selecione Pix, Dinheiro, Cartão de débito ou Cartão de crédito.

3. Confira os dados e clique em Enviar pedido. Aguarde a resposta antes de tentar novamente. O pagamento é combinado na retirada; o site não realiza cobrança.

4. Após a confirmação, confira o número, os itens e o total do pedido na tela de acompanhamento. Clique em Copiar link de acompanhamento e guarde o endereço.

**Resultado:** o pedido é registrado como Recebido. A API calcula o total com os preços vigentes ao receber a solicitação; o valor final pode diferir da estimativa se o catálogo tiver mudado.

### 3.3 Acompanhar e retirar

1. Abra o link salvo ou clique em Acompanhar pedido, informe o Código de acompanhamento e clique em Buscar pedido. O código não é o número curto exibido como identificação do pedido.

2. Observe as etapas Recebido, Em preparo, Pronto para retirar e Concluído. A consulta é atualizada a cada 10 segundos enquanto a aba está visível; o botão Atualizar permite nova consulta manual.

3. Quando aparecer Pronto para retirar, dirija-se ao estabelecimento e combine a retirada e o pagamento com o atendimento.

Se a cópia automática falhar, copie o endereço da barra do navegador. Se o pedido estiver cancelado ou o link tiver sido perdido, procure o atendimento. Não há consulta pública por telefone, alteração do pedido enviado ou cancelamento pelo cliente.

## 4 OPERAÇÃO DA EQUIPE: ATENDIMENTO

### 4.1 Entrar e encerrar a sessão

1. Abra Área da equipe. Informe E-mail e Senha e clique em Entrar no painel.

2. No painel, use as opções Pedidos, Histórico, Produtos, Categorias e Equipe. Ver cardápio abre a área pública.

3. Ao terminar o atendimento, clique no ícone Sair da conta. Se a sessão expirar, entre novamente.

A conta deve existir previamente. A sessão é mantida por aba, no armazenamento de sessão do navegador. Todos os funcionários autenticados possuem acesso às operações do painel; a versão documentada não diferencia cargos ou níveis de permissão.

### 4.2 Receber, preparar e entregar pedidos

1. Abra Pedidos e localize o número do pedido. Confira nome, celular, itens, quantidades, valor e forma de pagamento. Use os filtros de status se necessário.

2. Para um pedido Recebido, clique em Iniciar preparo quando a preparação começar.

3. Quando o pedido estiver pronto, clique em Marcar como pronto. O acompanhamento do cliente passará a indicar a retirada.

4. Depois de entregar o pedido, clique em Confirmar retirada. O pedido passa a Concluído e aparece no Histórico.

Estado atual | Ações permitidas

Recebido | Iniciar preparo ou Cancelar pedido.

Em preparo | Marcar como pronto ou Cancelar pedido.

Pronto para retirar | Confirmar retirada.

Concluído / Cancelado | Consulta no Histórico, sem reabertura pela interface.

**Atualização:** a lista de pedidos ativos consulta os dados a cada 10 segundos enquanto a aba está visível. Use Atualizar para solicitar uma consulta imediata.

### 4.3 Cancelamento e histórico

Em pedidos recebidos ou em preparo, clique em Cancelar pedido. Confirme em Sim, cancelar ou escolha Manter pedido para desistir. O cancelamento não pode ser desfeito pela interface; pedidos prontos não oferecem essa opção.

Em Histórico, consulte pedidos concluídos e cancelados, filtre pela situação e use Atualizar para recarregar a lista. O histórico não usa a mesma atualização periódica dos pedidos ativos. Confirmar retirada registra a etapa operacional, sem comprovar uma transação de pagamento online.

## 5 OPERAÇÃO DA EQUIPE: CATÁLOGO E ACESSOS

### 5.1 Cadastrar e editar categorias

1. Abra Categorias. Em Nova categoria, preencha Nome da categoria com 3 a 50 caracteres e clique em Cadastrar categoria.

2. Para alterar uma categoria, clique em Editar, modifique o nome e selecione Salvar categoria. Cancelar abandona a edição.

3. Confira a confirmação e a lista atualizada. Se o nome já existir, escolha outro.

### 5.2 Cadastrar e editar produtos

1. Cadastre ao menos uma categoria. Em Produtos, clique em Novo produto.

2. Informe Nome, Preço (R$) e Categoria. Nome aceita de 3 a 100 caracteres. O preço deve ser maior que zero e ter até duas casas decimais; a vírgula é aceita, como em 24,90.

3. Se desejar, informe Descrição, com até 150 caracteres, e URL da imagem, usando endereço HTTP ou HTTPS. Não há upload de arquivo.

4. Clique em Salvar produto. O produto recém-cadastrado fica disponível no cardápio. Confira o resultado na lista e na área pública.

5. Para atualizar, clique em Editar no produto, altere os campos e clique em Salvar produto. Apagar descrição ou URL da imagem remove o conteúdo anteriormente salvo.

O preço unitário fica registrado nos itens do pedido no momento da compra. Alterar o preço do produto não recalcula os valores de pedidos anteriores. Os nomes dos produtos, porém, são consultados pelo cadastro atual; renomear um produto pode alterar o nome exibido em pedidos antigos.

### 5.3 Controlar a disponibilidade

Em Produtos, use a chave Disponível/Indisponível. Quando indisponível, o produto deixa de ser oferecido nas novas consultas do cardápio. Um cliente com uma sacola antiga poderá receber uma mensagem de indisponibilidade ao tentar enviar o pedido. Esta chave não controla quantidades em estoque.

### 5.4 Consultar e cadastrar funcionários

1. Abra Equipe. A lista Funcionários cadastrados apresenta nomes e e-mails.

2. Em Cadastrar funcionário, preencha Nome, E-mail, Senha e Confirmar senha. O nome deve ter pelo menos três caracteres e a senha, seis; as senhas devem coincidir.

3. Clique em Criar acesso. Confira a confirmação e a inclusão na lista. A nova conta já pode entrar no painel.

Se o e-mail já estiver cadastrado, utilize a conta existente ou outro endereço válido. A interface não oferece edição, exclusão ou desativação de funcionários, nem troca de senha. Solicite ao responsável técnico o tratamento dessas necessidades.

## 6 SOLUÇÃO DE PROBLEMAS E REFERÊNCIA TÉCNICA

### 6.1 Orientações para situações frequentes

Situação | Orientação

E-mail ou senha incorretos | Confira as credenciais. Se perdeu a senha, procure o responsável técnico; não há recuperação automática.

Sua sessão expirou | Entre novamente antes de executar operações no painel.

Produto ficou indisponível | Revise os itens e atualize o cardápio. Recarregar a página limpa a sacola.

Pedido não encontrado / código inválido | Confira se copiou o link ou o código completo. O número do pedido não substitui o código.

Falha de conexão ao enviar pedido | Antes de reenviar, peça ao atendimento para conferir se o pedido foi criado. Repetir o envio pode duplicá-lo.

Mudança de status recusada | Clique em Atualizar e confira o estado atual. Use apenas a próxima ação disponível.

Página não encontrada | Use os links para voltar ao Cardápio, Acompanhar pedido ou acessar a equipe.

### 6.2 Instalação e manutenção

A instalação não é necessária para o usuário final. O procedimento técnico completo está no [README do repositório](https://github.com/sh-douglas/Ordely/blob/74a013f/README.md). Ele cobre Node.js 24, npm 11 ou superior, Docker, variáveis de ambiente, PostgreSQL, migrações, criação do primeiro funcionário e inicialização da API e do frontend.

No ambiente local descrito pelo projeto, o Docker executa somente o banco. Na raiz, docker compose up -d --wait inicia o PostgreSQL. Na pasta api, npm ci instala as dependências; npm run db:generate gera o cliente; npm run db:migrate aplica as migrações; npm run db:check verifica uma consulta real. Esses comandos devem apontar para o ambiente correto.

Para publicar o frontend na Vercel: diretório web, build npm run build e saída dist. VITE_API_URL deve apontar para a API pública. Na API, CORS_ORIGIN deve autorizar a origem do frontend. O arquivo web/vercel.json fornece o fallback das rotas. A API requer build e execução de dist/server.js, com PostgreSQL acessível e variáveis configuradas.

A rota /health confirma resposta HTTP, mas não comprova conexão com o banco. O provedor da API, a rotina de backup e a estratégia de restauração em produção não foram informados nesta revisão. A manutenção deve preservar o volume do banco; docker compose down -v apaga os dados do ambiente local descrito no README.

## 7 LIMITAÇÕES CONHECIDAS

Os itens abaixo foram identificados no código e nos documentos do repositório. “Não implementado” indica ausência do recurso; “restrição” descreve uma regra da versão; “risco conhecido” indica uma situação possível; “não validado” não equivale a defeito confirmado.

### 7.1 Funcionalidades e restrições

**L01 - Pagamento e entrega:** não há cobrança online, integração com gateway ou fluxo de entrega em endereço. O pedido é para retirada, com pagamento combinado no estabelecimento. Alternativa: realizar pagamento e retirada presencialmente.

**L02 - Sacola temporária:** os itens não são persistidos entre recargas ou saídas do cardápio. Alternativa: concluir a montagem na mesma página; se recarregar, adicionar os itens novamente.

**L03 - Acompanhamento por link:** não há busca pública por telefone, conta do cliente, push ou SMS. A atualização ocorre por consultas periódicas. Alternativa: guardar o link e consultar a tela; sem o link, recorrer ao atendimento.

**L04 - Gestão de acessos:** não há recuperação de senha, desativação pela interface ou divisão de permissões por cargo. Alternativa: restringir o cadastro a pessoas autorizadas e encaminhar ajustes ao responsável técnico.

**L05 - Catálogo:** não há upload de imagens, exclusão de produtos pela interface ou controle quantitativo de estoque. Alternativa: usar URLs de imagens e marcar produtos como indisponíveis.

**L06 - Pedidos encerrados:** a interface não reabre pedidos concluídos ou cancelados, não cancela pedidos prontos e não edita itens de um pedido enviado. Alternativa: tratar a ocorrência com o atendimento e registrar novo pedido quando necessário.

### 7.2 Riscos conhecidos e verificações pendentes

**L07 - Reenvio após falha de rede:** a API não possui mecanismo de idempotência para evitar repetição da mesma criação. Se a resposta se perder após gravar o pedido, reenviar pode duplicá-lo. Alternativa: confirmar o recebimento com a equipe antes de tentar novamente.

**L08 - Nome histórico do produto:** os pedidos guardam o preço unitário, mas consultam o nome atual do produto. Renomeações podem mudar o texto de pedidos anteriores. Não há restauração automática do nome original.

**L09 - Validação de produção:** não foram conferidos login válido, gravação de pedidos, edições autenticadas, link de um pedido real, compatibilidade entre navegadores, backup e restauração. A revisão exata publicada também permanece sem confirmação. Esses itens exigem evidência própria.

## 8 PRÓXIMOS PASSOS PRIORIZADOS

As prioridades abaixo são propostas para a equipe, sem compromisso de prazo ou atribuição individual. P1 indica ações prioritárias; P2, melhorias após a validação da operação; P3, expansão a avaliar. Os critérios descrevem como reconhecer a conclusão de cada ação.

### 8.1 Prioridade P1

**A01 - Confirmar a versão e validar a operação publicada.** Registrar a revisão de frontend e API e executar um fluxo controlado de pedido, preparo, retirada e histórico, além de cadastro e edição. Dependências: acesso autorizado e dados de teste acordados. Conclusão: resultados registrados, correspondência entre versão e manual confirmada e falhas impeditivas tratadas. Relaciona-se a L09.

**A02 - Evitar pedidos duplicados por reenvio.** Implementar identificação única da tentativa e tratamento de repetição. Dependências: contrato da API e persistência no banco. Conclusão: repetir a mesma tentativa, inclusive após perda de resposta, retorna o mesmo pedido sem criar outro. Relaciona-se a L07.

**A03 - Formalizar recuperação operacional.** Identificar responsáveis, hospedagem da API, política de backup e procedimento de restauração. Dependências: acesso administrativo à infraestrutura. Conclusão: backup e restauração verificados em ambiente isolado, com procedimento e data registrados. Relaciona-se a L09.

### 8.2 Prioridade P2

**A04 - Melhorar a gestão de acessos.** Definir recuperação de senha, desativação e permissões por função. Conclusão: uma conta desativada deixa de operar e cada perfil só executa ações permitidas, com testes cobrindo os bloqueios. Relaciona-se a L04.

**A05 - Preservar o histórico e a sacola.** Guardar o nome do produto no item do pedido e avaliar persistência da sacola com revalidação de preço e disponibilidade. Conclusão: renomear o catálogo não altera o nome histórico e recarregar preserva uma sacola válida. Relaciona-se a L02 e L08.

**A06 - Ampliar testes de uso e integração.** Observar usuários externos ao desenvolvimento e testar frontend, API e banco em conjunto. Conclusão: cenários, ambientes, dificuldades e resultados documentados, com correções verificadas. Relaciona-se a L09.

### 8.3 Prioridade P3

**A07 - Avaliar expansão funcional.** Investigar notificações, upload de imagens, estoque e pagamento online conforme a necessidade do estabelecimento. Dependências: decisão de produto e serviços externos, quando aplicável. Conclusão: escopo e critérios aprovados antes da implementação. Relaciona-se a L01, L03 e L05.

## 9 VALIDAÇÃO E CONTROLE DA DOCUMENTAÇÃO

### 9.1 Verificações realizadas em 11/11/2026

O conteúdo foi confrontado com as telas implementadas, rotas, validadores, regras de status e persistência do repositório na revisão 74a013f. Os nomes das ações do manual correspondem aos textos existentes nessa base.

Verificação | Resultado e alcance

Frontend: npm test | 25 testes aprovados. Interface e regras locais, com Axios simulado.

API: npm test | 63 testes aprovados. HTTP e regras com repositórios simulados; não acessam o banco real.

Builds de web e api | Aprovados por npm run build nas duas pastas.

Consulta ao site publicado | Cardápio carregado com produtos e categorias; formulário de acompanhamento e tela de login acessíveis. Recarregar /entrar preservou a tela correta.

Revisão editorial | Conteúdo organizado por perfil e procedimento; PDF conferido visualmente, sem capturas de tela do sistema.

A primeira tentativa dos testes HTTP foi impedida pela restrição do ambiente para abrir uma porta local. A execução com essa permissão foi concluída com 63 aprovações. Esse impedimento não foi classificado como defeito do Ordely.

### 9.2 Alcance da entrega e pendências

Este documento entrega o manual de acesso e operação, a referência técnica, as limitações e o plano de evolução. Os 88 testes locais aprovados não substituem uma validação completa em produção. A consulta ao site foi pública, sem criação de pedidos ou alteração de dados.

Permanecem pendentes a revisão do manual por uma pessoa externa à redação, a confirmação da revisão publicada e a validação autenticada descrita em A01. Não há evidência para declarar esses itens concluídos. A equipe pode usar o documento imediatamente como referência da base identificada, registrando diferenças encontradas na versão publicada.

### 9.3 Manutenção do manual

Ao publicar mudanças, atualizar a identificação da versão, os procedimentos afetados, as limitações e o resultado dos testes. Registrar o responsável pela revisão e a data. A identificação 1.0.0 foi obtida dos arquivos package.json; ela não comprova, isoladamente, qual commit está hospedado.

## 10 REFERÊNCIAS E RASTREABILIDADE

Fontes consultadas em 11/11/2026. Os arquivos foram lidos no repositório local; os links abaixo apontam para a revisão usada como referência. O acesso aos arquivos no GitHub depende das permissões do repositório.

**Sistema publicado.** Endereço fornecido pelo responsável; consulta pública realizada nesta revisão.
[Sistema publicado - consultar fonte](https://ordely-iota.vercel.app/)

**README principal.** Instalação, ambiente, banco, primeiro funcionário e publicação.
[README principal - consultar fonte](https://github.com/sh-douglas/Ordely/blob/74a013f/README.md)

**README do frontend.** Rotas, contratos, comportamento e limitações.
[README do frontend - consultar fonte](https://github.com/sh-douglas/Ordely/blob/74a013f/web/README.md)

**Relatório anterior de alterações e testes.** Contexto da atualização de catálogo, equipe e página 404.
[Relatório anterior de alterações e testes - consultar fonte](https://github.com/sh-douglas/Ordely/blob/74a013f/docs/alteracoes-e-testes-2026-11-11.md)

### 10.1 Arquivos que sustentam os procedimentos

**Cliente:** web/src/pages/Menu.tsx e Tracking.tsx; web/src/lib/domain.ts.
**Equipe:** web/src/pages/Login.tsx, Orders.tsx, Inventory.tsx e Management.tsx; web/src/App.tsx.
**Regras e dados:** api/src/services/order-service.ts; api/src/repositories/order-repository.ts; api/prisma/schema.prisma.
**Acesso e mensagens:** api/src/routes/auth-routes.ts; web/src/lib/auth.tsx, api.ts e hooks.ts.

### 10.2 Evidências automatizadas

Frontend: web/src/pages/flows.test.tsx, web/src/pages/NotFound.test.tsx e web/src/lib/domain.test.ts. API: api/tests/http.test.mjs e api/tests/cors.test.mjs. Reexecução: npm test em web e api. Verificação de compilação: npm run build em cada pasta.

### 10.3 Identificação editorial

Documento: manual de acesso, operação e evolução do Ordely.
Revisão documental: 1, de 11/11/2026.
Participantes do projeto: Carlos Jr, Douglas de Souza, Gabriel Macêdo e Ramon Victor.
Base técnica: pacotes 1.0.0, commit 74a013f.
Apresentação: A4, fonte serifada 12, espaçamento 1,5, margens superior/esquerda de 3 cm e inferior/direita de 2 cm. Formatação próxima da ABNT, sem declaração de conformidade integral.
