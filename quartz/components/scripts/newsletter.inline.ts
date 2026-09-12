function showStatus(element: HTMLElement, message: string, state?: "success" | "error") {
  element.textContent = message
  if (state) {
    element.dataset.state = state
  } else {
    delete element.dataset.state
  }
}

type TurnstileApi = {
  render(
    container: HTMLElement,
    options: {
      sitekey: string
      action: string
      theme: "auto"
      size: "flexible"
      callback: () => void
      "error-callback": () => void
      "expired-callback": () => void
    },
  ): string
  reset(widgetId: string): void
  remove(widgetId: string): void
}

let turnstilePromise: Promise<TurnstileApi> | undefined

async function loadTurnstile(): Promise<TurnstileApi> {
  const turnstileWindow = window as typeof window & { turnstile?: TurnstileApi }
  if (turnstileWindow.turnstile) return turnstileWindow.turnstile
  if (turnstilePromise) return turnstilePromise

  turnstilePromise = new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
    script.async = true
    script.defer = true
    script.onload = () => {
      if (turnstileWindow.turnstile) resolve(turnstileWindow.turnstile)
      else reject(new Error("Security check did not load."))
    }
    script.onerror = () => reject(new Error("Security check did not load."))
    document.head.appendChild(script)
  })

  return turnstilePromise
}

async function newsletterConfig(): Promise<{ turnstileSiteKey: string }> {
  const response = await fetch("/api/newsletter-config", {
    headers: { Accept: "application/json" },
  })
  if (!response.ok) throw new Error("Newsletter signup is not configured yet.")
  return response.json()
}

document.addEventListener("nav", async () => {
  const params = new URLSearchParams(window.location.search)
  const confirmationStatus = params.get("status")
  const forms = Array.from(document.querySelectorAll<HTMLFormElement>("form.newsletter-form"))

  if (forms.length === 0) return

  let turnstile: TurnstileApi
  let siteKey: string

  try {
    const [api, config] = await Promise.all([loadTurnstile(), newsletterConfig()])
    turnstile = api
    siteKey = config.turnstileSiteKey
  } catch (error) {
    const message = error instanceof Error ? error.message : "Newsletter signup is unavailable."
    for (const form of forms) {
      const status = form.querySelector<HTMLElement>(".newsletter-status")
      const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')
      if (status) showStatus(status, message, "error")
      if (button) button.disabled = true
    }
    return
  }

  for (const form of forms) {
    const status = form.querySelector<HTMLElement>(".newsletter-status")
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')
    const widget = form.querySelector<HTMLElement>(".newsletter-turnstile")
    if (!status || !button || !widget) continue

    button.disabled = true
    const widgetId = turnstile.render(widget, {
      sitekey: siteKey,
      action: "newsletter",
      theme: "auto",
      size: "flexible",
      callback: () => {
        button.disabled = false
        if (status.dataset.state === "error") showStatus(status, "")
      },
      "error-callback": () => {
        button.disabled = true
        showStatus(status, "Security check failed. Refresh the page and try again.", "error")
      },
      "expired-callback": () => {
        button.disabled = true
        showStatus(status, "Security check expired. Complete it again to subscribe.", "error")
      },
    })

    if (confirmationStatus === "confirmed") {
      showStatus(status, "You’re subscribed. I’ll email you the next time I publish.", "success")
    } else if (confirmationStatus === "expired") {
      showStatus(status, "That confirmation link expired. Enter your email to try again.", "error")
    }

    async function onSubmit(event: SubmitEvent) {
      event.preventDefault()
      button!.disabled = true
      showStatus(status!, "Sending confirmation email…")

      try {
        const response = await fetch(form.action, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        })
        const result = (await response.json()) as { message?: string }

        if (!response.ok) {
          throw new Error(result.message ?? "Could not subscribe right now.")
        }

        form.reset()
        showStatus(
          status!,
          result.message ?? "I sent you a confirmation email. Click the link and you’re all set.",
          "success",
        )
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not subscribe right now."
        showStatus(status!, message, "error")
      } finally {
        turnstile.reset(widgetId)
        button!.disabled = true
      }
    }

    form.addEventListener("submit", onSubmit)
    window.addCleanup(() => {
      form.removeEventListener("submit", onSubmit)
      turnstile.remove(widgetId)
    })
  }
})
