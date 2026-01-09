/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primitive Colors
                gray: {
                    0: '#FFFFFF',
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    300: '#CBD5E1',
                    400: '#94A3B8',
                    500: '#64748B',
                    600: '#475569',
                    700: '#334155',
                    800: '#1E293B',
                    900: '#0F172A',
                    950: '#020617',
                },
                cyan: {
                    400: '#00D4AA',
                    500: '#00B894',
                    600: '#009D7E',
                },
                blue: {
                    400: '#0088FF',
                    500: '#0070E0',
                },
                red: {
                    400: '#FF4757',
                    500: '#E63946',
                },
                orange: {
                    400: '#FFB800',
                    500: '#E0A100',
                },
                purple: {
                    400: '#A855F7',
                    500: '#9333EA',
                },
            },
            fontFamily: {
                sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
            },
            borderRadius: {
                'xs': '4px',
                'sm': '6px',
                'md': '8px',
                'lg': '12px',
                'xl': '16px',
                '2xl': '24px',
            },
            boxShadow: {
                'glow-cyan': '0 0 20px rgba(0, 212, 170, 0.3)',
                'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
                'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
                'card': '0 4px 24px rgba(0, 0, 0, 0.3)',
                'elevated': '0 8px 40px rgba(0, 0, 0, 0.5)',
            },
            backdropBlur: {
                'glass': '16px',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 20px rgba(0, 212, 170, 0.3)' },
                    '100%': { boxShadow: '0 0 40px rgba(0, 212, 170, 0.6)' },
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
