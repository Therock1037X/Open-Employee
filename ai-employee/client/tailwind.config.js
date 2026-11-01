/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Core Palette Tokens
        navy: {
          DEFAULT: "#2F4156",
          dark: "#1B2735",
          deep: "#141E28",
        },
        teal: {
          DEFAULT: "#567C8D",
          dark: "#3F5E6E",
          light: "#6E95A6",
          bright: "#7DA6B8",
        },
        skyblue: {
          DEFAULT: "#C8D9E6",
          light: "#E1ECF4",
          bright: "#D8E7F2",
        },
        beige: {
          DEFAULT: "#F5EFEB",
          light: "#FAF7F5",
        },
        white: "#FFFFFF",

        // Status Colors (strictly Red & Green)
        error: {
          DEFAULT: "#EF4444",
          light: "#F87171",
        },
        success: {
          DEFAULT: "#10B981",
          light: "#34D399",
        },

        // CSS Variables for dynamic themes
        page: "var(--bg-page)",
        card: "var(--bg-card)",
        navbar: "var(--bg-navbar)",
        modal: "var(--bg-modal)",
        "card-border": "var(--border-card)",
        "card-border-strong": "var(--border-strong)",
        "primary-text": "var(--text-primary)",
        "secondary-text": "var(--text-secondary)",
        "accent-text": "var(--accent-text)",
        "chip-bg": "var(--chip-bg)",
        "chip-text": "var(--chip-text)",
        "chip-border": "var(--chip-border)",
        "primary-btn": "var(--primary-btn)",
        "primary-btn-text": "var(--primary-btn-text)",
        highlight: "var(--highlight)",
        "highlight-hover": "var(--highlight-hover)",
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      transitionDuration: {
        150: "150ms",
        200: "200ms",
        250: "250ms",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        heading: ["var(--font-inter)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        "teal-glow": "0 0 16px -2px rgba(86, 124, 141, 0.35)",
        "button-lift": "0 4px 12px -2px rgba(86, 124, 141, 0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease-out forwards",
        "slide-up": "slideUp 0.25s ease-out forwards",
        "soft-ripple": "softRipple 1.8s cubic-bezier(0, 0.2, 0.8, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        softRipple: {
          "0%": { transform: "scale(1)", opacity: "0.7" },
          "100%": { transform: "scale(2.1)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
