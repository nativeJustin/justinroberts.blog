import { QuartzComponent, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { FullSlug, resolveRelative } from "../util/path"

export const BookReviewNote: QuartzComponent = ({
  displayClass,
  fileData,
}: QuartzComponentProps) => {
  const isBookPage = fileData.slug?.startsWith("books/") && fileData.slug !== "books/index"
  const review = fileData.frontmatter?.review as FullSlug | undefined
  const reviewed = fileData.frontmatter?.reviewed === true
  if (!isBookPage) {
    return <></>
  }

  if (review) {
    return (
      <p class={classNames(displayClass, "book-review-note")}>
        <a class="internal" href={resolveRelative(fileData.slug!, review)}>
          Read my full review.
        </a>
      </p>
    )
  }

  if (reviewed) {
    return <></>
  }

  return (
    <p class={classNames(displayClass, "book-review-note")}>
      I'm writing full reviews for books going forward. This one was logged before that started, so
      it's tracked here without one.
    </p>
  )
}
