const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "")

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl)
  }

  const runtimeOrigin =
    typeof globalThis.location?.origin === "string" ? globalThis.location.origin : null

  if (runtimeOrigin) {
    return trimTrailingSlash(runtimeOrigin)
  }

  return "http://localhost:3000"
}

export function buildSiteUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${getSiteUrl()}${normalizedPath}`
}
