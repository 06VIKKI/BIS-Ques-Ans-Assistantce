// Applies the saved theme before first paint to avoid a flash.
// Kept as a separate file (not inline) so the server's strict Content-Security-Policy stays intact.
try {
  var t = localStorage.getItem('bis-assist-theme');
  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
} catch (e) {}
