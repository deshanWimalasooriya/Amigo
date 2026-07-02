/**
 * design-tokens.js
 *
 * Single source of truth for the Amigo "Calm & Collaborative" design system.
 * Import these into any component that needs inline styles or JS-driven styling.
 *
 * The canonical values MUST stay in sync with tailwind.config.js.
 */

export const colors = {
  // — Sage Green (primary brand) —
  sage: {
    50:  '#f4f8f5',
    100: '#e6f0e8',
    200: '#cde1d2',
    300: '#a8c9af',
    400: '#7dab87',
    500: '#5a8f67',
    600: '#477356',
    700: '#3a5c45',
    800: '#304a39',
    900: '#293e30',
  },
  // — Mint Blue (accent / focus) —
  mint: {
    50:  '#f0fafa',
    100: '#d9f3f3',
    200: '#b6e8e8',
    300: '#82d5d6',
    400: '#47b9bc',
    500: '#2d9ea1',
    600: '#277f83',
    700: '#246568',
  },
  // — Beige / Warm Neutral (surfaces, borders) —
  beige: {
    50:  '#fdfcf8',
    100: '#f9f6ef',
    200: '#f2ebe0',
    300: '#e8dcc8',
    400: '#d9c9aa',
    500: '#c9b590',
  },
  // — Soft Charcoal (text, backgrounds) —
  charcoal: {
    400: '#797f80',
    500: '#5f6566',
    600: '#505556',
    700: '#454949',
    800: '#3c3f3f',
    900: '#353838',
    950: '#1e2121',
  },
};

/** Semantic token shortcuts */
export const t = {
  bg:           colors.beige[50],
  bgCard:       colors.beige[100],
  bgCardHover:  colors.beige[200],
  border:       colors.beige[300],
  borderFocus:  colors.sage[500],

  brand:        colors.sage[500],
  brandLight:   colors.sage[100],
  brandHover:   colors.sage[600],

  accent:       colors.mint[500],
  accentLight:  colors.mint[100],
  accentHover:  colors.mint[600],

  text:         colors.charcoal[900],
  textSub:      colors.charcoal[500],
  textMuted:    colors.charcoal[400],
  textOnBrand:  '#ffffff',
};

/** Avatar gradient pool — all warm/calm tones */
export const avatarGradients = [
  `linear-gradient(135deg, ${colors.sage[500]} 0%, ${colors.mint[500]} 100%)`,
  `linear-gradient(135deg, ${colors.mint[500]} 0%, ${colors.sage[400]} 100%)`,
  `linear-gradient(135deg, ${colors.sage[400]} 0%, ${colors.beige[500]} 100%)`,
  `linear-gradient(135deg, ${colors.beige[500]} 0%, ${colors.sage[600]} 100%)`,
  `linear-gradient(135deg, ${colors.mint[400]} 0%, ${colors.sage[700]} 100%)`,
];
export const getAvatarGradient = (id) => avatarGradients[(id ?? 0) % avatarGradients.length];

/** Consistent status colours */
export const status = {
  online:    colors.sage[500],
  busy:      '#f59e0b',
  offline:   colors.charcoal[400],
  recording: '#ef4444',
};

/** Box shadows */
export const shadows = {
  card:      '0 2px 8px 0 rgba(53,56,56,0.06), 0 1px 2px 0 rgba(53,56,56,0.04)',
  cardHover: '0 8px 24px 0 rgba(53,56,56,0.10), 0 2px 6px 0 rgba(53,56,56,0.06)',
  sageMd:    '0 4px 12px -1px rgba(90,143,103,0.15), 0 2px 6px -2px rgba(90,143,103,0.10)',
  mintMd:    '0 4px 12px -1px rgba(45,158,161,0.18), 0 2px 6px -2px rgba(45,158,161,0.12)',
};
