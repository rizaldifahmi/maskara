/**
 * HTTP client wrapper around fetch with automatic JWT Authorization header.
 * Reads the token from localStorage so it stays in sync with AuthContext.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export interface FetchOptions extends RequestInit {
  /** Set to false to skip the automatic Authorization header (e.g. login calls). */
  skipAuth?: boolean;
}

/**
 * Subclass of Error that carries the API's error message so callers
 * (Login form, etc.) can display it without duplicating the fallback string.
 */
export class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export async function httpFetch<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth, headers: rawHeaders, ...rest } = options;

  const headers = new Headers(rawHeaders);
  if (!skipAuth) {
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  if (!headers.has("Content-Type") && rest.body) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${BASE_URL}${url}`, { ...rest, headers });

  // On 401, clear the token and surface the API's error message to the caller
  if (res.status === 401) {
    localStorage.removeItem("auth_token");
    const body = await res.json().catch(() => ({ error: "Unauthorized" }));
    throw new HttpError(body.error || "Unauthorized", 401);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new HttpError(body.error || `Request failed: ${res.status}`, res.status);
  }

  return res.json() as Promise<T>;
}

/**
 * Shorthand for GET/POST/PATCH/DELETE that JSON-serializes the body.
 */
export const httpClient = {
  get: <T>(url: string, opts?: FetchOptions) =>
    httpFetch<T>(url, { ...opts, method: "GET" }),
  post: <T>(url: string, body?: unknown, opts?: FetchOptions) =>
    httpFetch<T>(url, {
      ...opts,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T>(url: string, body?: unknown, opts?: FetchOptions) =>
    httpFetch<T>(url, {
      ...opts,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(url: string, body?: unknown, opts?: FetchOptions) =>
    httpFetch<T>(url, {
      ...opts,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(url: string, opts?: FetchOptions) =>
    httpFetch<T>(url, { ...opts, method: "DELETE" }),
};
