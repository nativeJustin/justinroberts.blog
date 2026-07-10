# justinroberts.blog

Personal site, built with [Quartz](https://quartz.jzhao.xyz) v4 and deployed to Cloudflare Pages.

## Develop

```sh
npm i
npx quartz build --serve
```

## Deploy

Pushes to `main` build the site and deploy it to Cloudflare Pages via GitHub Actions
(`.github/workflows/deploy.yaml`). Requires the following repo secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
