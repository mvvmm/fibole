# Deployment

Use Node.js 22.18+ and pnpm. The project pins `cf` to `1.0.0-beta.18` and uses the beta Cloudflare Vite plugin. Configuration lives in `cloudflare.config.ts`.

## Local development

```sh
pnpm install
pnpm db:migrate:local
pnpm dev
```

`cf dev` runs Vite and the local Worker together. `pnpm db:migrate:local` uses `.cloudflare/state` to share D1 with Vite. D1 is local by default; AI calls still use the real Workers AI service. `pnpm cf-typegen` generates runtime and binding declarations in `.cloudflare/types`; `pnpm typecheck` generates these automatically.

## Production

```sh
pnpm build
pnpm exec cf deploy --prebuilt --mode production --dry-run
pnpm deploy
```

Authenticate with `pnpm exec cf auth login` or set `CLOUDFLARE_API_TOKEN`. Production keeps `fibole.com`, the existing D1 database, AI binding, and hourly question-generation cron.

`pnpm db:migrate:prod` applies migrations remotely. `cf d1 migrations apply` targets remote D1 unless `--local` is supplied.

## Previews

```sh
pnpm deploy:preview
pnpm check:app https://<preview-url>
```

The preview name defaults to the Git/CI branch. Run the same command again to redeploy it. `cf previews deploy` builds the app and returns stable branch URLs and unique deployment URLs. cf also writes the Workers Builds output automatically; no output-file wrapper is needed.

Previews share the production question database for the read-only API. They have no custom domain or cron trigger, so preview checks do not generate or modify questions. Fibole currently has no runtime secrets. If one is added, declare it with `bindings.secret()`; cf preserves existing preview secrets on redeployment. Never bind deployment credentials from `.env` into the app.

## Workers Builds

| Setting | Value |
| --- | --- |
| Production build | `pnpm run build` |
| Production deploy | `pnpm run deploy` |
| Preview build | `pnpm run build` |
| Preview deploy | `pnpm run deploy:preview` |

Enable preview builds in the Worker’s build settings. Projects with a legacy non-production trigger must migrate it first:

```sh
pnpm exec cf workers-builds workers migrate-to-previews <worker-script-tag> --deploy-command 'pnpm run deploy:preview'
```

Changing the legacy deploy command alone does not enable Preview reporting in PR comments. Verify `previews_enabled: true` with `cf builds workers get <worker-script-tag>`, then push a commit to trigger a Preview build. Verify both reported URLs with `pnpm check:app <url>` after a fresh preview and after redeployment.

## Checks

```sh
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test:run
pnpm build
```

`pnpm check:app <url>` checks the HTML, built assets, all three daily rounds, API routing, CORS, and SPA fallback without printing answers.
