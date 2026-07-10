export const DARK_COLORS = {
  background: '#16120D',
  surface: '#211A13',
  surfaceAlt: '#2B2117',
  border: '#5A4630',
  borderLight: '#7A6245',
  primary: '#C79C3A',
  primaryHover: '#E0B84B',
  secondary: '#8B5E3C',
  accent: '#D4AF37',
  text: '#F2E6C9',
  textMuted: '#B8A98A',
  success: '#4C8C4A',
  warning: '#D08A2E',
  danger: '#A13B2B',
  horde: '#B32727',
  alliance: '#2C5FA8',
  info: '#38bdf8',
  wowGold: '#C79C3A',
  wowArcane: '#8B5E3C',
  wowBlood: '#A13B2B',
} as const

export const LIGHT_COLORS = {
  background: '#F5EFE3',
  surface: '#E7DCC8',
  surfaceAlt: '#D9C9B0',
  border: '#B9A38B',
  borderLight: '#D4C0A7',
  primary: '#8B5E3C',
  primaryHover: '#A97F51',
  secondary: '#6A4B32',
  accent: '#A77B43',
  text: '#2D2418',
  textMuted: '#7E6C58',
  success: '#3F7C44',
  warning: '#B16D20',
  danger: '#8A2D25',
  horde: '#8A1F1F',
  alliance: '#1F4F86',
  info: '#0C80B6',
  wowGold: '#B08936',
  wowArcane: '#7C603F',
  wowBlood: '#8B2F26',
} as const

export const COLORS = DARK_COLORS
export const THEMES = {
  dark: DARK_COLORS,
  light: LIGHT_COLORS,
} as const

export type ColorToken = (typeof DARK_COLORS)[keyof typeof DARK_COLORS]
export type SemanticColorName =
  | 'primary'
  | 'primaryHover'
  | 'secondary'
  | 'accent'
  | 'background'
  | 'surface'
  | 'surfaceAlt'
  | 'border'
  | 'borderLight'
  | 'text'
  | 'textMuted'
  | 'success'
  | 'warning'
  | 'danger'
  | 'horde'
  | 'alliance'
  | 'info'
  | 'wowGold'
  | 'wowArcane'
  | 'wowBlood'
