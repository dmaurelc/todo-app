import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { isTauriRuntime } from "./use-storage-adapter.js";

// Local notifications: completed-all-tasks, reminder, etc.
// Degrades to no-op on web (no Tauri runtime).
export const useNotifications = () => {
  const notify = async (title, body) => {
    if (!isTauriRuntime()) return;
    try {
      let granted = await isPermissionGranted();
      if (!granted) {
        const p = await requestPermission();
        granted = p === "granted";
      }
      if (granted) {
        sendNotification({ title, body });
      }
    } catch (err) {
      // Notification errors are non-fatal — never break the UI flow.
      console.warn("[notifications] send failed:", err);
    }
  };

  return { notify };
};
