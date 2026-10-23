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
          DEFAULT: "#0C0C0C",
          soft: "#3D3D3D",
          faint: "#8A8A85",
        },
        paper: {
          DEFAULT: "#F7F6F2",
          raised: "#FFFFFF",
          dim: "#EFEDE7",
        },
        line: {
          DEFAULT: "#E2E1DA",
          strong: "#C9C8BF",
        },
        accent: {
          DEFAULT: "#B3401E", // burnt sienna — warm editorial red
          hover: "#96341A",
        },
      },
      letterSpacing: {
        tightest: "-0.035em",
        caps: "0.1em",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
