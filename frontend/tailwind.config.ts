import type { Config } from 'tailwindcss'
import { COLORS } from './src/constants/colors'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: COLORS.primary,
        secondary: COLORS.secondary,
        accent: COLORS.accent,
        background: COLORS.background,
        surface: COLORS.surface,
        border: COLORS.border,
        success: COLORS.success,
        warning: COLORS.warning,
        danger: COLORS.danger,
        info: COLORS.info,
        wow: {
          gold: COLORS.wowGold,
          arcane: COLORS.wowArcane,
          blood: COLORS.wowBlood,
        },
      },
    },
  },
  plugins: [],
} satisfies Config
