# My Todo board

A single-view todo list: add tasks, mark them done, drag to reorder, filter All/Active/Done,
and a "N tasks left" summary with a progress bar.

- `index.html` / `style.css` / `app.js` — the whole board. No backend and no permissions.
- Tasks persist in the board page's state (`persephone.state`, restorable keys `tasks`, `filter`).
- `lib/Sortable.min.js` + `lib/sortablejs.css` — SortableJS 1.15.7 and its Persephone skin from the
  recommended-components catalog, used for drag-reordering. The skin is linked last.
- Each task has a priority (high/medium/low, colored tag; click cycles) and an optional due date
  (`YYYY-MM-DD`; click the label for a picker). The list is sorted High→Low, manual order within a
  priority; dropping a task into another priority group adopts that priority. Unfinished tasks
  past their due date render in `--p-error`; today/tomorrow in `--p-warning`.
- Agent model at `pages[i].editor.app`: `items`, `remaining`, `overdue`, `total`, `today`, `filter`,
  `addTask(title, priority?, due?)`, `toggleTask(id)`, `setDone(id, done)`, `setPriority(id, p)`,
  `setDue(id, date|null)`, `removeTask(id)`, `clearDone()`,
  plus `elements` / `highlight` for the curated controls.

After editing files, reload with `pages[i].editor.reload()`. The generic board reference is in
Persephone at `guides.agents.boards`.
