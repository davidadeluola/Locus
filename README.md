# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Supabase Keep-Alive Cron

Run a lightweight daily keep-alive worker:

```bash
npm run keepalive:cron
```

Environment variables (optional overrides):

- `SUPABASE_URL` (or `VITE_SUPABASE_URL`)
- `SUPABASE_SERVICE_ROLE_KEY` (preferred) or `SUPABASE_ANON_KEY`
- `KEEPALIVE_CRON` (default: `0 3 * * *`)
- `KEEPALIVE_PING_INTERVAL_SECONDS` (default: `10`)
- `KEEPALIVE_RUN_WINDOW_SECONDS` (default: `60`)
- `KEEPALIVE_TABLE` (default: `classes`)

Example for one daily minute of pings every 10 seconds:

```env
KEEPALIVE_CRON=0 3 * * *
KEEPALIVE_PING_INTERVAL_SECONDS=10
KEEPALIVE_RUN_WINDOW_SECONDS=60
KEEPALIVE_TABLE=classes
```
