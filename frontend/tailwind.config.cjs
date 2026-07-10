const { COLORS } = require('./src/constants/colors')

module.exports = {
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
        'surface-alt': COLORS.surfaceAlt,
        border: COLORS.border,
        'border-light': COLORS.borderLight,
        success: COLORS.success,
        warning: COLORS.warning,
        danger: COLORS.danger,
        info: COLORS.info,
        text: COLORS.text,
        muted: COLORS.textMuted,
        'primary-hover': COLORS.primaryHover,
        wow: {
          gold: COLORS.wowGold,
          arcane: COLORS.wowArcane,
          blood: COLORS.wowBlood,
        },
      },
    },
  },
  plugins: [],
}
