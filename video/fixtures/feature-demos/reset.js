const sleep = ms => new Promise(r=>setTimeout(r,ms));
for (const p of [...app.pages.all]) { try { await app.pages.closePage(p.id); } catch (e) { console.log(e.message); } await sleep(150); }
await sleep(500);
for (const i of [1,2,3,4,5,6]) { try { app.ui.alerts.close(i); } catch {} }
app.window.menuBar.close(); window.resizeTo(864, 645); await sleep(400);
return app.pages.all.map(p=>p.title);
