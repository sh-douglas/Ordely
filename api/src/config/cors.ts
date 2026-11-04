/** Allow the configured origin and its exact loopback alias, never other ports or hosts. */
export function allowedOrigins(configuredOrigin: string): Set<string> {
  const url = new URL(configuredOrigin);
  const origins = new Set([url.origin]);

  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
    url.hostname = url.hostname === "localhost" ? "127.0.0.1" : "localhost";
    origins.add(url.origin);
  }

  return origins;
}
