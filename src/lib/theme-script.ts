/** Inline FOUC-prevention script for theme (server-rendered only). */
export const themeInitScript = `(function(){try{var k='eg-theme';var t=localStorage.getItem(k)||'system';var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var r=t==='dark'||(t!=='light'&&d);var e=document.documentElement;e.classList.toggle('dark',r);e.style.colorScheme=r?'dark':'light';}catch(e){}})();`;
