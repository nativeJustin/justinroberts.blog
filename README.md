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
configured via `wrangler.jsonc`). No GitHub secrets required.
