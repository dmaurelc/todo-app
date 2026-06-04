mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_deep_link::init());

    // Haptics plugin is mobile-only — desktop has no vibration API to wrap.
    // The `mut` is gated on mobile via this cfg block to keep desktop builds warning-free.
    #[cfg(mobile)]
    let builder = builder.plugin(tauri_plugin_haptics::init());

    builder
        .invoke_handler(tauri::generate_handler![
            commands::app_info::app_info,
            commands::storage::get_storage_path,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
