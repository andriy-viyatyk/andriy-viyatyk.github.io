# Budget board

Read-only viewer for monthly `*.budget.csv` files (columns `date,category,item,amount`).
It is the default editor for that mask (`editorPriority: 60`, `editorKind: "content-host"`),
so opening such a file shows: the month total, the top category, the daily average, a
spending-by-category bar chart, and the biggest expenses.

## Files
- `board-manifest.json` — file mask, editor kind, all permissions false (a viewer needs none).
- `index.html` — layout and styles (`--p-*` theme variables, `board-base.css`).
- `app.js` — CSV parsing (`analyze`), rendering, Chart.js theming, ai-vision `.app` model.
- `lib/chart.umd.js` (Chart.js 4.4.6) + `chart-theme.js` (Persephone recommended theme adapter).

## How it works
- Content comes from `persephone.host.getContent()`; `host.onContentChange` re-renders when the
  file is edited in another editor. The board never calls `setContent`, so it never writes.
- `.app` model (`BudgetApp`): `month`, `total`, `expenseCount`, `categories[i|name]`,
  `topExpenses(n)`, plus highlightable elements `month-total`, `category-chart`, `top-expenses`.

## Gotchas
- Manifest edits (masks, priority) apply only after toggling trust or restarting Persephone.
- After editing `app.js`/`index.html`, reload with `pages[pageId].editor.reload()`.
