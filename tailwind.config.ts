import type { Config } from "tailwindcss";

/**
 * Design tokens extracted from the KcBlendz Visily designs.
 *
 * Primary palette is built around two anchors:
 *   - kale (the brand green used for primary CTAs, prices, active nav)
 *   - mango (the orange used for "Be Your Own Mixologist" CTA, builder accents)
 *
 * Surfaces lean off-white with warm cream gradients (peach, mint) used as
 * full-bleed section backgrounds. Type stack pairs Fraunces (display,
 * italic accent words like "Made Your Way") with Inter (UI) — Fraunces
 * gives the editorial-magazine feel the home hero needs.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand
        kale: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981", // primary
          600: "#059669", // hover / pressed
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
        mango: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316", // mixologist CTA
          600: "#EA580C",
          700: "#C2410C",
        },
        // Neutrals
        ink: {
          DEFAULT: "#0F172A", // body text on light
          soft: "#1F2937",
          muted: "#475569",
          ghost: "#94A3B8",
        },
        cream: "#FAF8F4",
        peach: "#FFF1E6", // mixologist card bg
        mint: "#F0FDF4", // newsletter, callouts
        // Admin
        admin: {
          bg: "#F8FAFC",
          panel: "#FFFFFF",
          rail: "#FFFFFF",
          border: "#E2E8F0",
          ringActive: "#D1FAE5",
        },
        // Semantic
        success: "#10B981",
        warn: "#F59E0B",
        danger: "#EF4444",
        info: "#3B82F6",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Display ramp matching home hero
        "display-xl": ["clamp(2.75rem, 5.5vw, 4.5rem)", { lineHeight: "1.02", letterSpacing: "-0.025em", fontWeight: "700" }],
        "display-lg": ["clamp(2.25rem, 4vw, 3.25rem)", { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-md": ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.1", letterSpacing: "-0.015em", fontWeight: "700" }],
      },
      borderRadius: {
        pill: "9999px",
        card: "1rem", // 16px — product cards, content blocks
        panel: "1.25rem", // 20px — admin panels, hero cards
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(15, 23, 42, 0.06)",
        pop: "0 12px 32px -8px rgba(15, 23, 42, 0.12), 0 4px 8px -2px rgba(15, 23, 42, 0.06)",
        cta: "0 8px 20px -6px rgba(16, 185, 129, 0.45)",
        ctaMango: "0 8px 20px -6px rgba(249, 115, 22, 0.45)",
        innerSoft: "inset 0 1px 0 0 rgba(255, 255, 255, 0.6)",
      },
      backgroundImage: {
        "peach-card":
          "radial-gradient(120% 100% at 0% 0%, #FFE8D6 0%, #FFF1E6 40%, #FFF7ED 100%)",
        "mint-section":
          "linear-gradient(180deg, #F0FDF4 0%, #ECFDF5 100%)",
        "hero-fade":
          "radial-gradient(80% 60% at 100% 0%, #FFF1E6 0%, transparent 60%)",
        "blender-liquid":
          "linear-gradient(180deg, rgba(255,237,213,0.0) 0%, rgba(254,215,170,0.9) 30%, rgba(251,146,60,0.95) 100%)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fadeIn 0.4s ease both",
        "scale-in": "scaleIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
        "shimmer": "shimmer 1.8s linear infinite",
        "blend-spin": "blendSpin 1.6s cubic-bezier(0.6, 0, 0.4, 1) infinite",
        "rise": "rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-soft": "pulseSoft 2.4s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-468px 0" },
          "100%": { backgroundPosition: "468px 0" },
        },
        blendSpin: {
          "0%, 100%": { transform: "rotate(-4deg) scale(1)" },
          "50%": { transform: "rotate(4deg) scale(1.02)" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(24px) scale(0.9)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      transitionTimingFunction: {
        emphasized: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
