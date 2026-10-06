export async function api<T>(
  path: string,
  method = "GET",
  data?: unknown,
): Promise<T> {
  const response = await fetch(`/api/crm/${path}`, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    ...(method !== "GET" ? { body: JSON.stringify(data ?? {}) } : {}),
  });
  const body = await response
    .json()
    .catch(() => ({ error: "Session expired. Reload to sign in." }));
  if (!response.ok)
    throw new Error(
      body && typeof body === "object" && "error" in body
        ? String(body.error)
        : "Request failed",
    );
  return body as T;
}
