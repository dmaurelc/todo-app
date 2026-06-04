import { onOpenUrl, getCurrent } from "@tauri-apps/plugin-deep-link";
import { isTauriRuntime } from "./use-storage-adapter.js";

// Deep-link handler for `todoapp://task/<uuid>` and similar schemes.
// Validates UUID format before invoking the user handler — defends against
// injection from untrusted senders (e.g., another app launching our scheme).
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isValidTaskId = (id) => typeof id === "string" && UUID_RE.test(id);

const parseUrl = (url) => {
  try {
    const u = new URL(url);
    // host is the first path segment for custom schemes like `todoapp://task/<id>`
    const segs = u.pathname.split("/").filter(Boolean);
    return { action: u.host, segments: segs };
  } catch {
    return null;
  }
};

export const useDeepLink = (handler) => {
  if (!isTauriRuntime()) return;

  const dispatch = (urls) => {
    if (!Array.isArray(urls)) return;
    for (const url of urls) {
      const parsed = parseUrl(url);
      if (!parsed) continue;
      if (parsed.action === "task" && parsed.segments[0]) {
        const id = parsed.segments[0];
        if (isValidTaskId(id)) {
          try {
            handler({ action: "task", id });
          } catch (err) {
            console.error("[deep-link] handler threw:", err);
          }
        } else {
          console.warn("[deep-link] rejected non-UUID task id:", id);
        }
      }
    }
  };

  // Cold-start: app was launched by a URL.
  getCurrent()
    .then((urls) => dispatch(urls))
    .catch((err) => console.debug("[deep-link] getCurrent skipped:", err));

  // Warm: app already running, new URL arrives.
  onOpenUrl((urls) => dispatch(urls));
};
