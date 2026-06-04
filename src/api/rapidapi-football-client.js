// Thin fetch wrapper for API-Football via RapidAPI.
// Throws ApiError on non-2xx or on body.errors; caller decides retry/cache.
const BASE_URL = "https://api-football-v1.p.rapidapi.com/v3";
const HOST = "api-football-v1.p.rapidapi.com";

export class ApiError extends Error {
  // body is the parsed JSON response (when available). The RapidAPI proxy
  // returns 403 with `{"message":"You are not subscribed to this API"}`
  // and 429 with rate-limit details — both useful for actionable UI copy.
  constructor(message, { status, body } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export const createRapidApiFootballClient = ({ apiKey, fetchImpl = fetch }) => {
  if (!apiKey) throw new ApiError("Missing apiKey");
  return async (path, params = {}) => {
    const url = new URL(`${BASE_URL}${path}`);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    }
    let res;
    try {
      res = await fetchImpl(url.toString(), {
        method: "GET",
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": HOST,
        },
      });
    } catch (err) {
      // Network error (DNS, offline, CORS). Re-throw as a network-shaped
      // ApiError so the caller can branch on `body.kind === "network"`.
      throw new ApiError("Network error", { body: { kind: "network", cause: err?.message } });
    }
    if (!res.ok) {
      // Try to parse the error body for actionable copy; tolerate
      // non-JSON responses (proxies sometimes return HTML).
      let body = null;
      try {
        body = await res.json();
      } catch {
        body = null;
      }
      throw new ApiError(`API ${res.status}`, { status: res.status, body });
    }
    const body = await res.json();
    if (body?.errors && Object.keys(body.errors).length > 0) {
      throw new ApiError("API errors", { status: res.status, body: body.errors });
    }
    return body;
  };
};

// Maps an ApiError to a user-facing Spanish message. Centralised so the
// composable and the SettingsDialog "Probar conexión" button stay in sync.
export const formatApiError = (err) => {
  if (!err) return "Error desconocido";
  // Network-level failure before any HTTP response.
  if (err?.body?.kind === "network") {
    return "Sin conexión. Verifica tu internet o la configuración de red.";
  }
  const status = err?.status;
  const msg = err?.body?.message || err?.body?.error || "";
  switch (status) {
    case 401:
      return "API key inválida. Verifica la clave en Ajustes → Mundial 2026.";
    case 403:
      // RapidAPI proxy returns 403 for both 'not subscribed' and
      // 'key restricted to other domains' — surface the upstream copy
      // when present so the user sees the real reason.
      if (typeof msg === "string" && msg.toLowerCase().includes("not subscribed")) {
        return "No estás suscrito a API-Football en RapidAPI. Abre https://rapidapi.com/api-sports/api/api-football y suscríbete al plan Free antes de continuar.";
      }
      if (typeof msg === "string" && msg.toLowerCase().includes("restricted")) {
        return "Tu API key está restringida a otros dominios. Agrega este dominio o desactiva la restricción en RapidAPI → Security.";
      }
      return "Acceso denegado (403). Revisa tu subscripción y las restricciones de la key.";
    case 404:
      return "Recurso no encontrado (404). La temporada 2026 puede no estar publicada aún.";
    case 429:
      return "Límite de peticiones alcanzado. Espera unos minutos o actualiza tu plan en RapidAPI.";
    default:
      if (status >= 500) {
        return `El servidor de API-Football está fallando (${status}). Intenta más tarde.`;
      }
      if (msg) return String(msg);
      return err?.message || "Error desconocido";
  }
};
