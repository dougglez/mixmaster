import { createContext, useContext, useEffect, useState } from "react";
import { COLOR_THEMES, TITLE_FONTS } from "@/lib/theme-data";

type Theme = "dark" | "light" | "system";
type ThemeColor = keyof typeof COLOR_THEMES;
type TitleFont = keyof typeof TITLE_FONTS;

type FontWeight = 'light' | 'regular' | 'medium' | 'bold';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultThemeColor?: ThemeColor;
  defaultTitleFont?: TitleFont;
  defaultFontWeight?: FontWeight;
};

type ThemeContextType = {
  theme: Theme;
  themeColor: ThemeColor;
  titleFont: TitleFont;
  fontWeight: FontWeight;
  toggleTheme: () => void;
  setThemeColor: (color: ThemeColor) => void;
  setTitleFont: (font: TitleFont) => void;
  setFontWeight: (weight: FontWeight) => void;
  isDarkMode: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  defaultThemeColor = "purple",
  defaultTitleFont = "lobster",
  defaultFontWeight = "regular"
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || defaultTheme
  );
  
  const [themeColor, setThemeColor] = useState<ThemeColor>(
    () => (localStorage.getItem("themeColor") as ThemeColor) || defaultThemeColor
  );
  
  const [titleFont, setTitleFont] = useState<TitleFont>(
    () => (localStorage.getItem("titleFont") as TitleFont) || defaultTitleFont
  );
  
  const [fontWeight, setFontWeight] = useState<FontWeight>(
    () => (localStorage.getItem("fontWeight") as FontWeight) || defaultFontWeight
  );
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Apply theme (dark/light mode)
  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove("light", "dark");
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      setIsDarkMode(systemTheme === "dark");
    } else {
      root.classList.add(theme);
      setIsDarkMode(theme === "dark");
    }
    
    localStorage.setItem("theme", theme);
  }, [theme]);
  
  // Apply theme color (CSS variables)
  useEffect(() => {
    if (!COLOR_THEMES[themeColor]) return;
    
    const root = window.document.documentElement;
    
    // Set CSS variables for primary and secondary colors
    root.style.setProperty('--color-primary', COLOR_THEMES[themeColor].primary);
    root.style.setProperty('--color-secondary', COLOR_THEMES[themeColor].secondary);
    
    // Convert rgb color values to individual RGB components for use with opacity
    const primaryRgb = COLOR_THEMES[themeColor].primary.match(/\d+/g);
    const secondaryRgb = COLOR_THEMES[themeColor].secondary.match(/\d+/g);
    
    if (primaryRgb && primaryRgb.length >= 3) {
      root.style.setProperty('--color-primary-rgb', `${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}`);
    }
    
    if (secondaryRgb && secondaryRgb.length >= 3) {
      root.style.setProperty('--color-secondary-rgb', `${secondaryRgb[0]}, ${secondaryRgb[1]}, ${secondaryRgb[2]}`);
    }
    
    // For accessible theme, set gradient to use the same color
    if (themeColor === 'accessible') {
      root.classList.add('accessible-theme');
    } else {
      root.classList.remove('accessible-theme');
    }
    
    localStorage.setItem("themeColor", String(themeColor));
  }, [themeColor]);
  
  // Apply title font
  useEffect(() => {
    if (!TITLE_FONTS[titleFont]) return;
    
    const root = window.document.documentElement;
    
    // Remove all font classes
    Object.keys(TITLE_FONTS).forEach(font => {
      root.classList.remove(`font-${font}`);
    });
    
    // Add selected font class
    root.classList.add(`font-${String(titleFont)}`);
    
    localStorage.setItem("titleFont", String(titleFont));
  }, [titleFont]);
  
  // Apply font weight
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all font weight classes
    root.classList.remove('font-light', 'font-regular', 'font-medium', 'font-bold');
    
    // Add selected font weight class
    root.classList.add(`font-${fontWeight}`);
    
    localStorage.setItem("fontWeight", fontWeight);
  }, [fontWeight]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      themeColor, 
      titleFont,
      fontWeight, 
      toggleTheme, 
      setThemeColor, 
      setTitleFont,
      setFontWeight, 
      isDarkMode 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
};
