import { makeTemplateIndexHtml } from "./shared";

/**
 * Seed de la plantilla "Aeronáutica" (TYCON).
 *
 * Conversión 1:1 del HTML estático de public/templates/aeronautica al stack
 * del sandbox (Vite + React + Tailwind v3): los tokens del tailwind.config
 * del CDN pasan tal cual al config compilado y el markup del body pasa a ser
 * el JSX de /src/App.tsx.
 */
export const AERONAUTICA_SEED: Record<string, string> = {
  "/index.html": makeTemplateIndexHtml({
    title: "TYCON Aeronautics - Fleet",
    fontLinks: [
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Playfair+Display:wght@500;600;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap",
    ],
  }),

  "/tailwind.config.js": `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "on-primary-fixed-variant": "#574500",
        "tertiary-container": "#b4b2b2",
        "on-surface-variant": "#d0c5af",
        "on-error-container": "#ffdad6",
        "surface-dim": "#121414",
        "surface-tint": "#e9c349",
        "on-error": "#690005",
        "tertiary-fixed-dim": "#c8c6c5",
        "on-surface": "#e3e2e2",
        "secondary-fixed-dim": "#c8c6c5",
        "surface-container-lowest": "#0d0e0f",
        "surface-variant": "#343535",
        "surface-container-low": "#1b1c1c",
        "on-secondary-fixed": "#1c1b1b",
        "secondary-container": "#474746",
        "primary-fixed-dim": "#e9c349",
        "primary-fixed": "#ffe088",
        "on-tertiary": "#303030",
        "on-primary": "#3c2f00",
        "on-background": "#e3e2e2",
        "primary-container": "#d4af37",
        "inverse-primary": "#735c00",
        "on-primary-container": "#554300",
        "on-secondary-fixed-variant": "#474746",
        "on-tertiary-fixed": "#1b1c1c",
        "surface-container-high": "#292a2a",
        "secondary-fixed": "#e5e2e1",
        "outline-variant": "#4d4635",
        secondary: "#c8c6c5",
        surface: "#121414",
        "surface-container-highest": "#343535",
        "on-tertiary-container": "#454545",
        "inverse-surface": "#e3e2e2",
        background: "#121414",
        "inverse-on-surface": "#2f3031",
        "on-secondary": "#313030",
        "on-tertiary-fixed-variant": "#474747",
        tertiary: "#d0cdcd",
        "on-primary-fixed": "#241a00",
        "on-secondary-container": "#b7b5b4",
        "surface-container": "#1f2020",
        error: "#ffb4ab",
        outline: "#99907c",
        primary: "#f2ca50",
        "surface-bright": "#383939",
        "tertiary-fixed": "#e4e2e1",
        "error-container": "#93000a",
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
      },
      spacing: {
        "margin-mobile": "16px",
        "container-max": "1280px",
        unit: "8px",
        "margin-desktop": "64px",
        gutter: "24px",
      },
      fontFamily: {
        "body-md": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "headline-md": ["Playfair Display", "serif"],
        "headline-sm": ["Playfair Display", "serif"],
        "headline-lg": ["Playfair Display", "serif"],
        "display-lg": ["Playfair Display", "serif"],
      },
      fontSize: {
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "1.2", letterSpacing: "0.05em", fontWeight: "500" }],
        "headline-md": ["32px", { lineHeight: "1.3", fontWeight: "500" }],
        "headline-sm": ["24px", { lineHeight: "1.4", fontWeight: "500" }],
        "headline-lg": ["48px", { lineHeight: "1.2", fontWeight: "600" }],
        "display-lg": ["64px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
      },
    },
  },
  plugins: [],
};
`,

  "/src/index.css": `@tailwind base;
@tailwind components;
@tailwind utilities;

.gold-border-gradient {
  border-image: linear-gradient(to bottom, rgba(212, 175, 55, 0.3), transparent) 1;
}
`,

  "/src/App.tsx": `export default function App() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background pb-[100px] font-body-md text-on-surface antialiased md:pb-0">
      {/* TopAppBar */}
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/10 bg-surface/80 px-margin-mobile backdrop-blur-md">
        <button aria-label="Menu" className="text-on-surface transition-colors duration-300 hover:text-primary active:scale-95">
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
        <h1 className="font-display-lg text-headline-sm tracking-tighter text-primary">TYCON</h1>
        <button aria-label="Book" className="font-label-md text-label-md text-on-surface transition-colors duration-300 hover:text-primary active:scale-95">
          BOOK
        </button>
      </header>

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="relative flex h-[530px] min-h-[400px] w-full items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div
              className="h-full w-full bg-cover bg-center opacity-60"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB51Fuz9LpSn7iltEg47B51iwn56YjylKB1bjqzKUerzn1CInjmXA6Aez2mZ9cq66zo0ApbFTYwsZSgpyZMuH66Z4gzf7zlYcgZMC_dy6j2iZ_wGTIlTJF37lYLr6Ze58neUmC-7jC5sT6XZBn5l3kpoX9BRBB19dnW23Yf3MTpDiFHtvPWkMVrShxT4rp-f-xFHR3J2dG86fTTMm_pBnspiVtU4MbUtzZW4e3Zn_iXM1FqQ--0Cree')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />
          </div>
          <div className="relative z-10 px-margin-mobile text-center">
            <h2 className="mb-4 font-display-lg text-display-lg tracking-tight text-primary drop-shadow-lg">Our Fleet</h2>
            <p className="mx-auto max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
              Uncompromising luxury, engineered for the extraordinary.
            </p>
          </div>
        </section>

        {/* Fleet Grid */}
        <section className="mx-auto max-w-container-max px-margin-mobile py-[120px] md:px-margin-desktop">
          <div className="grid grid-cols-1 gap-[120px] lg:grid-cols-2 lg:gap-gutter">
            {/* Light Jets */}
            <article className="group relative flex flex-col overflow-hidden rounded border border-[#2C2C2C] bg-surface p-gutter md:p-[48px]">
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <div className="mb-gutter h-64 overflow-hidden rounded">
                <img
                  className="h-full w-full transform object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  alt="Phenom 300 light jet soaring above a metropolis at twilight"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJAvEsvh6IkxTI_SK7wFNNiENzV9T7Kr1WUoXr04Q_yPnz0dmO_NUbbW4AcUvHwWIDIS7lk1Jgnb-RHsVqUH0J9ut70AZyjleOQkR6b04E3J3oHptWfPefl9Eoy1puqMhXWz9paxiYThJcLjZbz0RBHQTmsqGwpHV0rat6jowglCugv_hMto8D0csYPQHpQrnldqyAoGhFanu2Toow8-Yy4oAJTmlvdX9wr098sAoYbkqdh-OO9GIw"
                />
              </div>
              <h3 className="mb-2 font-headline-md text-headline-md text-on-surface">Light Jets</h3>
              <p className="mb-6 font-label-md text-label-md tracking-widest text-primary">PHENOM 300E</p>
              <p className="mb-8 flex-grow font-body-md text-body-md text-on-surface-variant">
                Ideal for regional travel, combining remarkable agility with unexpected spaciousness and comfort.
              </p>
              <ul className="space-y-4 border-t border-white/10 pt-6">
                <li className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-tertiary">RANGE</span>
                  <span className="font-body-md text-body-md text-on-surface">2,010 nm</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-tertiary">SPEED</span>
                  <span className="font-body-md text-body-md text-on-surface">Mach 0.80</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-tertiary">PASSENGERS</span>
                  <span className="font-body-md text-body-md text-on-surface">Up to 7</span>
                </li>
              </ul>
            </article>

            {/* Midsize Jets */}
            <article className="group relative flex flex-col overflow-hidden rounded border border-[#2C2C2C] bg-surface p-gutter md:p-[48px] lg:translate-y-[60px]">
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <div className="mb-gutter h-64 overflow-hidden rounded">
                <img
                  className="h-full w-full transform object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  alt="Challenger 350 midsize jet inside a private hangar"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxmXY-BHOEEh3-K0HpuqRLU9w8s-iKBDZ9majkpPRNBmvDGq474kffyPoDX0TCBk2Hv789mSm5BS0H98JL0j8o7uyc5mk6ajxNQJ4nwetT9o7pjgcidW_qJYzwRUsPVYrYdj3hXA5JyScZ6VKFVmtMRAkp2fpLg9o8V5XUd-KfwfT-tGjBIG-kPcRJHiKvB3BT7QoGzRM3MZVNRE6y8I60HE5X0XiGLdGmO5iffhV39rVPnxCmKUHB"
                />
              </div>
              <h3 className="mb-2 font-headline-md text-headline-md text-on-surface">Midsize Jets</h3>
              <p className="mb-6 font-label-md text-label-md tracking-widest text-primary">CHALLENGER 350</p>
              <p className="mb-8 flex-grow font-body-md text-body-md text-on-surface-variant">
                The definitive choice for transcontinental flight, offering a wider cabin and enhanced inflight connectivity.
              </p>
              <ul className="space-y-4 border-t border-white/10 pt-6">
                <li className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-tertiary">RANGE</span>
                  <span className="font-body-md text-body-md text-on-surface">3,200 nm</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-tertiary">SPEED</span>
                  <span className="font-body-md text-body-md text-on-surface">Mach 0.83</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-tertiary">PASSENGERS</span>
                  <span className="font-body-md text-body-md text-on-surface">Up to 9</span>
                </li>
              </ul>
            </article>

            {/* Heavy Jets */}
            <article className="group relative mt-0 flex flex-col overflow-hidden rounded border border-[#2C2C2C] bg-surface p-gutter md:p-[48px] lg:col-span-2 lg:mt-[60px]">
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <div className="flex flex-col gap-gutter lg:flex-row">
                <div className="h-64 w-full overflow-hidden rounded lg:h-auto lg:w-1/2">
                  <img
                    className="h-full w-full transform object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                    alt="Gulfstream G650ER in flight above the clouds at sunrise"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3dLwg1fxK5ynGIY0ehst8O6QHiLVArKFqkT8bfr2Y-0trBw5twt-sStzH-vL9kPrlV0e8DGlyDTw8mUJJNAwB-CsWSLf0OOsBSu0_qjJkw-bSVjA_1Cu_-liex0xatLv4wA3OdGyNarF6yhtQM0NWbfnWyLmWGwBZENioG85erKFouVulARJqma3un2X7nHXcylCYyZdfDxdp4vr6GTF1immGvngv_Pleif-ZZ5QZRQv5d-CJ5UdH"
                  />
                </div>
                <div className="flex w-full flex-col justify-center lg:w-1/2">
                  <h3 className="mb-2 font-headline-md text-headline-md text-on-surface">Heavy Jets</h3>
                  <p className="mb-6 font-label-md text-label-md tracking-widest text-primary">GULFSTREAM G650ER</p>
                  <p className="mb-8 font-body-md text-body-md text-on-surface-variant">
                    The pinnacle of long-range travel. Designed to conquer the globe in a single bound while providing an unrivaled, serene cabin environment.
                  </p>
                  <ul className="space-y-4 border-t border-white/10 pt-6">
                    <li className="flex items-center justify-between">
                      <span className="font-label-md text-label-md text-tertiary">RANGE</span>
                      <span className="font-body-md text-body-md text-on-surface">7,500 nm</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="font-label-md text-label-md text-tertiary">SPEED</span>
                      <span className="font-body-md text-body-md text-on-surface">Mach 0.925</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="font-label-md text-label-md text-tertiary">PASSENGERS</span>
                      <span className="font-body-md text-body-md text-on-surface">Up to 14</span>
                    </li>
                  </ul>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="mx-auto max-w-container-max px-margin-mobile pb-[120px] text-center md:px-margin-desktop">
          <h3 className="mb-8 font-headline-sm text-headline-sm text-on-surface">Ready to define your journey?</h3>
          <button className="rounded bg-primary px-8 py-4 font-label-md text-label-md text-on-primary shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-colors hover:bg-primary-fixed hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]">
            INQUIRE CHARTER
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex w-full flex-col items-center space-y-gutter border-t border-outline-variant/20 bg-surface-dim px-margin-mobile py-12 text-center">
        <div className="mb-4 font-headline-sm text-primary">TYCON</div>
        <nav className="mb-4 flex flex-wrap justify-center gap-6">
          <a className="font-body-md text-body-md text-on-surface-variant underline decoration-primary/30 hover:text-primary" href="#">PRIVACY</a>
          <a className="font-body-md text-body-md text-on-surface-variant underline decoration-primary/30 hover:text-primary" href="#">TERMS</a>
          <a className="font-body-md text-body-md font-bold text-primary" href="#">FLEET</a>
          <a className="font-body-md text-body-md text-on-surface-variant underline decoration-primary/30 hover:text-primary" href="#">CONTACT</a>
        </nav>
        <p className="font-body-md text-sm text-on-surface-variant">© 2024 TYCON AERONAUTICS. ALL RIGHTS RESERVED.</p>
      </footer>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="fixed bottom-0 z-50 flex h-20 w-full items-center justify-around border-t border-white/5 bg-surface-container-lowest px-4 md:hidden">
        <a className="flex h-full w-full flex-col items-center justify-center text-on-surface-variant hover:bg-surface-bright/5" href="#">
          <span className="material-symbols-outlined mb-1">home</span>
          <span className="font-label-md text-[10px] tracking-widest">HOME</span>
        </a>
        <a className="flex h-full w-full flex-col items-center justify-center text-on-surface-variant hover:bg-surface-bright/5" href="#">
          <span className="material-symbols-outlined mb-1">flight_takeoff</span>
          <span className="font-label-md text-[10px] tracking-widest">SOLUTIONS</span>
        </a>
        <a className="relative flex h-full w-full flex-col items-center justify-center text-primary hover:bg-surface-bright/5" href="#">
          <span className="material-symbols-outlined mb-1">connecting_airports</span>
          <span className="font-label-md text-[10px] tracking-widest">FLEET</span>
          <div className="absolute bottom-2 h-1 w-1 rounded-full bg-primary" />
        </a>
        <a className="flex h-full w-full flex-col items-center justify-center text-on-surface-variant hover:bg-surface-bright/5" href="#">
          <span className="material-symbols-outlined mb-1">mail</span>
          <span className="font-label-md text-[10px] tracking-widest">CONTACT</span>
        </a>
      </nav>
    </div>
  );
}
`,
};
