import { invoke } from "@tauri-apps/api/core";
import { isTauriRuntime } from "./use-storage-adapter.js";

// Thin wrapper over Tauri `invoke` that:
//  - returns { data, error } tuple so callers can branch without try/catch noise
//  - degrades to a no-op stub when not running inside Tauri (web/PWA)
//  - logs unexpected errors with a consistent prefix
//
// Usage:
//   const { call } = useTauriCommand();
//   const { data, error } = await call("app_info");
export const useTauriCommand = () => {
  const call = async (cmd, args) => {
    if (!isTauriRuntime()) {
      return { data: null, error: "not-running-in-tauri" };
    }
    try {
      const data = await invoke(cmd, args);
      return { data, error: null };
    } catch (err) {
      console.error(`[tauri] command "${cmd}" failed:`, err);
      return { data: null, error: String(err) };
    }
  };

  return { call };
};
