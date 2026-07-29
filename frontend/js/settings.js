/* Inforia — アプリ設定(通知・サウンドなど、フロントエンドのみのモック設定) */

const SETTINGS_KEY = "inforia_settings_v1";

function defaultSettings() {
  return {
    notifications: true,
    sound: true,
  };
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings();
    return { ...defaultSettings(), ...JSON.parse(raw) };
  } catch (e) {
    return defaultSettings();
  }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
