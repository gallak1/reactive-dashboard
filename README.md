# Reactive Dashboard

Aplicação Angular standalone que apresenta um dashboard reativo de usuários. O projeto é um **estudo e uma demonstração de conhecimento técnico avançado em Angular**, com foco em Signals, recursos HTTP, renderização e testes de componentes.

## Objetivo

Demonstrar como combinar estado reativo, carregamento assíncrono e interface declarativa em uma aplicação pequena, mas funcional. Também explora como testar não apenas os valores internos dos componentes, mas o comportamento que o usuário realmente vê no DOM.

## O que a aplicação faz

- Exibe uma lista de usuários com nome e status (ativo ou inativo).
- Apresenta o total de usuários e a quantidade de usuários ativos.
- Permite buscar usuários pelo nome e filtrar somente os ativos.
- Mostra estados de carregamento e erro, com opção para tentar novamente.
- Permite atualizar a lista de usuários por meio de uma nova requisição.
- Redireciona a rota vazia e caminhos desconhecidos para o dashboard.

Os dados são servidos por um endpoint Express de demonstração (`/api/users`), definido no servidor da aplicação. A resposta tem um atraso simulado para facilitar a observação do estado de carregamento.

## Conceitos Angular demonstrados

- **Signals e `computed()`**: o termo da busca e o filtro de usuários ativos são Signals. Métricas e resultados filtrados são derivados reativamente com `computed()`.
- **`httpResource()`**: carrega os usuários e expõe o estado da requisição para a interface.
- **Estados assíncronos**: o template apresenta estados distintos de carregamento, sucesso e erro.
- **Recuperação e atualização**: os botões de nova tentativa e atualização chamam `reload()` para refazer a requisição.
- **Componentes standalone**: o dashboard e a aplicação são definidos sem depender de um `NgModule`.
- **Renderização no servidor**: a aplicação usa Angular SSR e um servidor Express para renderizar as páginas e atender a API.

## Testes

Os testes do dashboard usam `TestBed` para configurar e criar o componente standalone e `HttpTestingController` para controlar as respostas HTTP sem depender de uma API real. Eles verificam:

- criação e atualização da lista e das métricas após uma resposta de sucesso;
- exibição do erro e nova tentativa após uma falha HTTP;
- busca e filtro de usuários;
- estados vazios diferentes para lista sem dados e busca sem resultados;
- atualização dos dados após uma nova requisição.

As verificações consultam o **DOM renderizado** — texto, linhas da tabela, mensagens e alertas — em vez de validar somente propriedades internas da classe. Os testes também sincronizam a resposta assíncrona com `fixture.whenStable()` e chamam `fixture.detectChanges()` para atualizar a view. Isso ajuda a distinguir o estado interno do componente, o momento em que a renderização reflete esse estado e a detecção de mudanças necessária no ciclo de testes.

Execute os testes com:

```bash
npm test
```

## Executar localmente

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm start
```

Abra `http://localhost:4200/`. A aplicação também pode ser acessada por caminhos desconhecidos, que redirecionam para o dashboard.

## Build

Gere o build da aplicação:

```bash
npm run build
```

Os artefatos são gerados em `dist/`.
