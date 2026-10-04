## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Demo videos

The site's demo videos (`ai-vision-demo.mp4`, `boards-todo-demo.mp4`, `persephone-platform.mp4`, `av-grid-demo.mp4`, `persephone-home.mp4`, `persephone-site-extensions.mp4`) are made with Remotion in
[`video/`](video/README.md); `persephone-torrent-demo.mp4`, `persephone-workspace-demo.mp4` and `persephone-install-board-demo.mp4` are real
recordings made with Persephone's own recorder and a scripted cursor overlay, against a demo data profile (their recipes are in the same README). To update one, read [video/README.md](video/README.md) first. It has
each video's source, the Persephone features it shows, how its screenshots and agent session were
captured, and how to render and publish. Don't recreate a video from scratch.

The pages show each video as a looping **GIF** (`<name>.gif`, made by `video/scripts/gif.mjs` after every
render); the MP4 and poster stay in the `media` release as the master copy.

## ai-vision model

Every page publishes an ai-vision model (`window.__aiVision`) for agents driving Persephone's browser:
[`src/scripts/site-model.ts`](src/scripts/site-model.ts), loaded by the `Head` override in
[`src/components/Head.astro`](src/components/Head.astro), with its page and board index built by
[`src/pages/ai-vision/site-index.json.ts`](src/pages/ai-vision/site-index.json.ts). It is documented for
readers on [`/ai-vision/this-site/`](src/content/docs/ai-vision/this-site.mdx); keep that page's table in step
when you change the model. Test it from Persephone: open the page with `pages.openUrlInBrowserTab`
and call `pages["<id>"].editor.app`. `search()` needs the built site (`astro build` + `astro preview`).
