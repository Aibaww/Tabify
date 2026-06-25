// Single source of truth for app settings, backed by chrome.storage.local
// under the 'settings' key. Replaces the previous pattern of every
// component reading/writing its own flat storage key (name, timezone,
// timer, focused) independently.

export const DEFAULT_SETTINGS = {
  version: 1,
  general: {
    name: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
  appearance: {
    theme: 'system', // 'light' | 'dark' | 'system'
  },
  focus: {
    timerLength: 30, // minutes
  },
  notifications: {
    enabled: false,
    taskDue: true,
    focusComplete: true,
    dailySummaryReady: true,
  },
  ai: {
    enabled: false,
    provider: 'anthropic',
    apiKey: '',
    autoSummarize: false,
  },
};

const STORAGE_KEY = 'settings';
const LEGACY_KEYS = ['name', 'timezone', 'timer', 'focused'];

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge(base, override) {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return override !== undefined ? override : base;
  }
  const result = { ...base };
  for (const key of Object.keys(override)) {
    result[key] = deepMerge(base[key], override[key]);
  }
  return result;
}

function storageGet(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => resolve(result || {}));
  });
}

function storageSet(items) {
  return new Promise((resolve) => {
    chrome.storage.local.set(items, () => resolve());
  });
}

// Builds an initial settings object out of the legacy flat keys, if present,
// so existing users don't lose their name/timezone/timer/focused on upgrade.
function migrateLegacySettings(legacy) {
  const migrated = {};
  if (legacy.name?.name !== undefined) {
    migrated.general = { name: legacy.name.name };
  }
  if (legacy.timezone !== undefined) {
    migrated.general = { ...migrated.general, timezone: legacy.timezone };
  }
  if (legacy.timer !== undefined) {
    migrated.focus = { timerLength: legacy.timer };
  }
  return migrated;
}

export async function getSettings() {
  const result = await storageGet([STORAGE_KEY, ...LEGACY_KEYS]);
  if (result[STORAGE_KEY] !== undefined) {
    return deepMerge(DEFAULT_SETTINGS, result[STORAGE_KEY]);
  }
  const migrated = deepMerge(DEFAULT_SETTINGS, migrateLegacySettings(result));
  await storageSet({ [STORAGE_KEY]: migrated });
  return migrated;
}

export async function setSettings(partial) {
  const current = await getSettings();
  const next = deepMerge(current, partial);
  await storageSet({ [STORAGE_KEY]: next });
  return next;
}

// Subscribes to live settings changes from any extension context
// (Newtab, Popup, Options, Background). Returns an unsubscribe function.
export function onSettingsChanged(callback) {
  const listener = (changes, areaName) => {
    if (areaName !== 'local' || !changes[STORAGE_KEY]) return;
    callback(deepMerge(DEFAULT_SETTINGS, changes[STORAGE_KEY].newValue));
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
