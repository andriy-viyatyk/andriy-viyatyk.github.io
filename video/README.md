# Site videos

The demo videos on this site are made here with [Remotion](https://www.remotion.dev) (React →
MP4). They are **not screen recordings**: each one is a set of screenshots of the real app, plus
animated captions, typing terminals, chat bubbles and camera zooms written as React scenes. So a
video can be updated by editing text or swapping one screenshot, instead of re-recording everything.

| Video | Composition | Source | On the site | Render |
|---|---|---|---|---|
| `ai-vision-demo.mp4` | `AiVision` | [src/ai-vision/AiVision.tsx](src/ai-vision/AiVision.tsx) | `/ai-vision/` ([page](../src/content/docs/ai-vision/index.mdx)) | `npm run render:ai-vision` |
| `boards-todo-demo.mp4` | `BoardsTodo` | [src/boards/BoardsTodo.tsx](src/boards/BoardsTodo.tsx) | `/persephone/boards/` ([page](../src/content/docs/persephone/boards/index.mdx)) | `npm run render:boards-todo` |
| `persephone-platform.mp4` | `Platform` | [src/persephone/Platform.tsx](src/persephone/Platform.tsx) | `/persephone/` ([page](../src/content/docs/persephone/index.mdx)) | `npm run render:platform` |
| `av-grid-demo.mp4` | `AvGrid` | [src/av-grid/AvGrid.tsx](src/av-grid/AvGrid.tsx) | `/grid/` ([page](../src/content/docs/grid/index.mdx)) | `npm run render:av-grid` |
| `persephone-home.mp4` | `HomeLoop` | [src/persephone/HomeLoop.tsx](src/persephone/HomeLoop.tsx) | `/` ([page](../src/content/docs/index.mdx)) | `npm run render:home` |

`persephone-demo.mp4`, the author's own screen capture, was the home-page clip before
`persephone-home.mp4`. It is still in the `media` release as a backup.

## Layout

```
video/
  src/kit.tsx          shared building blocks (see below); start every new video from these
  src/Root.tsx         registers each video as a <Composition> (1440x1080, 30 fps, 4:3)
  src/<video>/*.tsx    one file per video: a list of scenes, each with a duration in frames
  public/*.png         screenshots used by the scenes (committed; 1296x968)
  fixtures/<video>/    the data and boards the screenshots were taken from (committed)
  scripts/finish.mjs   faststart + poster JPEG; runs after every render script
  out/                 render output and test stills (git-ignored)
```

Run `npm install` once and `npm run studio` to scrub through the videos in a browser preview.

### kit.tsx

- `palette`, `sans`, `mono`, `tween` — colors, fonts and a clamped, eased interpolate.
- `ScenePlayer` / `SceneDef` / `totalDuration` — a video is `SceneDef[]`, played back to back.
- `Scene` — fades a scene in and out. `Appear`, `Swap` — fade and slide a child in and out at frames.
- `Caption` (lower-third, or `top`) — a one-line explanation. Keep it short enough to fit one line.
- `Terminal` — a command typed out, then output lines. Use it for real `call` text from the MCP tool.
- `ChatBubble` (`who: 'user' | 'agent'`), `Thinking` — conversation. User text types; agent lines fade in.
- `StepLog` — the agent's tool calls as a growing checklist (`✓`, `✗` for an error, spinner).
- `Shot` / `ShotSequence` — a screenshot seen through a camera. A `CameraKey` says which image
  point (in screenshot pixels) sits at the frame center, and at what zoom; the camera eases between
  keys. `ShotSequence` cross-fades screenshots taken from the same window, so the UI seems to change
  in place. `marks` draw pulsing rings around image regions (`at`, optional `until`).
- `SHOT_W`/`SHOT_H`/`FULL` — screenshots are 1296x968; `FULL` is the whole screenshot.

## Workflow

