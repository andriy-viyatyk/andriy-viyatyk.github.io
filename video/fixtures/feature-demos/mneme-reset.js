// Mneme demo reset: turn Mneme off and close its pages. Then, with Persephone closed, delete
// %APPDATA%\persephone\data\mneme and C:\Demo\field-notes\.mneme, and start Persephone again:
// the Mneme page opens by itself only once per session, on the first start without a model.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await app.settings.set('mneme.enabled', false);
await sleep(1500);
return app.settings.get('mneme.enabled');
