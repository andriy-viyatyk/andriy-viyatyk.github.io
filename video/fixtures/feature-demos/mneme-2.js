// Mneme demo, scene 2: add the field-notes folder as a root. The native folder picker is a separate
// OS window the recording cannot show, so this scene answers it with C:\Demo\field-notes; the
// root-name prompt that follows is Persephone's own dialog.
const { sleep, vis, byText, rect } = __ws;
const bs = String.fromCharCode(92);
if (window.__REC) await app.window.screen.recording.resume();
await sleep(1500);
const add = vis('[data-name="mneme-add-root"]');
const roots = rect(add.parentElement);
__demo.show({ x: 0, y: roots.y - 4, w: roots.x + roots.w + 4, h: roots.h + 8 }, 'Add a folder of notes', 'Any folder of Markdown files becomes a knowledge base. Your files stay where they are', 'below', 2);
await __demo.move(rect(add).x + 30, rect(add).y + rect(add).h / 2, 1000);
await sleep(3600);
__demo.hide();
window.__fsOrig = window.__fsOrig || app.fs.showFolderDialog;
app.fs.showFolderDialog = async () => { app.fs.showFolderDialog = window.__fsOrig; await sleep(400); return ['C:' + bs + 'Demo' + bs + 'field-notes']; };
const r = rect(add);
await __demo.move(r.x + 30, r.y + r.h / 2, 300);
await __demo.ripple();
add.setAttribute('data-demo-t', '1');
app.window.screen.click('[data-demo-t="1"]');
let dialog;
for (let i = 0; i < 40 && !(dialog = vis('[data-name="input-dialog"]')); i++) await sleep(150);
add.removeAttribute('data-demo-t');
await sleep(900);
const ok = [...dialog.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Add');
__demo.show(rect(dialog), 'Name the root', 'Agents address documents as {root}/{path}, for example field-notes/howto/battery.md', 'below', 4);
await __demo.move(rect(ok).x + 20, rect(ok).y + rect(ok).h / 2, 900);
await sleep(3800);
__demo.hide();
await __ws.click(ok, { dx: 20 });
for (let i = 0; i < 80; i++) { await sleep(250); if (/8 docs/.test(document.body.innerText)) break; }
await sleep(1200);
const title = byText(document.body, 'field-notes');
let card = title;
while (card.parentElement && rect(card).w < 1000) card = card.parentElement;
__demo.show(rect(card), 'Indexed in seconds', 'A watcher keeps the index in sync as files change on disk. Click the root to search it', 'below', 4);
await __demo.move(rect(title).x + 40, rect(title).y + rect(title).h / 2, 1000);
await sleep(4200);
__demo.hide();
await __ws.click(title, { dx: 40 });
await sleep(1800);
window.__m2done = true;
return 'scene 2 done';
