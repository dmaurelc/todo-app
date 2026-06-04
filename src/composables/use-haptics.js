import {
  vibrate,
  impactFeedback,
  notificationFeedback,
  selectionFeedback,
} from "@tauri-apps/plugin-haptics";
import { isTauriRuntime } from "./use-storage-adapter.js";

// Haptic feedback: tap on toggle, success on all-done, selection on tab change.
// All calls are no-op on web/unsupported devices — promise rejections swallowed.
const isTauriMobile = () =>
  isTauriRuntime() &&
  // Plugin is mobile-only on Rust side; the JS import works on desktop but
  // the underlying call throws. We guard by runtime hint only — the try/catch
  // in `safe` catches the desktop error path too.
  true;

const safe = (fn) => async () => {
  if (!isTauriMobile()) return;
  try {
    await fn();
  } catch (err) {
    console.debug("[haptics] suppressed:", err);
  }
};

export const useHaptics = () => ({
  // Light tap — used on todo toggle.
  lightTap: safe(() => impactFeedback("Light")),
  // Success pulse — used on "all tasks done".
  success: safe(() => notificationFeedback("Success")),
  // Selection tick — used on filter/tab change.
  selection: safe(() => selectionFeedback()),
  // Raw vibrate — duration varies by OS (iOS ignores, Android uses ms).
  vibrateMs: (ms) => safe(() => vibrate(ms)),
});
