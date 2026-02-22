/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#1A1A1A',
        sand: '#E6D3A3',
        orange: {
          DEFAULT: '#FF7A00',
          light: '#FF9A40',
          dark: '#CC6200',
        },
        ivory: '#F7F4EF',
        olive: {
          DEFAULT: '#6B705C',
          light: '#8A8F7A',
          dark: '#4A4D3E',
        },
        gold: {
          DEFAULT: '#C9A227',
          light: '#DDB94A',
          dark: '#A07E10',
        },
        cream: '#FDF8F0',
        warmgray: '#9A9080',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        display: ['Cormorant Garamond', 'Playfair Display', 'serif'],
      },
      backgroundImage: {
        'gradient-sunset': 'linear-gradient(135deg, #1A1A1A 0%, #3D2B00 50%, #FF7A00 100%)',
        'gradient-warm': 'linear-gradient(180deg, #F7F4EF 0%, #E6D3A3 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(255,122,0,0.1) 0%, rgba(201,162,39,0.1) 100%)',
        'gradient-hero': 'linear-gradient(to bottom, rgba(26,26,26,0.7) 0%, rgba(26,26,26,0.3) 50%, rgba(26,26,26,0.8) 100%)',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(26,26,26,0.08)',
        'card-hover': '0 8px 40px rgba(26,26,26,0.16)',
        'orange': '0 4px 20px rgba(255,122,0,0.3)',
        'gold': '0 4px 20px rgba(201,162,39,0.3)',
        'glass': '0 8px 32px rgba(26,26,26,0.12)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
