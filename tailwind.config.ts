import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}', './public/**/*.html'],
  theme: {
    extend: {
      colors: {
        background: '#f9f9fb',
        'on-background': '#1a1c1d',
        surface: '#f9f9fb',
        'surface-bright': '#f9f9fb',
        'surface-dim': '#d9dadc',
        'surface-variant': '#e2e2e4',
        'surface-container': '#eeeef0',
        'surface-container-low': '#f3f3f5',
        'surface-container-high': '#e8e8ea',
        'surface-container-highest': '#e2e2e4',
        'surface-container-lowest': '#ffffff',
        primary: '#000666',
        'primary-container': '#1a237e',
        'primary-fixed': '#e0e0ff',
        'primary-fixed-dim': '#bdc2ff',
        'on-primary': '#ffffff',
        'on-primary-container': '#8690ee',
        'on-primary-fixed': '#000767',
        'on-primary-fixed-variant': '#343d96',
        secondary: '#006e1c',
        'secondary-container': '#91f78e',
        'secondary-fixed': '#94f990',
        'secondary-fixed-dim': '#78dc77',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#00731e',
        'on-secondary-fixed': '#002204',
        'on-secondary-fixed-variant': '#005313',
        tertiary: '#251900',
        'tertiary-container': '#3f2d00',
        'tertiary-fixed': '#ffdf9e',
        'tertiary-fixed-dim': '#fabd00',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#c09000',
        'on-tertiary-fixed': '#261a00',
        'on-tertiary-fixed-variant': '#5b4300',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',
        outline: '#767683',
        'outline-variant': '#c6c5d4',
        'inverse-surface': '#2f3132',
        'inverse-on-surface': '#f0f0f2',
        'inverse-primary': '#bdc2ff',
        'surface-tint': '#4c56af'
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif']
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        '2xl': '0.75rem',
        full: '9999px'
      },
      boxShadow: {
        soft: '0 24px 48px rgba(26, 28, 29, 0.06)',
        glow: '0 0 0 0 rgba(148, 249, 144, 0.4)'
      }
    }
  },
  plugins: []
};

export default config;
