interface AssetsBinding {
  fetch(request: Request): Promise<Response>
}

interface Env {
  ASSETS: AssetsBinding
  RESEND_API_KEY: string
  RESEND_SEGMENT_ID: string
  SIGNING_SECRET: string
  TURNSTILE_SECRET: string
  TURNSTILE_SITE_KEY: string
  RESEND_FROM_EMAIL?: string
  RESEND_REPLY_TO?: string
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function encodeBase64Url(value: Uint8Array): string {
  const binary = Array.from(value, (byte) => String.fromCharCode(byte)).join("")
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function decodeBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0))
}

async function signature(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const result = await crypto.subtle.sign("HMAC", key, encoder.encode(payload))
  return encodeBase64Url(new Uint8Array(result))
}

function signaturesMatch(left: string, right: string): boolean {
  if (left.length !== right.length) return false

  let mismatch = 0

  for (let index = 0; index < left.length; index++) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return mismatch === 0
}

async function createConfirmationToken(email: string, secret: string): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 24
  const encodedEmail = encodeBase64Url(encoder.encode(email))
  const signedValue = await signature(`${encodedEmail}.${expires}`, secret)
  return `${encodedEmail}.${expires}.${signedValue}`
}

async function readConfirmationToken(token: string, secret: string): Promise<string | null> {
  const [encodedEmail, expiresValue, suppliedSignature] = token.split(".")
  const expires = Number(expiresValue)

  if (!encodedEmail || !expires || !suppliedSignature || expires < Date.now() / 1000) {
    return null
  }

  const expectedSignature = await signature(`${encodedEmail}.${expires}`, secret)
  if (!signaturesMatch(suppliedSignature, expectedSignature)) return null

  try {
    return decoder.decode(decodeBase64Url(encodedEmail))
  } catch {
    return null
  }
}

async function verifyTurnstile(request: Request, token: string, secret: string): Promise<boolean> {
  const body = new FormData()
  body.set("secret", secret)
  body.set("response", token)

  const remoteIp = request.headers.get("CF-Connecting-IP")
  if (remoteIp) body.set("remoteip", remoteIp)

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  })
  const result = (await response.json()) as {
    success?: boolean
    action?: string
    hostname?: string
  }
  return (
    result.success === true &&
    result.action === "newsletter" &&
    (result.hostname === "justinroberts.blog" || result.hostname === "www.justinroberts.blog")
  )
}

function json(message: string, status = 200): Response {
  return Response.json(
    { message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  )
}

async function sendConfirmation(request: Request, env: Env, email: string): Promise<Response> {
  const token = await createConfirmationToken(email, env.SIGNING_SECRET)
  const confirmationUrl = new URL("/api/confirm", request.url)
  confirmationUrl.searchParams.set("token", token)
  const confirmationLink = confirmationUrl.toString()

  const text = `Hi,

You asked to get new posts from justinroberts.blog by email.

Confirm your email: ${confirmationLink}

This link expires in 24 hours. If you didn't request it, you can ignore this email.

—Justin`

  const html = `<p>Hi,</p>
<p>You asked to get new posts from justinroberts.blog by email.</p>
<p><a href="${confirmationLink}">Confirm my email →</a></p>
<p>This link expires in 24 hours. If you didn’t request it, you can ignore this email.</p>
<p>—Justin</p>`

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL ?? "Justin Roberts <newsletter@updates.justinroberts.blog>",
      reply_to: env.RESEND_REPLY_TO ?? "hello@justinroberts.blog",
      to: [email],
      subject: "Confirm your email for justinroberts.blog",
      text,
      html,
    }),
  })

  if (!response.ok) {
    console.error("Resend confirmation failed", response.status, await response.text())
    return json("Could not send the confirmation email. Please try again.", 502)
  }

  return json("I sent you a confirmation email. Click the link and you’re all set.")
}

async function subscribe(request: Request, env: Env): Promise<Response> {
  if (
    !env.RESEND_API_KEY ||
    !env.RESEND_SEGMENT_ID ||
    !env.SIGNING_SECRET ||
    !env.TURNSTILE_SECRET
  ) {
    return json("Newsletter signup is not configured yet.", 503)
  }

  const form = await request.formData()
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase()
  const website = String(form.get("website") ?? "")
  const turnstileToken = String(form.get("cf-turnstile-response") ?? "")

  if (website) return json("I sent you a confirmation email. Click the link and you’re all set.")
  if (email.length > 254 || !emailPattern.test(email)) {
    return json("Enter a valid email address.", 400)
  }
  if (!(await verifyTurnstile(request, turnstileToken, env.TURNSTILE_SECRET))) {
    return json("Please complete the security check and try again.", 400)
  }

  return sendConfirmation(request, env, email)
}

async function addContact(env: Env, email: string): Promise<boolean> {
  const response = await fetch("https://api.resend.com/contacts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      unsubscribed: false,
      segments: [{ id: env.RESEND_SEGMENT_ID }],
    }),
  })

  if (response.ok) return true

  if (response.status === 409) {
    const contact = encodeURIComponent(email)
    const updateResponse = await fetch(`https://api.resend.com/contacts/${contact}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ unsubscribed: false }),
    })
    const segmentResponse = await fetch(
      `https://api.resend.com/contacts/${contact}/segments/${env.RESEND_SEGMENT_ID}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}` },
      },
    )

    if (updateResponse.ok && (segmentResponse.ok || segmentResponse.status === 409)) return true

    console.error("Resend contact update failed", updateResponse.status, segmentResponse.status)
    return false
  }

  console.error("Resend contact creation failed", response.status, await response.text())
  return false
}

async function confirm(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const token = url.searchParams.get("token") ?? ""
  const email = await readConfirmationToken(token, env.SIGNING_SECRET)
  const destination = new URL("/subscribe", url.origin)

  if (!email) {
    destination.searchParams.set("status", "expired")
    return Response.redirect(destination.toString(), 303)
  }

  if (!(await addContact(env, email))) {
    return new Response("Could not confirm the subscription. Please try again.", {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }

  destination.searchParams.set("status", "confirmed")
  return Response.redirect(destination.toString(), 303)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === "POST" && url.pathname === "/api/subscribe") {
      return subscribe(request, env)
    }
    if (request.method === "GET" && url.pathname === "/api/confirm") {
      return confirm(request, env)
    }
    if (request.method === "GET" && url.pathname === "/api/newsletter-config") {
      if (!env.TURNSTILE_SITE_KEY) return json("Newsletter signup is not configured yet.", 503)
      return Response.json(
        { turnstileSiteKey: env.TURNSTILE_SITE_KEY },
        { headers: { "Cache-Control": "public, max-age=3600" } },
      )
    }

    return env.ASSETS.fetch(request)
  },
}