1. **Capture** screenshots of a clean Persephone window (see the next section) into `public/`.
2. **Write scenes** in `src/<video>/`, using text that the app or agent actually produced (shorten
   it; don't invent output).
3. **Review stills** before rendering the whole video. They are fast and show framing problems:
   `npx remotion still <Composition> out/st/f600.png --frame=600`. Check: captions on one line,
   rings on target, the camera not cropping important UI, nothing overlapping.
4. **Render**: `npm run render:<video>` → `out/<name>.mp4` plus `out/<name>.jpg` (poster).
   Remotion reports the pixel format as yuvj420p even with `--pixel-format yuv420p`; browsers play it.
5. **Show the author for review** before publishing (open the MP4 in Persephone).
6. **Publish** (below).

## Capturing screenshots from Persephone

Persephone is driven through its MCP `call` tool (the `mcp__persephone__call` tool in Claude Code).

- **Always use a separate, clean window.** The author's main window has personal and work tabs,
  and the sidebar lists work boards. None of that may appear in a video, so never screenshot
  window 0. Open a fresh window on a harmless file:
  `call("window.openNew", ["<scratch>/start.md"])` returns its index `N`; prefix every later path
  with `windows[N].`.
- **Size it to 1296x968** (inner size; the window is frameless, so inner = outer). All camera keys
  assume that size:
  `call("windows[N].script.execute", ["window.resizeTo(1296, 968); await new Promise(r=>setTimeout(r,300)); return [innerWidth, innerHeight];"])`.
  If it doesn't report 1296x968, call it again.
- **Screenshot**: the screenshot data is base64, so decode it before writing:
  `call("windows[N].script.execute", ["const s = await app.window.screen.screenshot(); await app.fs.writeBinary('C:/projects/andriy-viyatyk.github.io/video/public/NAME.png', Buffer.from(s.data, 'base64')); return 'ok';"])`.
  Read the PNG back to check it, for example for a leftover hover state.
- **Clearing UI state**: a board `highlight` overlay goes away with `pages[i].editor.reload()`.
  A hovered row stays hovered after a click, so move the pointer with `pages[i].editor.hover(...)`
  onto something neutral before the screenshot.
- **Data must be generic**: no names, emails, real tasks, Reddit content or work boards (the
  organization forbids PII in any output). Use the fixtures below.
- **Clean up afterwards**: close the window (`windows[N].window.close`), and stop any local web
  server you started. Persephone keeps a closed window's tabs in its list of closed windows; tell
  the author it is there.

## Recipe: ai-vision (`AiVision`, 77 s)

**What it shows** (re-check these when the matching Persephone features change):
the single `call` tool and the root overview (`call()` with no path); path segments
(`pages[0].editor.app.items`, with `.app` living in the board); a board's ai-vision model (the
built-in **todo** board opened on a `.todo.json` file: `TodoApp`, `highlight`, `addItem`); a web
page that exposes its model (`pages[1].editor.app` → `DemoApp`, `addItem`); self-correcting errors
(`boards.open` → use `boards.openBoard`; `setTagColor` rejects hex, takes named colors); the
architecture (one resolver on the host; boards and web pages send only their model's shape).

**Screenshots**: `win-1-before.png`, `win-2-highlight.png`, `win-3-after.png` (the todo board),
`web-1.png`, `web-2.png` (the web page).

1. Copy [fixtures/ai-vision/launch.todo.json](fixtures/ai-vision/launch.todo.json) to a scratch
   folder. It is the state *before* the shoot: list "Site launch", tags `docs` (dodgerblue) and
   `video` (hotpink), four items. Open it in the clean window: `call("windows[N].pages.openFile", [path])`.
   It opens in the todo board.
2. `win-1-before`: take the screenshot as it is.
   `win-2-highlight`: call `windows[N].page.editor.app.highlight` with `["quick-add-input", "Type a title here and press Enter"]`.
   `win-3-after`: call `editor.reload()`, then `app.addItem("Make the ai-vision video", "Site launch")` and `app.setItemTag(<id>, "video")`.
3. Web page: in a clone of `github.com/andriy-viyatyk/ai-vision` (here `C:\projects\ai-vision`),
   run `npx http-server -p 4319 -c-1 --silent .` in the background. Then open
   `windows[N].pages.openUrlInBrowserTab("http://localhost:4319/examples/demo-page/index.html", {incognito: true})`.
   The page calls `expose(model)`, so its model is at `pages[1].editor.app` (`DemoApp`).
   `web-1`: before. `web-2`: after `app.addItem("Explain how ai-vision works", "video")`.
   Scroll with `editor.evaluate("window.scrollTo(0, 330)")` if the list is off screen.
4. Terminal text in the scenes is real `call` output, shortened. If the API changed, run the same
   calls again and update the `Terminal` lines and the error scene.

## Recipe: boards todo (`BoardsTodo`, 84 s)

**What it shows**: a real agent session. A user asks for a todo board, and Claude reads
`guides.agents.boards`, creates the board (`boards.createBoard`), adds SortableJS from the
recommended-components catalog, writes `index.html`/`style.css`/`app.js` with an ai-vision `.app`
model, opens it (`boards.openBoard`), and tests it through the model and a real click. A
follow-up request adds priorities and due dates; the agent edits the board, reloads it (the tasks
survive) and checks the result. Screenshots: `todo-1.png` (first version), `todo-2.png` (after
the follow-up).

The chat bubbles and `StepLog` steps in `BoardsTodo.tsx` are the agent's real replies and tool
calls, shortened. They are listed in `ASK`, `FOLLOW_UP`, `BUILD_STEPS`, `FOLLOW_UP_STEPS` and the
two agent `ChatBubble`s.

**Re-recording the session** (when board creation, the guide, or the bridge changes enough that
the steps are wrong):

1. Open a clean 1296x968 window `N` (above) and make an empty scratch folder `<dir>/boards`.
2. Start a separate general-purpose agent (Claude Code `Agent` tool, run in the background) with
   this prompt, filling in `N` and `<dir>`. Keep the same user wording, so the video's chat stays
   valid:

   > You are an AI agent working with the Persephone app through the `mcp__persephone__call` MCP
   > tool (load it via ToolSearch "select:mcp__persephone__call" first). This session is being
   > recorded for a demo video, so act like a normal agent serving this user request:
   >
   > USER REQUEST: "Create a small todo board for me in Persephone. I want to add tasks, mark them
   > done, and see how many are left."
   >
   > Rules: work ONLY in Persephone window N (prefix every path with `windows[N].`). Create the
   > board in `<dir>\boards`, named "My Todo". Build it yourself (do not install a board from the
   > published catalog). Learn how via `guides.agents.boards` and node `$help`, and use the
   > recommended components/skins. Open the board in window N and verify it renders and works.
   > Seed 4–5 generic example tasks ("Write release notes", "Review pull requests", "Update the
   > docs site", …), one done. No personal data. Leave the board page open and active.
   >
   > When finished, reply with REPLY (the 3–6 line chat reply you'd give the user) and LOG (8–15
   > significant tool calls, each `path (short args) → one-line result`, under ~90 characters;
   > include real error/correction moments). Stay available for a follow-up request.

3. Take `todo-1.png`. Then send the follow-up to the same agent (`SendMessage`):

   > USER FOLLOW-UP: "Looks great! Can you add priorities — High / Medium / Low with a colored tag
   > on each task — and an optional due date? Show overdue tasks in red, and keep high-priority
   > tasks at the top."
   >
   > Same rules. Give a few example tasks priorities and due dates, at least one overdue and one
   > due today or tomorrow (today is <date>). Move the pointer off the task list so no row is
   > hovered. Reply with REPLY and LOG again (6–12 entries).

4. Take `todo-2.png`, put the new REPLY/LOG text into `BoardsTodo.tsx`, and fix the ring `marks`
   (screenshot pixel coordinates) if the layout moved.

**Retaking only the screenshots** (the session is still accurate and only the look changed):
[fixtures/boards-todo/My Todo](fixtures/boards-todo/My%20Todo) is the board as it was after the
follow-up. Copy it to a scratch folder, `boards.registerBoard` it (the author confirms trust),
open it, and seed it through its model. The tasks live in the page state, not in files:

```
addTask("Write release notes", "high", "<yesterday>")
addTask("Update the docs site", "high", "<tomorrow>")
addTask("Review pull requests", "medium", "<two days ago>")  → then toggleTask(id)
addTask("Plan next sprint", "medium", "<today>")
addTask("Clean up old branches", "low")
```

That gives `todo-2.png`. For `todo-1.png` (no priorities), use the git history of `todo-1.png` or
re-record the session.

## Recipe: Persephone platform (`Platform`, 95 s)

**What it shows**: the plain-notepad look (a `.txt` in Monaco); built-in editors with the
editor-switch control — Markdown preview with Mermaid, JSON as text and as Grid (JSON),
Excalidraw (`.excalidraw` opens in the bundled Excalidraw board); folders opened as **workspace
tabs** (`pages.openFile(folder)`), each with its own Explorer; the user + agent shared-window idea;
and a real agent session building a board that is a **custom editor for a file type**
(`fileMasks: ["*.budget.csv"]`, `editorPriority` 60 > Grid (CSV) 20), so the file opens in it by
default and the switch shows `Text Editor | Grid (CSV) | Budget`.

**Screenshots**: `p-notepad.png`, `p-ws-website.png` (README preview), `p-json-text.png`,
`p-json-grid.png`, `p-excalidraw.png` — taken while only `todo.txt` and the website tab were open;
`p-ws-website2.png`, `p-ws-budget.png` (three tabs, CSV as text) — before the agent session;
`p-budget-viewer.png` (September in Budget), `p-budget-aug.png` (August opened afterwards — it
opens straight in Budget).

**Setup**: [fixtures/persephone/](fixtures/persephone) is copied to `C:\Demo` (a neutral path, since
the Explorer shows it): `todo.txt`, `website/` (README with a Mermaid chart, `data/products.json`,
`site-map.excalidraw`, html/css), `home-budget/` (two generated `*.budget.csv` months, `notes.md`).
`home-budget/.persephone/boards/Budget` is the board the agent built — **delete it before
re-recording the session** (and `boards.unregisterBoard` it), or the CSV already opens in Budget.

1. Open a clean 1296x968 window on `C:\Demo\todo.txt` → `p-notepad`.
2. `pages.openFile("C:\Demo\website")` (workspace tab), then
   `pages.navigatePageTo(id, "C:\Demo\website\README.md")` → `p-ws-website`;
   `…\data\products.json` → `p-json-text`; `page.editorSwitches.switchTo("grid-json")` → `p-json-grid`;
   `…\site-map.excalidraw`, wait ~4 s → `p-excalidraw`. Excalidraw marks the file modified on load;
   when navigating away, answer the Unsaved Changes dialog with **Don't Save**.
   The sketch's coordinates are tuned to sit below Excalidraw's toolbar at this window size.
3. Navigate the website tab back to README; `pages.openFile("C:\Demo\home-budget")` and navigate
   it to `2026-09.budget.csv` → `p-ws-budget`; show the website tab → `p-ws-website2`.
4. Show the budget tab and run the agent session (separate background agent):

   > You are an AI agent working with the Persephone app through the `mcp__persephone__call` MCP
   > tool (load it via ToolSearch "select:mcp__persephone__call" first). This session is being
   > recorded for a demo video, so act like a normal agent serving this user request:
   >
   > USER REQUEST: "I keep my monthly expenses in *.budget.csv files (like the one open in my
   > home-budget workspace). Make me a viewer for them: spending by category as a chart, the
   > month's total, and the biggest expenses. It should open right away when I open one of these
   > files."
   >
   > Rules: work ONLY in window N (prefix paths with `windows[N].`; read guides with the
   > `windowIndex: N` parameter, `windows[N].guides` does not resolve). The workspace is
   > C:\Demo\home-budget; the CSV page is `pages["<id>"]`. Put the board where the boards guide
   > recommends for project boards (`…\.persephone\boards\`), named "Budget". Build it as a custom
   > editor for `*.budget.csv`, the default editor for those files, using the recommended
   > components (chart.js + its theme), with a small ai-vision `.app` model. Verify the CSV opens
   > in it, screenshot to check, leave that page active with the Explorer visible. Don't modify the
   > CSV files. No personal data. Reply with REPLY (3–6 lines) and LOG (8–14 entries,
   > `path → result`, under ~90 chars, including real errors).

5. Screenshot → `p-budget-viewer`; navigate the tab to `2026-08.budget.csv` → `p-budget-aug`.
6. Put the agent's REPLY/LOG into `ASK`, `BUILD_STEPS`, `REPLY` in `Platform.tsx` (shortened).
   Backslashes in those strings must be doubled (`\`), or JavaScript eats them (`\b` is a backspace).

## Recipe: av-grid (`AvGrid`, 90 s)

Not a Persephone video: it shows the standalone library. The screenshots are the bare web page,
with no Persephone chrome, taken with the browser page's own `editor.screenshot()`.

**What it shows**: the one-line minimum call; a rich grid of 100,000 rows: `render` cells (pills,
status dots, ▲/▼ growth, progress bars, stars), column `group` headers, `pinned` left/right
columns, `footerRows` totals, `selectColumn`, and `rowClass` for muted rows; scrolling to row
99,000 with the pinned columns holding, plus the README's measured numbers (~6 ms first paint,
60 fps, 2 cells per drag move); range selection by real drag; the context menu with the Copy as…
submenu; paste (`pasteText`) of a 5×2 block from one focused cell, with Growth and Total
recomputed; the `options` dropdown editor; the filter popover, the filter-chip bar, sorting, search
highlighting, and the totals row following the filter; the dark theme from `--p-*` tokens; and a
card listing the seven hooks and the main options.

**Page**: [fixtures/av-grid/showcase.html](fixtures/av-grid/showcase.html). It imports
`av-grid@2.12.1` from jsDelivr and works over `file://`; `?theme=dark` switches the tokens.
It holds 100,000 generated products with a fixed seed, so every capture has the same rows. Its
`onEdit` recomputes the derived columns and the totals row; `onVisibleRowsChange` makes the
totals row sum only the visible rows.

**Capture**: `window.openNew()` → window N, then `script.execute` `window.resizeTo(1340,1046)`. That
makes the browser page area exactly 1296x968; check with `editor.evaluate("() => [innerWidth,
innerHeight]")`. Do not use `setViewport`: emulating a size larger than the webview tiles the
screenshot. `pages.openUrlInBrowserTab("file:///…/showcase.html")`. In a `script.execute`, get the
editor with `app.pages.findPage(id).editor` (`pages` is not a script global) and save with
`app.fs.writeBinary(path, Buffer.from((await ed.screenshot()).data, "base64"))`. Cells are addressed as
`[data-row="R"][data-column-key="key"]`.

| Shot | How |
|---|---|
| `g-grid` | fresh load |
| `g-scroll` | `grid.scrollToRow(98990,"top")`, then the scroller's `scrollLeft = 10000` |
| `g-range-a`, `g-range` | `ed.drag(row 3 q1Units → row 6 q1Revenue)`, then `→ row 9 q2Revenue` (real drag) |
| `g-menu`, `g-menu2` | `ed.click(cell, {button:"right"})`; `ed.hover('[data-id="avg-copy-as"]')` opens the submenu |
| `g-paste-a`, `g-paste` | reload; click row 12 q2Units; `grid.pasteText("36\t8388\n52\t7644\n470\t83190\n455\t85085\n392\t36064")` |
| `g-dropdown` | click row 5 status, `pressKey("Enter")` |
| `g-filter-pop` | reload; `grid.showFilterPopover("category")` (do not await it), tick Gaming |
| `g-filter` | Escape; `applyFilter` category `["Gaming"]`, region `["North","East"]`; `setSort({key:"total",direction:"desc"})` |
| `g-search` | `ed.type("#search","pro")` |
| `g-dark` | `?theme=dark`; `grid.setSelected(["2","4","5"])`; drag row 8 q1Units → row 13 q2Revenue; blur, then hover `h1` |

The clipboard is never touched, so the user's OS clipboard stays as it was: paste goes through
`pasteText`, and the menu is only opened, never clicked. The render uses `--crf 25`, not 20: the
dense table screenshots made a 36 MB file at 20, and 17.5 MB at 25 looks the same.

## Recipe: home loop (`HomeLoop`, 45 s)

**What it shows**: a silent loop for the home page, which plays it like a GIF: autoplay, loop, no
controls. Eight screens cross-fade, each with a feature card that springs in at the bottom left:
the notepad with a title card; the website workspace, zoomed on the **Explorer**, then panned to
Markdown + Mermaid; JSON as a grid; Excalidraw; the workspace **Boards panel** (zoom), then the
Color Palette board; the Budget viewer, zoomed on the editor switch; the built-in browser on the
site's board catalog; and the notepad again with a closing card. The last frame equals the first,
so the loop has no jump. Every frame number in the file is global, and each slide has its own
camera keys.

**Screenshots**: it reuses `p-notepad`, `p-ws-website`, `p-json-grid`, `p-excalidraw` and
`p-budget-viewer` from the Platform recipe, plus two of its own:

- `h-palette.png`: `C:\Demo\website` as a workspace tab with **Boards** open in its Explorer
  (`panels.explorer.openBoards()`). The Color Palette board (a copy of the author's, in
  `C:\Demo\website\.persephoneboards\Color Palette`) is opened by clicking its row in the panel.
  `pages.navigatePageTo(id, boardFolder)` opens the folder as text, so don't use it.
  `boards.registerBoard` shows a trust dialog the author has to click. A Demo board
  (`boards.createDemoBoard`) is next to it in the panel.
- `h-browser.png`: a browser tab on `https://andriy-viyatyk.github.io/boards/`.

**Render**: `npm run render:home`. It makes the MP4 (crf 23, ~7 MB), the poster and
`out/persephone-home.gif`, which comes from [scripts/gif.mjs](scripts/gif.mjs). The GIF is a
two-pass palette encode, 560 px at 12 fps, ~13.5 MB. It is for places where video does not play
(a GitHub README); the site uses the MP4. A sharp GIF at full column width would be 35–40 MB.
Remotion's ffmpeg has no `fps` filter, so the script sets the frame rate with `-r`.

## Publishing

Video files are not in git. They are assets of the GitHub release `media`, and the deploy
workflow downloads them into `public/media/` on every build.

1. Back up the asset you are replacing:
   `gh release download media -p '<name>.*' -D <scratch>/old --clobber`.
2. Upload it: `gh release upload media out/<name>.mp4 out/<name>.jpg --clobber` (keep the file name
   when you replace a video, so the page needs no change).
3. On the page, add or update `<DemoClip src="<name>.mp4" poster="<name>.jpg" controls caption="…" />`
   (`.mdx` only; rename a `.md` page to `.mdx` and import `DemoClip`).
4. Commit and push. The push deploys; if only the media changed, run `gh workflow run deploy.yml`.
5. Check the deploy (`gh run watch`), then
   `curl -sI https://andriy-viyatyk.github.io/media/<name>.mp4`. Its `Content-Length` must match the new file.
