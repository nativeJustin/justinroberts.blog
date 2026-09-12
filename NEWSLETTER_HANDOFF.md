# Newsletter and QR handoff

Status as of September 12, 2026: the newsletter and QR implementation is live, and a real
signup successfully delivered the confirmation email through Resend.

## What is built

- Newsletter signup forms across the site and a dedicated `/subscribe` page
- Double opt-in flow handled by the existing Cloudflare Worker
- Cloudflare Turnstile bot protection and a hidden honeypot field
- Resend contact management and confirmation email delivery
- A GitHub Action that creates a Resend broadcast draft when a new Markdown file is added to
  `content/writing/` on `main`; it does not automatically send the broadcast
- A `/share` page with Memoji and plain QR assets for the homepage and subscription page

## Configuration already completed

- Resend sending domain: `updates.justinroberts.blog`
- Resend segment: `Blog Subscribers`
- Cloudflare secrets: `RESEND_API_KEY`, `TURNSTILE_SECRET`, and `SIGNING_SECRET`
- GitHub Actions secret: `RESEND_API_KEY` using the separate draft-generation key
- Public Turnstile site key and Resend segment ID are stored in `wrangler.jsonc` and the workflow

Do not commit any secret values. Cloudflare is configured with `keep_vars: true`, so dashboard
secrets should remain in place during normal deployments.

## Local development

```sh
npm install
npx quartz build --serve
```

The visual UI can be tested locally, but a complete signup requires the Worker environment and
its secrets. Before changing the UI, review:

- `quartz/components/NewsletterSignup.tsx`
- `quartz/components/SubscribeLink.tsx`
- `quartz/components/styles/newsletter.scss`
- `quartz/components/scripts/newsletter.inline.ts`
- `quartz.layout.ts`
- `content/subscribe.md`
- `content/share.md`

## Next session

1. Make the planned UI and placement changes locally.
2. Test desktop and mobile layouts, including keyboard focus, status messages, and dark mode.
3. Click the confirmation link and verify the address appears in the Resend `Blog Subscribers`
   segment if that has not already been checked.
4. Add a temporary test post only when ready to verify draft generation; adding a real new file
   under `content/writing/` on `main` creates a Resend draft.
5. Review the generated broadcast in Resend and send it manually.

Relevant implementation history: PR #13, `Add newsletter subscriptions and QR sharing`.
