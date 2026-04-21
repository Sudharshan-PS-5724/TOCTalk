/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Syne', 'Inter', 'system-ui', 'sans-serif'],
        pixel: ['"Press Start 2P"', 'ui-monospace', 'monospace'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // Automata specific colors
        'automata-primary': 'hsl(var(--automata-primary))',
        'automata-secondary': 'hsl(var(--automata-secondary))',
        'automata-success': 'hsl(var(--automata-success))',
        'automata-warning': 'hsl(var(--automata-warning))',
        'automata-current': 'hsl(var(--automata-current))',
        'automata-start': 'hsl(var(--automata-start))',
        'automata-accept': 'hsl(var(--automata-accept))',
        'automata-transition': 'hsl(var(--automata-transition))',
        // Sidebar colors
        sidebar: {
          background: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-down': 'slideDown 0.6s ease-out forwards',
        'slide-left': 'slideLeft 0.6s ease-out forwards',
        'slide-right': 'slideRight 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.6s ease-out forwards',
        'bounce-in': 'bounceIn 0.8s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideLeft: { '0%': { opacity: '0', transform: 'translateX(30px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        slideRight: { '0%': { opacity: '0', transform: 'translateX(-30px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.8)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        bounceIn: { '0%': { opacity: '0', transform: 'scale(0.3)' }, '50%': { opacity: '1', transform: 'scale(1.05)' }, '70%': { transform: 'scale(0.9)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
        glow: { '0%': { boxShadow: '0 0 8px hsl(355 100% 50% / 0.4)' }, '100%': { boxShadow: '0 0 28px hsl(186 100% 50% / 0.45)' } }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'toc-hero':
          'radial-gradient(ellipse 100% 70% at 50% -10%, hsl(355 90% 25% / 0.45) 0%, transparent 55%), radial-gradient(ellipse 80% 50% at 100% 100%, hsl(186 80% 30% / 0.2) 0%, transparent 50%), linear-gradient(180deg, hsl(0 0% 5%) 0%, hsl(195 25% 7%) 50%, hsl(0 0% 4%) 100%)',
        'toc-card-shine':
          'linear-gradient(135deg, hsl(0 0% 100% / 0.06) 0%, transparent 40%, hsl(355 90% 45% / 0.08) 100%)',
        'pixel-grid':
          'repeating-linear-gradient(0deg, transparent, transparent 10px, hsl(355 70% 40% / 0.06) 10px, hsl(355 70% 40% / 0.06) 11px), repeating-linear-gradient(90deg, transparent, transparent 10px, hsl(186 50% 45% / 0.05) 10px, hsl(186 50% 45% / 0.05) 11px)',
        'dot-field':
          'radial-gradient(hsl(120 6% 96% / 0.09) 1px, transparent 1px)',
      },
      boxShadow: {
        pixel: '4px 4px 0 0 rgb(15 23 42)',
        'pixel-sm': '3px 3px 0 0 rgb(15 23 42)',
        'glow-red': '0 0 50px hsl(355 100% 45% / 0.35)',
        'glow-cyan': '0 0 45px hsl(186 100% 48% / 0.22)',
        'card-3d':
          '0 22px 48px -14px hsl(0 0% 0% / 0.65), 0 0 0 1px hsl(186 80% 50% / 0.12) inset, 0 -1px 0 hsl(355 90% 40% / 0.15) inset',
      },
    },
  },
  plugins: [],
} 