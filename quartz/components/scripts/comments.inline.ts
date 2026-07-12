type WalineInstance = {
  destroy: () => void
}

type WalineModule = {
  init: (options: Record<string, unknown>) => WalineInstance
}

const WALINE_CLIENT_VERSION = "3"
const WALINE_CSS_URL = `https://cdn.jsdelivr.net/npm/@waline/client@${WALINE_CLIENT_VERSION}/dist/waline.css`
const WALINE_JS_URL = `https://cdn.jsdelivr.net/npm/@waline/client@${WALINE_CLIENT_VERSION}/dist/waline.js`

let walineStylesPromise: Promise<void> | null = null

// Resolves once the stylesheet has actually finished loading (not just been appended) —
// init()ing before this resolves causes a flash of unstyled content, since the browser
// doesn't block script execution on a <link rel="stylesheet"> load.
const ensureWalineStyles = (): Promise<void> => {
  if (walineStylesPromise) {
    return walineStylesPromise
  }

  walineStylesPromise = new Promise((resolve, reject) => {
    const stylesheet = document.createElement("link")
    stylesheet.rel = "stylesheet"
    stylesheet.href = WALINE_CSS_URL
    stylesheet.onload = () => resolve()
    stylesheet.onerror = () => reject(new Error("Failed to load Waline stylesheet"))
    document.head.appendChild(stylesheet)
  })

  return walineStylesPromise
}

document.addEventListener("nav", () => {
  const container = document.querySelector("#waline") as HTMLElement | null
  if (!container) {
    return
  }

  // Waline's CDN build is an ES module (`export { init }`), not a UMD global — a plain
  // <script src> tag fails with "Unexpected token 'export'". Dynamic import() over a
  // non-literal URL loads it as a module at runtime without esbuild trying (and failing)
  // to statically bundle an https:// specifier at build time.
  const jsUrl = WALINE_JS_URL
  Promise.all([ensureWalineStyles(), import(/* webpackIgnore: true */ jsUrl)]).then(
    ([, waline]: [void, WalineModule]) => {
      const instance = waline.init({
        el: container,
        serverURL: container.dataset.serverUrl,
        path: window.location.pathname,
        dark: 'html[saved-theme="dark"]',
        lang: container.dataset.lang,
      })
      window.addCleanup(() => instance.destroy())
    },
  )
})
