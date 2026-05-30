export const DEFAULT_AUTH_REDIRECT_PATH = "/"

export function getSafeRedirectPath(
  candidate: string | null | undefined,
  fallback = DEFAULT_AUTH_REDIRECT_PATH
) {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback
  }

  if (candidate === "/auth" || candidate.startsWith("/auth/")) {
    return fallback
  }

  return candidate
}

