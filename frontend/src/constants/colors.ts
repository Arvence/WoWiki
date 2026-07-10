export const COLORS = {
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

export type ColorToken = (typeof COLORS)[keyof typeof COLORS]
export type SemanticColorName =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'background'
  | 'surface'
  | 'border'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
