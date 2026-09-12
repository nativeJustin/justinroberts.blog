import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { classNames } from "../util/lang"

const SubscribeLink: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => (
  <a
    class={classNames(displayClass, "subscribe-nav-link")}
    href={resolveRelative(fileData.slug!, "subscribe" as FullSlug)}
  >
    Subscribe
  </a>
)

SubscribeLink.css = `
.subscribe-nav-link {
  display: block;
  width: fit-content;
  margin: 0.75rem 0;
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--lightgray);
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
}
`

export default (() => SubscribeLink) satisfies QuartzComponentConstructor
