document.addEventListener("nav", () => {
  const links = document.querySelectorAll<HTMLAnchorElement>("a.footer-copy-email")
  for (const link of links) {
    const email = link.dataset.email
    if (!email) continue

    const originalText = link.textContent ?? ""
    function onClick(e: MouseEvent) {
      // let modifier-clicks (open in new tab, etc.) fall through to the mailto: href as normal
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      e.preventDefault()
      navigator.clipboard.writeText(email!).then(
        () => {
          link.textContent = "Copied!"
          setTimeout(() => {
            link.textContent = originalText
          }, 1500)
        },
        (error) => console.error(error),
      )
    }

    link.addEventListener("click", onClick)
    window.addCleanup(() => link.removeEventListener("click", onClick))
  }
})
