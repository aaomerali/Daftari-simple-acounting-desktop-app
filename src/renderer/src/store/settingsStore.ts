import { create } from 'zustand'

interface SettingsState {
  appName: string
  currencyCode: string
  currencySymbol: string
  currencyDecimalPlaces: number
  storeName: string
  fetchSettings: () => Promise<void>
  saveSettings: (settings: Partial<SettingsState>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  appName: 'دفتـــــــري',
  currencyCode: 'SAR',
  currencySymbol: 'ر.س',
  currencyDecimalPlaces: 2,
  storeName: '',
  fetchSettings: async () => {
    // Requires api.dbGet exposed from preload
    const settings = await window.api.dbGet('SELECT * FROM settings LIMIT 1')
    if (settings) {
      set({
        appName: settings.app_name,
        currencyCode: settings.currency_code,
        currencySymbol: settings.currency_symbol,
        currencyDecimalPlaces: settings.currency_decimal_places,
        storeName: settings.store_name
      })
    }
  },
  saveSettings: async (newSettings) => {
    // Generate the SET clause and params based on keys provided
    const keys = Object.keys(newSettings)
    if (keys.length === 0) return

    // map React style camelCase to DB snake_case
    const keyMap: Record<string, string> = {
      appName: 'app_name',
      currencyCode: 'currency_code',
      currencySymbol: 'currency_symbol',
      currencyDecimalPlaces: 'currency_decimal_places',
      storeName: 'store_name'
    }

    const setClauses = keys.map(k => `${keyMap[k]} = ?`).join(', ')
    const values = keys.map(k => newSettings[k as keyof SettingsState])

    await window.api.dbRun(`UPDATE settings SET ${setClauses}`, values)
    set(newSettings)
  }
}))
