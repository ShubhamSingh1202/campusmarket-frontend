// frontend/js/theme.js
// Dark/Light mode toggle functionality

// Get current theme from localStorage or default to light
function getCurrentTheme() {
  return localStorage.getItem('theme') || 'light';
}

// Set theme
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  updateThemeIcon(theme);
}

// Toggle theme
function toggleTheme() {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
}

// Update theme toggle button icon
function updateThemeIcon(theme) {
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.innerHTML = theme === 'light' ? '🌙' : '☀️';
    themeToggle.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`);
  }
}

// Initialize theme on page load
function initTheme() {
  const theme = getCurrentTheme();
  setTheme(theme);
}

// Call on page load
document.addEventListener('DOMContentLoaded', initTheme);