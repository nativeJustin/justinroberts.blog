import sharp from "sharp"
import { joinSegments, FullSlug } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"
import { BuildCtx } from "../../util/ctx"

export const Favicon: QuartzEmitterPlugin = () => ({
  name: "Favicon",
  async *emit({ argv }) {
    const iconPath = joinSegments(argv.directory, "avatar.png")

    const faviconContent = sharp(iconPath).resize(48, 48).toFormat("png")
    const appleTouchIconContent = sharp(iconPath).resize(180, 180).toFormat("png")
    const safariFavoriteIconContent = sharp(iconPath).resize(512, 512).toFormat("png")
    const safariTouchIconContent = sharp(iconPath).resize(180, 180).toFormat("png")

    yield write({
      ctx: { argv } as BuildCtx,
      slug: "favicon" as FullSlug,
      ext: ".ico",
      content: faviconContent,
    })

    yield write({
      ctx: { argv } as BuildCtx,
      slug: "apple-touch-icon" as FullSlug,
      ext: ".png",
      content: appleTouchIconContent,
    })

    yield write({
      ctx: { argv } as BuildCtx,
      slug: "avatar-icon-v3" as FullSlug,
      ext: ".png",
      content: safariFavoriteIconContent,
    })

    yield write({
      ctx: { argv } as BuildCtx,
      slug: "avatar-touch-icon-v3" as FullSlug,
      ext: ".png",
      content: safariTouchIconContent,
    })
  },
  async *partialEmit() {},
})
