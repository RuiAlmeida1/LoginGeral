# Dashboard Geral

Portal de aplicações internas em Next.js (App Router), TypeScript, Tailwind CSS e Lucide. Sem backend.

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

`npm start` e `npm run preview` servem o resultado estático localmente com Wrangler. O desenvolvimento continua a usar `npm run dev`.

## Deploy no Cloudflare Workers

O projeto exporta HTML, CSS e JavaScript para `out/` através de `output: "export"` em `next.config.ts`. `wrangler.jsonc` publica estes assets no Worker `logingeral`. Não utiliza OpenNext nem configuração interativa durante o deploy.

Na integração Git do Cloudflare, usar:

- Comando de build: `npm run build`
- Comando de deploy: `npx wrangler deploy`
- Diretório raiz: raiz do repositório

O Wrangler também executa o build automaticamente quando invocado diretamente. O diretório de publicação é `out/`, nunca `.next/`.

```sh
npm run deploy:check # build e validação do pacote sem publicação
npm run deploy       # requer autenticação Cloudflare
```

As preferências continuam guardadas no navegador. Funcionalidades futuras que exijam um servidor obrigam a rever a exportação estática e a integração Cloudflare.

## Catálogo

Editar `data/apps.ts` para alterar URLs ou acrescentar aplicações. Os URLs `*.exemplo.com` são exemplos e devem ser substituídos pelos endereços reais. Um novo objeto gera automaticamente o cartão, as estatísticas e a categoria do filtro. Usar um `id` único, nome, descrição, URL, ícone Lucide, categoria, estado (`online`, `maintenance`, `offline`) e cor (`blue`, `green`, `purple`). Os links abrem na mesma janela.

O estado é configurado localmente: não existe monitorização da disponibilidade dos sites.

## Funcionalidades

- Pesquisa por nome, descrição e categoria, ignorando acentos e maiúsculas. Atalho `/`.
- Filtros de favoritos e categoria, com estados vazios.
- Favoritos e Light/Dark persistidos em localStorage, sincronizados entre separadores. Se indisponível, utiliza memória durante a sessão.
- Leitura do armazenamento apenas no cliente, com estado inicial estável para hidratação.
- Menu mobile, navegação por teclado e movimento reduzido.
- Configurações de aparência e favoritos. Notificações vazias e logout visual desativado.

## Estrutura e evolução

- `app/`: layout, página e estilos com tokens de tema.
- `components/`: componentes reutilizáveis e orquestração do dashboard.
- `data/apps.ts`: configuração central.
- `types/app.ts`: tipos do catálogo e navegação.
- `hooks/usePreferences.ts`: persistência local e validação de favoritos.

O catálogo pode evoluir para uma camada de dados autenticada e as preferências locais para dados por utilizador. Autenticação, permissões, recentes, estatísticas de utilização, administração e notificações reais não estão implementadas. Futuras permissões devem ser verificadas no servidor.

Documentação: [Next.js Static Exports](https://nextjs.org/docs/app/guides/static-exports) e [Cloudflare Static Assets](https://developers.cloudflare.com/workers/static-assets/).
