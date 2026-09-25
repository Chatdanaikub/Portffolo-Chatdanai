/**
 * themes.js - Official Single Portfolio Theme (Cosmic Sapphire & Electric Blue)
 * Locked to match portfoilo.pdf
 */
document.documentElement.setAttribute('data-theme', 'sapphire');

try {
  localStorage.removeItem('profolio_active_theme');
  localStorage.removeItem('profolio_active_theme_v2');
} catch (e) {}

const ThemeManager = {
  setTheme: () => {},
  getTheme: () => 'sapphire'
};
