import { useTheme } from '../contexts/ThemeContext';
import React from 'react';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { name: 'light' as const, icon: '☀️', label: 'Light' },
    { name: 'dark' as const, icon: '🌙', label: 'Dark' },
    { name: 'auto' as const, icon: '🌓', label: 'Auto' }
  ];

  return (
    <div className="theme-selector">
      {themes.map(themeOption => (
        <button 
          key={themeOption.name}
          className={`theme-option ${theme === themeOption.name ? 'active' : ''}`}
          onClick={() => setTheme(themeOption.name)}
          aria-label={`Switch to ${themeOption.label} theme`}
        >
          <span className="theme-icon">{themeOption.icon}</span>
          <span className="theme-label">{themeOption.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ThemeSelector;