import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem("reflow_theme");
      if (stored === "light" || stored === "dark") return stored;
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
        return "light";
      }
    } catch {}
    return "dark";
  });

  const setTheme = (t) => {
    setThemeState(t);
    try {
      localStorage.setItem("reflow_theme", t);
    } catch {}
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
