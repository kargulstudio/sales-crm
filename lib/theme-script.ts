export const STORAGE_KEY = "theme";
export const LIGHT_QUERY = "(prefers-color-scheme: light)";

export const THEME_SCRIPT = `try{var p=localStorage.getItem("${STORAGE_KEY}");document.documentElement.dataset.theme=p==="light"||p==="dark"?p:matchMedia("${LIGHT_QUERY}").matches?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}`;
