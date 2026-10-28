const DEFAULT_THEME = "light";
export const VERSION = "0.1.0";

export function getTheme() {
  return localStorage.getItem("spacechat-theme_1") || DEFAULT_THEME;
}

// Apply theme to #main
export const applyTheme = (theme: string): void => {
  localStorage.setItem("spacechat-theme", theme);
  document.getElementById("main")?.setAttribute("data-theme", theme);
};

export function setDefaultTheme() {
  applyTheme(getTheme());
}
