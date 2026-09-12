import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
// @ts-ignore
import script from "./scripts/newsletter.inline"
import style from "./styles/newsletter.scss"

type Options = {
  variant?: "compact" | "page"
}

export default ((opts?: Options) => {
  const variant = opts?.variant ?? "compact"

  const NewsletterSignup: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    const isPage = variant === "page"

    return (
      <section
        class={classNames(displayClass, "newsletter-signup", `newsletter-signup-${variant}`)}
        aria-label="Email newsletter signup"
      >
        <div class="newsletter-signup-copy">
          <p class="eyebrow">Newsletter</p>
          <h2>{isPage ? "Get new posts by email" : "Get the next post"}</h2>
          <p>
            {isPage
              ? "I’ll email you when I publish something new. No spam, and you can unsubscribe anytime."
              : "I’ll send you an email whenever I publish something new."}
          </p>
        </div>

        <form class="newsletter-form" method="post" action="/api/subscribe">
          <label>
            <span>Email address</span>
            <input
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </label>
          <label class="newsletter-honeypot" aria-hidden="true">
            <span>Website</span>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <div class="newsletter-turnstile" aria-label="Security check"></div>
          <button type="submit">Subscribe</button>
          <p class="newsletter-status" role="status" aria-live="polite"></p>
        </form>
      </section>
    )
  }

  NewsletterSignup.css = style
  NewsletterSignup.afterDOMLoaded = script
  return NewsletterSignup
}) satisfies QuartzComponentConstructor<Options>
