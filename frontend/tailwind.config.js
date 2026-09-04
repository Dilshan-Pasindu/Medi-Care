import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        border: "hsl(210 24% 90%)",
        input: "hsl(210 24% 90%)",
        ring: "hsl(175 84% 32%)",
        background: "hsl(210 40% 98%)",
        foreground: "hsl(222 47% 11%)",
        primary: {
          DEFAULT: "hsl(175 84% 28%)",
          foreground: "hsl(0 0% 100%)",
          50:  "#edfafa",
          100: "#d5f5f6",
          200: "#afecec",
          300: "#7ddde3",
          400: "#16bdca",
          500: "#0e9f9f",
          600: "#0a7f7f",
          700: "#086464",
          800: "#074f4f",
          900: "#053d3d",
        },
        teal: {
          DEFAULT: "hsl(175 84% 28%)",
          50:  "#edfafa",
          100: "#d5f5f6",
          200: "#afecec",
          300: "#7ddde3",
          400: "#16bdca",
          500: "#0e9f9f",
          600: "#0a7f7f",
          700: "#086464",
          800: "#074f4f",
          900: "#053d3d",
        },
        secondary: {
          DEFAULT: "hsl(210 40% 96.1%)",
          foreground: "hsl(222 47% 11%)",
        },
        destructive: {
          DEFAULT: "hsl(0 84% 60%)",
          foreground: "hsl(210 40% 98%)",
        },
        muted: {
          DEFAULT: "hsl(210 40% 96.1%)",
          foreground: "hsl(215 16% 47%)",
        },
        accent: {
          DEFAULT: "hsl(175 84% 28%)",
          foreground: "hsl(0 0% 100%)",
        },
        card: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(222 47% 11%)",
        },
        success: {
          DEFAULT: "#059669",
          light: "#d1fae5",
          dark: "#065f46",
        },
        warning: {
          DEFAULT: "#d97706",
          light: "#fef3c7",
          dark: "#92400e",
        },
        danger: {
          DEFAULT: "#dc2626",
          light: "#fee2e2",
          dark: "#991b1b",
        },
        info: {
          DEFAULT: "#2563eb",
          light: "#dbeafe",
          dark: "#1e40af",
        },
        medical: {
          bg: "#f0faf9",
          surface: "#ffffff",
          divider: "#e2f0f0",
          text: "#0f3d3d",
        },
      },
      backgroundImage: {
        'gradient-medical': 'linear-gradient(135deg, hsl(175 84% 28%) 0%, hsl(190 80% 35%) 50%, hsl(200 70% 40%) 100%)',
        'gradient-card': 'linear-gradient(135deg, #ffffff 0%, #f0faf9 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, hsl(175 84% 16%) 0%, hsl(190 80% 20%) 100%)',
        'gradient-hero': 'linear-gradient(135deg, hsl(175 84% 10%) 0%, hsl(190 80% 18%) 60%, hsl(200 70% 22%) 100%)',
        'gradient-radial-teal': 'radial-gradient(ellipse at top left, hsl(175 84% 28% / 0.15) 0%, transparent 60%)',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 16px 0 rgb(14 159 159 / 0.12), 0 2px 6px -1px rgb(0 0 0 / 0.06)',
        'sidebar': '4px 0 24px 0 rgb(0 0 0 / 0.08)',
        'glow-teal': '0 0 20px rgb(14 159 159 / 0.25)',
        'inner-glow': 'inset 0 1px 0 rgb(255 255 255 / 0.15)',
        'button': '0 1px 2px 0 rgb(0 0 0 / 0.08), 0 0 0 1px rgb(14 159 159 / 0.15)',
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        '2xl': "1.25rem",
        '3xl': "1.5rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-up': 'fadeUp 0.4s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
