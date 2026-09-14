# Dashboard Geral

Portal de aplicações internas em Next.js (App Router), TypeScript, Tailwind CSS e Lucide. Sem backend.

## Executar

Requer Node.js 20.9 ou superior.

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

Não foi configurado qualquer deploy.
