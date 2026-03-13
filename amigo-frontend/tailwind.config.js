/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ─────────────────────────────────────────────────────
      // AMIGO — Calm & Collaborative Palette
      // Psychology: Sage Green reduces stress & promotes balance.
      //             Mint Blue brings clarity & focus.
      //             Beige gives warmth & approachability.
      //             Soft Charcoal provides grounding contrast.
      // ─────────────────────────────────────────────────────
      colors: {
        // — Sage Green family —
        sage: {
          50:  '#f4f8f5',
          100: '#e6f0e8',
          200: '#cde1d2',
          300: '#a8c9af',
          400: '#7dab87',
          500: '#5a8f67',   // PRIMARY — main brand action
          600: '#477356',
          700: '#3a5c45',
          800: '#304a39',
          900: '#293e30',
          950: '#13221a',
        },
        // — Mint Blue family —
        mint: {
          50:  '#f0fafa',
          100: '#d9f3f3',
          200: '#b6e8e8',
          300: '#82d5d6',
          400: '#47b9bc',
          500: '#2d9ea1',   // SECONDARY — links, focus rings, badges
          600: '#277f83',
          700: '#246568',
          800: '#235254',
          900: '#214547',
          950: '#102b2d',
        },
        // — Beige / Warm Neutral family —
        beige: {
          50:  '#fdfcf8',
          100: '#f9f6ef',
          200: '#f2ebe0',
          300: '#e8dcc8',
          400: '#d9c9aa',
          500: '#c9b590',   // Used for card borders, hover states
          600: '#b09470',
          700: '#937455',
          800: '#795f47',
          900: '#644f3d',
          950: '#352820',
        },
        // — Soft Charcoal family —
        charcoal: {
          50:  '#f6f7f7',
          100: '#e3e5e5',
          200: '#c9cccc',
          300: '#a4a9a9',
          400: '#797f80',
          500: '#5f6566',   // Body text on light backgrounds
          600: '#505556',
          700: '#454949',
          800: '#3c3f3f',   // Surface dark
          900: '#353838',
          950: '#1e2121',   // Darkest — deep backgrounds
        },

        // — Semantic aliases (use these in components) —
        brand:    { DEFAULT: '#5a8f67', light: '#7dab87', dark: '#3a5c45' },
        accent:   { DEFAULT: '#2d9ea1', light: '#47b9bc', dark: '#246568' },
        surface:  {
          DEFAULT: '#fdfcf8',  // light page bg
          card:    '#f9f6ef',  // card / panel bg
          dark:    '#1e2121',  // dark mode page bg
          'card-dark': '#2a2e2e',
        },
        'text-primary':   '#353838',
        'text-secondary': '#5f6566',
        'text-muted':     '#a4a9a9',
        'border-default': '#e8dcc8',
        'border-focus':   '#5a8f67',
      },

      // ── Typography ──────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      // ── Border radius ──────────────────────────────────────────
      borderRadius: {
        'xl':  '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.5rem',
      },

      // ── Shadows ──────────────────────────────────────────────
      boxShadow: {
        'sage-sm':  '0 1px 3px 0 rgba(90,143,103,0.12), 0 1px 2px -1px rgba(90,143,103,0.08)',
        'sage-md':  '0 4px 12px -1px rgba(90,143,103,0.15), 0 2px 6px -2px rgba(90,143,103,0.10)',
        'sage-lg':  '0 10px 30px -3px rgba(90,143,103,0.20), 0 4px 12px -4px rgba(90,143,103,0.15)',
        'mint-md':  '0 4px 12px -1px rgba(45,158,161,0.18), 0 2px 6px -2px rgba(45,158,161,0.12)',
        'warm-sm':  '0 2px 8px 0 rgba(201,181,144,0.20)',
        'card':     '0 2px 8px 0 rgba(53,56,56,0.06), 0 1px 2px 0 rgba(53,56,56,0.04)',
        'card-hover':'0 8px 24px 0 rgba(53,56,56,0.10), 0 2px 6px 0 rgba(53,56,56,0.06)',
      },

      // ── Animations ─────────────────────────────────────────────
      animation: {
        'fade-in':      'fadeIn 0.3s ease-out',
        'slide-up':     'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'slide-down':   'slideDown 0.3s ease-out',
        'scale-in':     'scaleIn 0.2s ease-out',
        'pulse-soft':   'pulseSoft 2s ease-in-out infinite',
        'shimmer':      'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' },                               '100%': { opacity: '1' } },
        slideUp:   { '0%': { transform: 'translateY(16px)', opacity: '0' }, '100%': { transform: 'translateY(0)',   opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-12px)', opacity: '0' },'100%': { transform: 'translateY(0)',   opacity: '1' } },
        scaleIn:   { '0%': { transform: 'scale(0.95)', opacity: '0' },     '100%': { transform: 'scale(1)',        opacity: '1' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [
    // @tailwindcss/forms is added in package.json
    // import('@tailwindcss/forms') is handled at runtime
  ],
};
