// src/components/ThemeToggle.tsx
import { useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming your Button component path
import { useLocalStorage } from '@/hooks/useLocalStorage'; // Our modified hook

const STORAGE_KEY = 'theme_dark_mode';
const THEME_EXPIRY_DAYS = 7; // User's theme preference will last for 7 days

const ThemeToggle = () => {
  // Use our enhanced useLocalStorage hook with an expiry
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>(
    STORAGE_KEY,
    false, // Default to light mode
    THEME_EXPIRY_DAYS
  );

  // Effect to apply/remove the 'dark' class to the html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // No need to return a cleanup function for classList, as it's idempotent.
  }, [isDarkMode]); // Re-run effect only when isDarkMode changes

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label="Toggle theme">
      {isDarkMode ? (
        <Sun className="h-5 w-5 transition-all" /> // Icon for dark mode (click to go light)
      ) : (
        <Moon className="h-5 w-5 transition-all" /> // Icon for light mode (click to go dark)
      )}
    </Button>
  );
};

export default ThemeToggle;