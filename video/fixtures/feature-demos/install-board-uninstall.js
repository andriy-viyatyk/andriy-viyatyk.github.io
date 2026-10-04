for (const p of [...app.pages.all]) await app.pages.closePage(p.id);
window.__unR = undefined;
app.boards.uninstallBoard('word-viewer').then(r => window.__unR = r, e => window.__unR = 'ERR ' + e.message);
await new Promise(r => setTimeout(r, 1200));
return 'pending';
