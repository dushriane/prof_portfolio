import { createTheme, MantineColorsTuple } from '@mantine/core';

// Purple color palette - Chill but Professional
const violet: MantineColorsTuple = [
  '#f5f3ff', // violet-50 - very light backgrounds
  '#ede9fe', // violet-100 - light backgrounds  
  '#ddd6fe', // violet-200 - subtle accents
  '#c4b5fd', // violet-300 - disabled states
  '#a78bfa', // violet-400 - hover states
  '#8b5cf6', // violet-500 - PRIMARY - main brand color
  '#7c3aed', // violet-600 - interactive elements
  '#6d28d9', // violet-700 - pressed states
  '#5b21b6', // violet-800 - dark text
  '#4c1d95', // violet-900 - darkest elements
];

const gray: MantineColorsTuple = [
  '#fafafa', // Warm grays that complement purple
  '#f4f4f5',
  '#e4e4e7',
  '#d4d4d8',
  '#a1a1aa',
  '#71717a',
  '#52525b',
  '#3f3f46',
  '#27272a',
  '#18181b',
];

export const theme = createTheme({
  primaryColor: 'violet',
  colors: {
    violet,
    gray,
  },
  white: '#fafafa',
  black: '#18181b',
  fontFamily: 'Inter, system-ui, sans-serif',
  headings: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '600',
  },
  radius: {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
});
