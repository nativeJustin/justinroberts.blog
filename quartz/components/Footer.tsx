import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
// @ts-ignore
import script from "./scripts/footer.inline"

type FooterLink = {
  text: string
  href: string
  ariaLabel?: string
  title?: string
  newTab?: boolean
}

interface Options {
  links: FooterLink[]
  contact?: string
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    return (
      <footer class={`${displayClass ?? ""}`}>
        <nav aria-label="Footer">
          <ul>
            {(opts?.links ?? []).map((link) => (
              <li>
                <a
                  href={link.href}
                  aria-label={link.ariaLabel}
                  title={link.title}
                  target={link.newTab ? "_blank" : undefined}
                  rel={link.newTab ? "noopener noreferrer" : undefined}
                >
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {opts?.contact && (
          <p class="footer-contact">
            <a href={`mailto:${opts.contact}`} class="footer-copy-email" data-email={opts.contact}>
              {opts.contact}
            </a>
          </p>
        )}
      </footer>
    )
  }

  Footer.css = style
  Footer.afterDOMLoaded = script
  return Footer
}) satisfies QuartzComponentConstructor
