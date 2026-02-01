export function parseGoogleFontName(url: string): string | null {
  try {
    const u = new URL(url)
    const family = u.searchParams.get("family")
    if (!family) return null

    return decodeURIComponent(family.split(":")[0]).replace(/\+/g, " ")
  } catch {
    return null
  }
}

export function loadGoogleFont(url: string) {
  if (document.querySelector(`link[href="${url}"]`)) return

  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = url
  document.head.appendChild(link)
}