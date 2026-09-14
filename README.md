# Dashboard Geral

Portal de aplicações internas em Next.js (App Router), TypeScript, Tailwind CSS e Lucide, com autenticação no Cloudflare Worker e persistência D1.

## Executar

Requer Node.js 22 ou superior (incluindo a ferramenta de publicação Cloudflare).

```sh
npm install
npm run dev
```

Abrir http://localhost:3000. Validação e produção:

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

`npm start` e `npm run preview` executam o Worker e o login localmente, em localhost:8787. Antes do primeiro arranque, executar `npx wrangler d1 migrations apply dashboard-geral-auth --local` e, para uma conta local de desenvolvimento, `node scripts/provision-user.mjs`. `npm run dev` é apenas o preview visual Next.js, sem autenticação; não expor esse servidor à Internet.

## Conta e autenticação

- Conta inicial: `rui.almeida@staples.pt`.
- Palavra-passe temporária aleatória, válida durante 48 horas; alteração obrigatória antes de aceder a qualquer asset do dashboard.
- Credenciais iniciais apenas em `.private/`, ignorada pelo Git. Nunca enviar essa pasta nem a servir como assets.
- Hash PBKDF2-SHA256 com salt aleatório e 100 000 iterações, limite do Web Crypto do Workers. Não existem palavras-passe em texto simples na base de dados.
- Sessões opacas de 256 bits, guardadas apenas pelo hash na D1, com cookie `HttpOnly`, `Secure`, `SameSite=Strict`. Validade de 15 minutos no primeiro acesso e 8 horas após a alteração.
- Alterar a palavra-passe exige a atual, confirmação e 12–128 caracteres; invalida as sessões anteriores. Logout revoga a sessão no servidor.
- Todos os assets passam pelo Worker, com `run_worker_first: true`; nenhum acesso sem autenticação ou antes de alterar a palavra-passe temporária. Respostas sem cache.
- Proteção de origem/CSRF e limites persistidos de tentativas por IP e conta.

Para testar, arrancar o Worker local e executar `npm run test:auth`. A suite cria e remove uma conta de teste apenas na D1 local e limpa os limites locais. Não usa as credenciais nem a base de produção.

`node scripts/provision-user.mjs --remote` destina-se apenas à criação inicial; recusa substituir credenciais existentes e não repõe a palavra-passe em deploys. A conta de produção já foi criada. Não existe recuperação automática por email nesta versão.

## Deploy no Cloudflare Workers

O projeto exporta HTML, CSS e JavaScript para `out/` através de `output: "export"` em `next.config.ts`. `worker/index.ts` verifica a sessão antes de servir estes assets. `wrangler.jsonc` publica o Worker `logingeral` com os bindings `ASSETS` e `DB`. Não utiliza OpenNext nem configuração interativa durante o deploy.

Na integração Git do Cloudflare, usar:

- Comando de build: `npm run build`
- Comando de deploy: `npx wrangler deploy`
- Diretório raiz: raiz do repositório

O Wrangler também executa o build automaticamente quando invocado diretamente. O diretório de publicação é `out/`, nunca `.next/`.

```sh
npm run deploy:check # build e validação do pacote sem publicação
npm run deploy       # requer autenticação Cloudflare
```

Aplicar novas migrações com `npx wrangler d1 migrations apply dashboard-geral-auth --remote` antes de publicar código que dependa delas. As preferências continuam guardadas no navegador.

## Catálogo

Editar `data/apps.ts` para alterar URLs ou acrescentar aplicações. Os URLs `*.exemplo.com` são exemplos e devem ser substituídos pelos endereços reais. Um novo objeto gera automaticamente o cartão, as estatísticas e a categoria do filtro. Usar um `id` único, nome, descrição, URL, ícone Lucide, categoria, estado (`online`, `maintenance`, `offline`) e cor (`blue`, `green`, `purple`). Os links abrem na mesma janela.

O estado é configurado localmente: não existe monitorização da disponibilidade dos sites.

## Funcionalidades

- Pesquisa por nome, descrição e categoria, ignorando acentos e maiúsculas. Atalho `/`.
- Filtros de favoritos e categoria, com estados vazios.
- Favoritos e Light/Dark persistidos em localStorage, sincronizados entre separadores. Se indisponível, utiliza memória durante a sessão.
- Leitura do armazenamento apenas no cliente, com estado inicial estável para hidratação.
- Menu mobile, navegação por teclado e movimento reduzido.
- Início com resumo, categorias e atalhos favoritos; Aplicações com catálogo, pesquisa e filtros.
- Configurações de aparência, favoritos e palavra-passe. Logout funcional e notificações vazias.

## Estrutura e evolução

- `app/`: layout, página e estilos com tokens de tema.
- `components/`: componentes reutilizáveis e orquestração do dashboard.
- `data/apps.ts`: configuração central.
- `types/app.ts`: tipos do catálogo e navegação.
- `hooks/usePreferences.ts`: persistência local e validação de favoritos.
- `worker/`: autenticação, sessões e páginas de entrada/alteração de palavra-passe.
- `migrations/`: esquema D1, sem credenciais.
- `scripts/`: criação inicial de conta e testes de integração locais.

O catálogo pode evoluir para uma camada de dados por utilizador. Permissões por função, recentes, estatísticas de utilização, administração e notificações reais não estão implementadas. A autenticação protege este portal; as aplicações externas continuam responsáveis pelo seu próprio controlo de acesso.

Documentação: [Next.js Static Exports](https://nextjs.org/docs/app/guides/static-exports) e [Cloudflare Static Assets](https://developers.cloudflare.com/workers/static-assets/).
