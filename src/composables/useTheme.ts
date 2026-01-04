import { ref, computed, watch, onMounted } from 'vue'

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system'
export type AccentColor = 'green' | 'blue' | 'purple' | 'orange' | 'teal'
export type FontFamily = 'vazir' | 'iransans' | 'peyda'
export type Language = 'fa' | 'en'

export interface ThemePreferences {
  mode: ThemeMode
  accentColor: AccentColor
  fontFamily: FontFamily
  language: Language
  reducedMotion: boolean
  compactMode: boolean
}

export interface UserPreferences extends ThemePreferences {
  sidebarCollapsed: boolean
  notificationsEnabled: boolean
  soundEnabled: boolean
}

const STORAGE_KEY = 'app_user_preferences'

// Default preferences
const defaultPreferences: UserPreferences = {
  mode: 'light',
  accentColor: 'green',
  fontFamily: 'vazir',
  language: 'fa',
  reducedMotion: false,
  compactMode: false,
  sidebarCollapsed: false,
  notificationsEnabled: true,
  soundEnabled: true,
}

// Accent color palettes
export const accentColors: Record<AccentColor, { primary: string; light: string; dark: string; rgb: string }> = {
  green: {
    primary: '#4caf50',
    light: '#e8f5e9',
    dark: '#2e7d32',
    rgb: '76, 175, 80'
  },
  blue: {
    primary: '#2196f3',
    light: '#e3f2fd',
    dark: '#1565c0',
    rgb: '33, 150, 243'
  },
  purple: {
    primary: '#7e57c2',
    light: '#ede7f6',
    dark: '#512da8',
    rgb: '126, 87, 194'
  },
  orange: {
    primary: '#ff9800',
    light: '#fff3e0',
    dark: '#e65100',
    rgb: '255, 152, 0'
  },
  teal: {
    primary: '#009688',
    light: '#e0f2f1',
    dark: '#00695c',
    rgb: '0, 150, 136'
  }
}

// Font families
export const fontFamilies: Record<FontFamily, { name: string; css: string }> = {
  vazir: { name: 'وزیر', css: "'vazir', 'Vazirmatn', sans-serif" },
  iransans: { name: 'ایران سنس', css: "'IRANSansX', 'IRANSans', sans-serif" },
  peyda: { name: 'پیدا', css: "'Peyda', sans-serif" }
}

// Singleton state
const preferences = ref<UserPreferences>({ ...defaultPreferences })
const systemDarkMode = ref(false)
const isInitialized = ref(false)

export function useTheme() {
  // Computed actual theme (resolves 'system')
  const actualMode = computed(() => {
    if (preferences.value.mode === 'system') {
      return systemDarkMode.value ? 'dark' : 'light'
    }
    return preferences.value.mode
  })

  const isDark = computed(() => actualMode.value === 'dark')

  // Get current accent color values
  const currentAccent = computed(() => accentColors[preferences.value.accentColor])

  // Get current font family
  const currentFont = computed(() => fontFamilies[preferences.value.fontFamily])

  // Load preferences from localStorage
  const loadPreferences = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        preferences.value = { ...defaultPreferences, ...parsed }
      }
    } catch (e) {
      console.warn('Failed to load preferences:', e)
    }
  }

  // Save preferences to localStorage
  const savePreferences = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences.value))
    } catch (e) {
      console.warn('Failed to save preferences:', e)
    }
  }

  // Apply theme to document
  const applyTheme = () => {
    const root = document.documentElement
    const accent = currentAccent.value
    const font = currentFont.value

    // Set theme mode
    root.setAttribute('data-theme', actualMode.value)
    root.classList.toggle('theme-dark', isDark.value)
    root.classList.toggle('theme-light', !isDark.value)

    // Set CSS variables for accent color (sync with design tokens)
    root.style.setProperty('--accent', accent.primary)
    root.style.setProperty('--accent-weak', accent.light)
    root.style.setProperty('--accent-strong', accent.dark)
    root.style.setProperty('--accent-rgb', accent.rgb)

    // Sync accent helper classes
    root.classList.remove('accent-green', 'accent-blue', 'accent-purple', 'accent-orange', 'accent-teal')
    root.classList.add(`accent-${preferences.value.accentColor}`)

    // Set font family
    root.style.setProperty('--font-sans', font.css)

    // Set reduced motion
    root.classList.toggle('reduced-motion', preferences.value.reducedMotion)

    // Set compact mode
    root.classList.toggle('compact-mode', preferences.value.compactMode)

    // Set language direction
    root.setAttribute('lang', preferences.value.language)
    root.setAttribute('dir', preferences.value.language === 'fa' ? 'rtl' : 'ltr')
  }

  // Set specific preference
  const setPreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    preferences.value[key] = value
    savePreferences()
    applyTheme()
  }

  // Set theme mode
  const setMode = (mode: ThemeMode) => setPreference('mode', mode)

  // Set accent color
  const setAccentColor = (color: AccentColor) => setPreference('accentColor', color)

  // Set font family
  const setFontFamily = (font: FontFamily) => setPreference('fontFamily', font)

  // Set language
  const setLanguage = (lang: Language) => setPreference('language', lang)

  // Toggle dark mode
  const toggleDarkMode = () => {
    if (preferences.value.mode === 'system') {
      setMode(systemDarkMode.value ? 'light' : 'dark')
    } else {
      setMode(preferences.value.mode === 'dark' ? 'light' : 'dark')
    }
  }

  // Toggle sidebar
  const toggleSidebar = () => setPreference('sidebarCollapsed', !preferences.value.sidebarCollapsed)

  // Reset to defaults
  const resetPreferences = () => {
    preferences.value = { ...defaultPreferences }
    savePreferences()
    applyTheme()
  }

  // Initialize theme system
  const initializeTheme = () => {
    if (isInitialized.value) return

    // Detect system dark mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemDarkMode.value = mediaQuery.matches

    // Listen for system theme changes
    mediaQuery.addEventListener('change', (e) => {
      systemDarkMode.value = e.matches
      if (preferences.value.mode === 'system') {
        applyTheme()
      }
    })

    // Load saved preferences
    loadPreferences()

    // Apply initial theme
    applyTheme()

    isInitialized.value = true
  }

  // Watch for preference changes
  watch(preferences, () => {
    applyTheme()
  }, { deep: true })

  // Auto-initialize on mount
  onMounted(() => {
    initializeTheme()
  })

  return {
    // State
    preferences,
    actualMode,
    isDark,
    currentAccent,
    currentFont,
    systemDarkMode,
    
    // Constants
    accentColors,
    fontFamilies,
    
    // Actions
    setPreference,
    setMode,
    setAccentColor,
    setFontFamily,
    setLanguage,
    toggleDarkMode,
    toggleSidebar,
    resetPreferences,
    initializeTheme,
    savePreferences,
    loadPreferences,
  }
}
