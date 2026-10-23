import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#111111",
          soft: "#444444",
          faint: "#888888",
        },
        paper: {
          DEFAULT: "#FAFAF8",
          raised: "#FFFFFF",
          dim: "#F0F0EC",
        },
        line: {
          DEFAULT: "#E5E5E0",
          strong: "#D4D4CC",
        },
      },
      letterSpacing: {
        tightest: "-0.03em",
        caps: "0.08em",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
