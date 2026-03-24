"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: "light",
    toggleTheme: () => { },
    setTheme: () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("light");

    // İlk yüklemede localStorage veya sistem tercihini oku
    useEffect(() => {
        const stored = localStorage.getItem("vesto-theme") as Theme | null;
        if (stored) {
            setThemeState(stored);
            document.documentElement.classList.toggle("dark", stored === "dark");
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setThemeState("dark");
            document.documentElement.classList.add("dark");
        }
    }, []);

    function setTheme(newTheme: Theme) {
        setThemeState(newTheme);
        localStorage.setItem("vesto-theme", newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
    }

    function toggleTheme() {
        setTheme(theme === "light" ? "dark" : "light");
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
