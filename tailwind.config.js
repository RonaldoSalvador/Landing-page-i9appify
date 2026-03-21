/** @type {import('tailwindcss').Config} */

// Generate safelist for dynamic color classes used in CRM pages
const dynamicColors = ['emerald', 'blue', 'yellow', 'red', 'purple', 'orange', 'cyan', 'gray', 'green', 'pink', 'indigo', 'teal']
const dynamicOpacities = ['5', '10', '20', '30']
const safelist = []

dynamicColors.forEach(color => {
  // Base classes
  safelist.push(`text-${color}-400`, `text-${color}-500`, `text-${color}-600`)
  safelist.push(`bg-${color}-500`, `bg-${color}-600`)
  safelist.push(`border-${color}-500`)
  // With opacities
  dynamicOpacities.forEach(op => {
    safelist.push(`bg-${color}-500/${op}`)
    safelist.push(`border-${color}-500/${op}`)
    safelist.push(`text-${color}-500/${op}`)
  })
  // Dark variants
  safelist.push(`dark:text-${color}-400`, `dark:text-${color}-500`)
  safelist.push(`dark:bg-${color}-500/10`, `dark:bg-${color}-500/20`)
  safelist.push(`dark:border-${color}-500/30`)
  // Hover
  safelist.push(`hover:bg-${color}-500/10`, `hover:bg-${color}-500/20`, `hover:bg-${color}-500/30`)
  safelist.push(`hover:text-${color}-500`, `hover:text-${color}-400`)
})

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist,
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Pipedrive-inspired palette
        'pipe': {
          'bg': '#0d1117',
          'card': '#161b22',
          'border': '#30363d',
          'accent': '#3fb950',
          'blue': '#58a6ff',
          'orange': '#f78166',
        }
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
        'pulse-subtle': 'pulseSubtle 2s infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
