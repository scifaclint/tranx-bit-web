import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        xs: "475px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
    extend: {
      spacing: {
        "25": "120px",
      },
      backgroundImage: {
        // Dark mode gradients
        "gradient-dark-purple-1":
          "linear-gradient(to bottom right, #000000, #1a0a2e, #3d1a5f)",
        "gradient-dark-purple-2":
          "linear-gradient(to bottom right, #000000, #2d1b4e, #5b21b6)", // looks better to me
        "gradient-dark-purple-3":
          "linear-gradient(to bottom right, #0f172a, #1e1b4b, #0f172a)",

        // Light mode gradients
        "gradient-light-purple-1":
          "linear-gradient(to bottom right, #ffffff, #faf5ff, #f3e8ff)",
        "gradient-light-purple-2":
          "linear-gradient(to bottom right, #f9fafb, #faf5ff, #e0e7ff)",
        "gradient-light-purple-3":
          "linear-gradient(to bottom right, #ffffff, #eff6ff, #f5f3ff)",
      },
      colors: {
        primary: {
          DEFAULT: "#8B5FBF", // Sophisticated purple from reference
          50: "#F8F6FC",
          100: "#F0EBFF",
          200: "#E1D4FF",
          300: "#C9B3FF",
          400: "#A688FF",
          500: "#8B5FBF",
          600: "#7C4DFF",
          700: "#6B46C1",
          800: "#553C9A",
          900: "#44337A",
        },
        typography: {
          DEFAULT: {
            css: {
              maxWidth: "none",
              color: "inherit",
              a: {
                color: "inherit",
                textDecoration: "none",
                "&:hover": {
                  color: "inherit",
                },
              },
              code: {
                color: "inherit",
                background: "transparent",
                padding: 0,
              },
              "code::before": {
                content: "",
              },
              "code::after": {
                content: "",
              },
              "blockquote p:first-of-type::before": {
                content: "",
              },
              "blockquote p:last-of-type::after": {
                content: "",
              },
              img: {
                marginTop: 0,
                marginBottom: 0,
              },
              hr: {
                borderColor: "var(--border)",
                marginTop: "1em",
                marginBottom: "1em",
              },
            },
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    function ({
      addUtilities,
    }: {
      addUtilities: (utilities: object, variants: string[]) => void;
    }) {
      const newUtilities = {
        ".scrollbar-thin": {
          scrollbarWidth: "thin",
          scrollbarColor: "hsl(var(--muted-foreground))",
        },
        ".scrollbar-webkit": {
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "white",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgb(41 31 55) ",
            borderRadius: "20px",
            border: "1px solid white",
          },
        },
        ".scrollbar-none": {
          scrollbarWidth: "none", // Firefox
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      };

      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
} satisfies Config;

export default config;
