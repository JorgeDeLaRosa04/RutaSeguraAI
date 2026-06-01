import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        night: '#0f172a',
        safe: '#10b981',
        alert: '#ef4444'
      }
    }
  },
  plugins: []
};

export default config;
