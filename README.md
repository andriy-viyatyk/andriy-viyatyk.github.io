# andriy-viyatyk.github.io

Source of **https://andriy-viyatyk.github.io/** — demos, documentation and posts for
[Persephone](https://github.com/andriy-viyatyk/persephone),
[persephone-boards](https://github.com/andriy-viyatyk/persephone-boards),
[ai-vision](https://github.com/andriy-viyatyk/ai-vision) and
[av-grid](https://github.com/andriy-viyatyk/av-grid).

Built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build) and the
[starlight-blog](https://github.com/HiDeoo/starlight-blog) plugin. Every push to `main` builds and
deploys through `.github/workflows/deploy.yml`.

## Layout

```
src/content/docs/        Markdown/MDX pages; the folder is the URL
  index.mdx              home page
  persephone/            /persephone/...
  ai-vision/             /ai-vision/...
  grid/                  /grid/...   (av-grid docs; /av-grid/ itself is the av-grid repo's live demo)
  blog/                  /blog/...   posts (date, authors, tags in frontmatter)
src/pages/boards/        /boards/ gallery and one page per board, generated from the
                         persephone-boards catalog (boards-manifest.json) at build time
src/components/          DemoClip (looping clip) and YouTube (click-to-play video)
astro.config.mjs         site title, sidebar, blog settings
```

Path rule: a repo with its own GitHub Pages site owns `/<repo-name>/`, so this site must not put
pages there (that is why av-grid docs live under `/grid/`).

## Demo media (videos, GIFs)

Media is **not in git**. Files are assets of the `media` release in this repo; the deploy workflow
downloads them into `public/media/`, so pages reference them as `/media/<file>`.

```sh
gh release upload media my-clip.mp4 --clobber   # add or replace a file
gh workflow run deploy.yml                      # publish it
npm run media                                   # get the files locally for npm run dev
```

In an `.mdx` page:

```mdx
import DemoClip from '../../../components/DemoClip.astro';
import YouTube from '../../../components/YouTube.astro';

<DemoClip src="my-clip.mp4" poster="my-clip.jpg" caption="What it shows" />
<YouTube id="dQw4w9WgXcQ" title="A longer walkthrough" />
```

Short clips: MP4 rather than GIF (several times smaller). Long videos with sound: YouTube.

## Commands

```sh
npm install
npm run media     # optional: download demo media
npm run dev       # http://localhost:4321
npm run build     # into dist/
```
