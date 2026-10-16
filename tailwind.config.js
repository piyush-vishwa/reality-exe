/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#08090D',
        card: '#11141B',
        neon: '#B6FF4A',
        violet: '#9B6DFF',
        ink: '#F5F5F5',
        mute: '#8B919E',
      },
      fontFamily: {
        display: ['"Chakra Petch"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 18px -4px rgba(182,255,74,0.55)',
        violet: '0 0 30px -8px rgba(155,109,255,0.45)',
      },
    },
  },
  plugins: [],
};
