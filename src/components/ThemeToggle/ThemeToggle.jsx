import { useState, useEffect } from 'react';
import './ThemeToggle.css';

const THEME_STORAGE_KEY = 'theme';
const AUTO_LIGHT_START_HOUR = 6;
const AUTO_DARK_START_HOUR = 18;

function getAutoTheme(now = new Date()) {
  const hour = now.getHours();
  return hour >= AUTO_DARK_START_HOUR || hour < AUTO_LIGHT_START_HOUR ? 'dark' : 'light';
}

function getNextBoundaryDelay(now = new Date()) {
  const nextBoundary = new Date(now);
  const hour = now.getHours();

  if (hour >= AUTO_DARK_START_HOUR) {
    nextBoundary.setDate(now.getDate() + 1);
    nextBoundary.setHours(AUTO_LIGHT_START_HOUR, 0, 0, 0);
  } else if (hour < AUTO_LIGHT_START_HOUR) {
    nextBoundary.setHours(AUTO_LIGHT_START_HOUR, 0, 0, 0);
  } else {
    nextBoundary.setHours(AUTO_DARK_START_HOUR, 0, 0, 0);
  }

  return nextBoundary.getTime() - now.getTime();
}

function ThemeToggle() {
  const [themePreference, setThemePreference] = useState(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored;
    return 'auto';
  });
  const [currentTime, setCurrentTime] = useState(Date.now());
  const resolvedTheme = themePreference === 'auto' ? getAutoTheme(new Date(currentTime)) : themePreference;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    localStorage.setItem(THEME_STORAGE_KEY, themePreference);
  }, [themePreference, resolvedTheme]);

  useEffect(() => {
    if (themePreference !== 'auto') return undefined;

    const timeoutId = setTimeout(() => {
      setCurrentTime(Date.now());
    }, getNextBoundaryDelay(new Date(currentTime)));

    return () => clearTimeout(timeoutId);
  }, [themePreference, currentTime]);

  const toggleTheme = () => {
    setThemePreference((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'auto';
      return 'light';
    });
  };

  const nextTheme = themePreference === 'light' ? 'dark' : themePreference === 'dark' ? 'auto' : 'light';
  const icon = themePreference === 'auto' ? 'A' : resolvedTheme === 'light' ? '\u263E' : '\u2600';
  const modeLabel = themePreference === 'auto'
    ? `Auto (${resolvedTheme})`
    : themePreference;

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Theme: ${modeLabel}. Switch to ${nextTheme} mode`}
      title={`Theme: ${modeLabel}. Switch to ${nextTheme} mode`}
    >
      {icon}
    </button>
  );
}

export default ThemeToggle;
