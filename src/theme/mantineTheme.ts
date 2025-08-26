import { createTheme, MantineColorsTuple } from '@mantine/core';

// Use EXACT same colors as design-system.css
const violet: MantineColorsTuple = [
  '#f5f3ff', // --color-primary-50
  '#ede9fe', // --color-primary-100
  '#ddd6fe', // --color-primary-200
  '#c4b5fd', // --color-primary-300
  '#a78bfa', // --color-primary-400
  '#8b5cf6', // --color-primary-500 (MAIN)
  '#7c3aed', // --color-primary-600
  '#6d28d9', // --color-primary-700
  '#5b21b6', // --color-primary-800
  '#4c1d95', // --color-primary-900
];

const gray: MantineColorsTuple = [
  '#fafafa', // --color-gray-50
  '#f4f4f5', // --color-gray-100
  '#e4e4e7', // --color-gray-200
  '#d4d4d8', // --color-gray-300
  '#a1a1aa', // --color-gray-400
  '#71717a', // --color-gray-500
  '#52525b', // --color-gray-600
  '#3f3f46', // --color-gray-700
  '#27272a', // --color-gray-800
  '#18181b', // --color-gray-900
];

export const theme = createTheme({
  primaryColor: 'violet',
  colors: { violet, gray },
  white: '#fafafa',
  black: '#18181b',
  fontFamily: 'Inter, system-ui, sans-serif',
  headings: { fontFamily: 'Inter, system-ui, sans-serif' },
  radius: {
    xs: '4px',
    sm: '8px', 
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
});