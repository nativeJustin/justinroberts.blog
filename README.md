# justinroberts.blog

Personal site, built with [Quartz](https://quartz.jzhao.xyz) v4 and deployed to Cloudflare Workers
(static assets).

## Develop

```sh
npm i
npx quartz build --serve
```

## Deploy

Cloudflare's GitHub integration builds and deploys automatically on every push to `main`
(build command `npx quartz build`, deploy command `npx wrangler deploy`, output directory `public`,
configured via `wrangler.jsonc`).

## Newsletter configuration

The signup form uses the site's Cloudflare Worker for double opt-in subscriptions. Add these
bindings in the Cloudflare dashboard before deploying:

| Name                 | Type     | Purpose                                                      |
| -------------------- | -------- | ------------------------------------------------------------ |
| `RESEND_API_KEY`     | Secret   | Sends confirmations and manages contacts                     |
| `RESEND_SEGMENT_ID`  | Variable | Adds confirmed readers to the newsletter segment             |
| `SIGNING_SECRET`     | Secret   | Signs one-day confirmation links; use a random 32-byte value |
| `TURNSTILE_SECRET`   | Secret   | Verifies Cloudflare Turnstile responses                      |
| `TURNSTILE_SITE_KEY` | Variable | Renders the public Turnstile widget                          |

New posts create draft broadcasts through GitHub Actions. Add `RESEND_API_KEY` as a repository
Actions secret. A separate Resend API key is recommended so the Worker and GitHub Action can be
revoked independently.
