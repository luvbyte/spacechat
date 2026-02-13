const DEFAULT_THEME = "caramellatte";
export const VERSION = "0.0.1";

export function getTheme() {
  return localStorage.getItem("spacechat-theme") || DEFAULT_THEME;
}

// Apply theme to #main
export const applyTheme = theme => {
  localStorage.setItem("spacechat-theme", theme);
  document.getElementById("main")?.setAttribute("data-theme", theme);
};

export function setDefaultTheme() {
  applyTheme(getTheme());
}
