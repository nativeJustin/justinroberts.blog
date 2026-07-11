import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { FileTrieNode } from "./quartz/util/fileTrie"
import { HomeHighlights } from "./quartz/components/HomeHighlights"
import { BookReviewNote } from "./quartz/components/BookReviewNote"
import { BookMeta } from "./quartz/components/BookMeta"

const explorerFilter = (node: FileTrieNode) =>
  node.slugSegment !== "tags" && node.slugSegment !== "about"

// pages that aren't real posts (homepage, about, book library, folder/tag listings)
// don't get a comment thread
const isCommentablePage = (slug: string) =>
  slug !== "index" &&
  slug !== "about" &&
  !slug.startsWith("books/") &&
  !slug.startsWith("tags/") &&
  !slug.endsWith("/index")

const Comments = Component.Comments({
  provider: "giscus",
  options: {
    repo: "nativeJustin/justinroberts.blog",
    repoId: "R_kgDOTUmAHQ",
    category: "Comments",
    categoryId: "DIC_kwDOTUmAHc4DA78m",
    mapping: "pathname",
  },
})

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.ConditionalRender({
      component: HomeHighlights,
      condition: (page) => page.fileData.slug === "index",
    }),
    BookMeta,
    BookReviewNote,
    Component.ConditionalRender({
      component: Comments,
      condition: (page) => isCommentablePage(page.fileData.slug ?? ""),
    }),
  ],
  footer: Component.Footer({
    links: {
      "About Me": "/about",
      "Contact: hello@justinroberts.blog": "mailto:hello@justinroberts.blog",
      "Subscribe via RSS": "/index.xml",
      "Buy Me a Coffee": "https://buymeacoffee.com/justinroberts",
      GitHub: "https://github.com/nativeJustin",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.ArticleTitle(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer({ filterFn: explorerFilter }),
  ],
  right: [
    Component.ConditionalRender({
      component: Component.Graph(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer({ filterFn: explorerFilter }),
  ],
  right: [],
}
