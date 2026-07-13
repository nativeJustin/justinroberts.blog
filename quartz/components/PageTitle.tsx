import { pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"

const PageTitle: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
  const title = cfg?.pageTitle ?? i18n(cfg.locale).propertyDefaults.title
  const baseDir = pathToRoot(fileData.slug!)
  return (
    <h2 class={classNames(displayClass, "page-title")}>
      <a href={baseDir}>{title}</a>
    </h2>
  )
}

PageTitle.css = `
.page-title {
  font-size: 1.75rem;
  margin: 0;
  font-family: var(--titleFont);
}

/* base.scss sets text-wrap: pretty on all <a> tags for prose readability;
   since white-space is a shorthand that includes text-wrap, that rule
   (an explicit declaration on the anchor itself) wins over inheriting
   nowrap from .page-title, so it has to be overridden here directly. */
.page-title a {
  white-space: nowrap;
}

@media all and (max-width: 800px) {
  .page-title {
    font-size: 1.2rem;
  }
}
`

export default (() => PageTitle) satisfies QuartzComponentConstructor
