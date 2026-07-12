import { FilePath, QUARTZ, joinSegments } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import fs from "fs"
import { glob } from "../../util/glob"
import { dirname } from "path"

export const Static: QuartzEmitterPlugin = () => ({
  name: "Static",
  async *emit({ argv, cfg }) {
    const staticPath = joinSegments(QUARTZ, "static")
    const fps = await glob("**", staticPath, cfg.configuration.ignorePatterns)
    const outputStaticPath = joinSegments(argv.output, "static")
    await fs.promises.mkdir(outputStaticPath, { recursive: true })
    for (const fp of fps) {
      const src = joinSegments(staticPath, fp) as FilePath
      const dest = joinSegments(outputStaticPath, fp) as FilePath
      await fs.promises.mkdir(dirname(dest), { recursive: true })
      await fs.promises.copyFile(src, dest)
      yield dest
    }

    // Cloudflare reads `_headers` from the root of the deployed assets directory,
    // not from `static/` — copy it there directly if present.
    const headersSrc = joinSegments(QUARTZ, "_headers") as FilePath
    if (fs.existsSync(headersSrc)) {
      const headersDest = joinSegments(argv.output, "_headers") as FilePath
      await fs.promises.copyFile(headersSrc, headersDest)
      yield headersDest
    }
  },
  async *partialEmit() {},
})
