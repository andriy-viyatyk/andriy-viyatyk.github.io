// My Todo — a single-view todo list with priorities and optional due dates.
// Tasks persist in the board page's state (persephone.state restorable keys),
// so no file or other permission is needed.
const P = window.persephone;
const FILTERS = ["all", "active", "done"];
const PRIORITIES = ["high", "medium", "low"];          // display order: High on top
const PRIORITY_LABEL = { high: "High", medium: "Medium", low: "Low" };
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

let tasks = [];          // [{ id, title, done, priority, due }] — due is "YYYY-MM-DD" or null
let filter = "all";
let remote = null;
let lastShape = null;

const $ = (id) => document.getElementById(id);
const listEl = $("tasks");
const input = $("new-task");
const prioritySelect = $("new-priority");
const dueInput = $("new-due");

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const find = (id) => tasks.find((t) => t.id === id);
const leftCount = () => tasks.filter((t) => !t.done).length;

// ---------- dates & priorities ----------
const pad = (n) => String(n).padStart(2, "0");
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayIso = () => isoDate(new Date());
const tomorrowIso = () => { const d = new Date(); d.setDate(d.getDate() + 1); return isoDate(d); };
const isOverdue = (t) => !t.done && !!t.due && t.due < todayIso();
const isSoon = (t) => !t.done && (t.due === todayIso() || t.due === tomorrowIso());
const overdueCount = () => tasks.filter(isOverdue).length;
const rank = (t) => PRIORITIES.indexOf(t.priority);

function dueLabel(t) {
    if (!t.due) return "+ due date";
    if (t.due === todayIso()) return "Due today";
    if (t.due === tomorrowIso()) return "Due tomorrow";
    const [y, m, d] = t.due.split("-").map(Number);
    const text = new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return isOverdue(t) ? `Overdue · ${text}` : `Due ${text}`;
}
function normalizePriority(value) {
    const p = String(value == null || value === "" ? "medium" : value).toLowerCase();
    if (!PRIORITIES.includes(p)) throw new Error(`Unknown priority '${value}'; use one of: ${PRIORITIES.join(", ")}.`);
    return p;
}
function normalizeDue(value) {
    if (value == null || value === "") return null;
    const s = String(value);
    if (!DATE_RE.test(s)) throw new Error(`Due date '${value}' must be YYYY-MM-DD, or null / "" to clear it.`);
    return s;
}
// Older saved tasks predate priority/due: give them defaults.
const upgrade = (t) => ({ ...t, priority: PRIORITIES.includes(t.priority) ? t.priority : "medium", due: t.due || null });

// Display order: priority first (High on top), the user's manual order within a priority.
const ordered = () => tasks.map((t, i) => [t, i])
    .sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1])
    .map((pair) => pair[0]);
const visible = () => ordered().filter((t) => filter === "all" || (filter === "done") === t.done);

function save() {
    if (P && P.state) P.state.merge({ tasks, filter });
}

function changed() {
    save();
    render();
    refreshAiVision();
}

// ---------- operations (shared by the UI and the agent model) ----------
function addTask(title, priority, due) {
    const text = String(title == null ? "" : title).trim();
    if (!text) throw new Error("addTask needs a non-empty title.");
    const task = { id: newId(), title: text, done: false, priority: normalizePriority(priority), due: normalizeDue(due) };
    tasks.push(task);
    changed();
    return task.id;
}
function requireTask(id) {
    const t = find(id);
    if (!t) throw new Error(`Unknown task id '${id}'. Read items to see the ids.`);
    return t;
}
function setDone(id, done = true) { requireTask(id).done = !!done; changed(); return true; }
function toggleTask(id) { const t = requireTask(id); t.done = !t.done; changed(); return t.done; }
function setPriority(id, priority) { requireTask(id).priority = normalizePriority(priority); changed(); return true; }
function setDue(id, due) { requireTask(id).due = normalizeDue(due); changed(); return true; }
function cyclePriority(id) {
    const t = requireTask(id);
    t.priority = PRIORITIES[(rank(t) + 1) % PRIORITIES.length];
    changed();
}
function removeTask(id) { requireTask(id); tasks = tasks.filter((t) => t.id !== id); changed(); return true; }
function clearDone() { const n = tasks.length - leftCount(); tasks = tasks.filter((t) => !t.done); changed(); return n; }
function setFilter(value) {
    if (!FILTERS.includes(value)) throw new Error(`Unknown filter '${value}'; use one of: ${FILTERS.join(", ")}.`);
    filter = value;
    changed();
}

// ---------- rendering ----------
function render() {
    const shown = visible();
    listEl.replaceChildren(...shown.map((t) => {
        const li = document.createElement("li");
        li.className = "task" + (t.done ? " done" : "") + (isOverdue(t) ? " overdue" : "");
        li.dataset.id = t.id;
        li.innerHTML = `<span class="drag-handle" title="Drag to reorder">⋮⋮</span>
            <input type="checkbox" ${t.done ? "checked" : ""} title="Mark done" />
            <span class="prio prio-${t.priority}" title="Priority: click to change">${PRIORITY_LABEL[t.priority]}</span>
            <span class="title"></span>
            <span class="due${t.due ? "" : " empty-due"}${isSoon(t) ? " soon" : ""}" title="Click to set the due date">${dueLabel(t)}</span>
            <button class="p-btn ghost icon sm remove" title="Delete task">✕</button>`;
        li.querySelector(".title").textContent = t.title;
        return li;
    }));
    const empty = $("empty");
    empty.hidden = shown.length > 0;
    empty.textContent = tasks.length === 0
        ? "Nothing here yet — add your first task above."
        : filter === "done" ? "No finished tasks yet." : "All done — nice work!";

    const left = leftCount();
    const done = tasks.length - left;
    const overdue = overdueCount();
    $("left-count").textContent = String(left);
    $("left-label").textContent = left === 1 ? "task left" : "tasks left";
    $("done-count").textContent = tasks.length ? `· ${done} of ${tasks.length} done` : "";
    $("overdue-count").textContent = overdue ? `· ${overdue} overdue` : "";
    $("progress-fill").style.width = tasks.length ? `${(done / tasks.length) * 100}%` : "0";
    $("clear-done").disabled = done === 0;
    document.querySelectorAll("[data-filter]").forEach((b) =>
        b.classList.toggle("selected", b.dataset.filter === filter));
}

// Swap a task's due label for a date picker; commit on change, restore on blur/Escape.
function editDue(li) {
    const t = find(li.dataset.id);
    const label = li.querySelector(".due");
    if (!t || !label) return;
    const picker = document.createElement("input");
    picker.type = "date";
    picker.className = "p-input sm due-input";
    picker.value = t.due || "";
    label.replaceWith(picker);
    picker.focus();
    try { picker.showPicker(); } catch { /* not all hosts allow it; the field is still editable */ }
    picker.addEventListener("change", () => setDue(t.id, picker.value || null));
    picker.addEventListener("blur", () => render());
    picker.addEventListener("keydown", (e) => { if (e.key === "Escape") render(); });
}

// ---------- UI wiring ----------
$("add-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!input.value.trim()) return;
    addTask(input.value, prioritySelect.value, dueInput.value || null);
    input.value = "";
    dueInput.value = "";
    input.focus();
});
listEl.addEventListener("click", (e) => {
    const li = e.target.closest(".task");
    if (!li) return;
    if (e.target.closest(".remove")) removeTask(li.dataset.id);
    else if (e.target.closest(".prio")) cyclePriority(li.dataset.id);
    else if (e.target.closest(".due")) editDue(li);
    else if (e.target.matches("input[type=checkbox]") || e.target.closest(".title")) toggleTask(li.dataset.id);
});
document.querySelectorAll("[data-filter]").forEach((b) =>
    b.addEventListener("click", () => setFilter(b.dataset.filter)));
$("clear-done").addEventListener("click", () => clearDone());

if (window.Sortable) {
    new Sortable(listEl, {
        handle: ".drag-handle",
        animation: 150,
        forceFallback: true,
        onEnd: (evt) => {
            // Dropping a task among another priority's tasks adopts that priority,
            // so High always stays on top. Then reorder the visible subset in place.
            const moved = find(evt.item.dataset.id);
            const neighbor = evt.item.previousElementSibling || evt.item.nextElementSibling;
            if (moved && neighbor) moved.priority = find(neighbor.dataset.id).priority;
            const order = [...listEl.children].map((li) => li.dataset.id);
            const shownIds = new Set(order);
            const queue = order.map(find);
            tasks = tasks.map((t) => (shownIds.has(t.id) ? queue.shift() : t));
            changed();
        },
    });
}

// Native date pickers follow the app theme.
function applyColorScheme(theme) {
    if (theme) document.documentElement.style.colorScheme = theme.isDark ? "dark" : "light";
}
if (P && P.onThemeChange) P.onThemeChange(applyColorScheme);
else if (P && P.theme) applyColorScheme(P.theme);

// ---------- agent model (pages[i].editor.app) ----------
const summaryOf = (t) => ({
    id: t.id, title: t.title, done: t.done, priority: t.priority, due: t.due, overdue: isOverdue(t),
});
const makeItem = (id) => ({
    aiVision: {
        kind: "TodoTask",
        summary: "One task. Pass its id to toggleTask / setDone / setPriority / setDue / removeTask.",
        members: [
            { name: "id", kind: "property", summary: "Stable task id." },
            { name: "title", kind: "property", summary: "The task text." },
            { name: "done", kind: "property", summary: "Whether the task is finished." },
            { name: "priority", kind: "property", summary: "high | medium | low." },
            { name: "due", kind: "property", summary: "Due date as YYYY-MM-DD, or null." },
            { name: "overdue", kind: "property", summary: "True when unfinished and the due date is before today." },
        ],
        summarize: () => { const t = find(id); return t ? summaryOf(t) : undefined; },
    },
    get id() { return find(id)?.id; },
    get title() { return find(id)?.title; },
    get done() { return find(id)?.done; },
    get priority() { return find(id)?.priority; },
    get due() { return find(id)?.due; },
    get overdue() { const t = find(id); return t ? isOverdue(t) : undefined; },
});
const itemsNode = {
    aiVision: {
        kind: "TodoTasks",
        summary: "All tasks in display order (High priority first; ignores the view filter). Index by position or by id.",
        members: [{ name: "count", kind: "property", summary: "Number of tasks." }],
        index: (key) => {
            const all = ordered();
            if (typeof key === "number") return all[key] ? makeItem(all[key].id) : undefined;
            if (typeof key === "string") return find(key) ? makeItem(key) : undefined;
            return undefined;
        },
        summarize: () => ordered().map(summaryOf),
    },
    get count() { return tasks.length; },
};

function refreshAiVision() {
    if (!remote || (P.view && P.view !== "main")) return;
    const shape = String(tasks.length > 0);
    if (shape === lastShape) return;
    lastShape = shape;
    remote.refresh();
}

function exposeModel() {
    const aiVision = P && P.aiVision;
    if (!aiVision) return;
    const declarations = [
        { name: "new-task", view: "main", purpose: "Type a task title and press Enter to add it.", where: "Top of the board." },
        { name: "new-priority", view: "main", purpose: "Priority for the next added task.", where: "Right of the input." },
        { name: "new-due", view: "main", purpose: "Optional due date for the next added task.", where: "Right of the priority." },
        { name: "add-task", view: "main", purpose: "Adds the typed task.", where: "End of the add row." },
        { name: "summary", view: "main", purpose: "How many tasks are left and overdue, with a progress bar.", where: "Under the add row." },
        { name: "task-list", view: "main", purpose: "Tasks: click to toggle done, click the tag to change priority, click the date to set it, drag the handle to reorder.", where: "Main area." },
        { name: "filter-all", view: "main", purpose: "Show all tasks.", where: "Toolbar." },
        { name: "filter-active", view: "main", purpose: "Show only unfinished tasks.", where: "Toolbar." },
        { name: "filter-done", view: "main", purpose: "Show only finished tasks.", where: "Toolbar." },
        { name: "clear-done", view: "main", purpose: "Remove all finished tasks.", where: "Toolbar, right." },
    ];
    const el = aiVision.createElements(declarations);
    const model = {
        aiVision: {
            kind: "MyTodoApp",
            summary: "A todo list with priorities and due dates: add tasks, mark them done, see how many are left.",
            overview: "Read items for the tasks, remaining / overdue for counts.\nCall addTask(title, priority?, due?), toggleTask(id), setPriority(id, p), setDue(id, date).",
            members: [
                { name: "items", kind: "property", node: true, indexable: true, summary: "All tasks in display order (High first)." },
                { name: "remaining", kind: "property", summary: "Number of unfinished tasks." },
                { name: "overdue", kind: "property", summary: "Number of unfinished tasks past their due date." },
                { name: "total", kind: "property", summary: "Number of tasks." },
                { name: "today", kind: "property", summary: "Today's date (YYYY-MM-DD) as the board sees it." },
                { name: "filter", kind: "property", writable: true, summary: "View filter: all | active | done." },
                { name: "addTask", kind: "method", signature: "addTask(title: string, priority?: \"high\"|\"medium\"|\"low\", due?: string)", summary: "Add a task (priority defaults to medium, due is YYYY-MM-DD or omitted); returns its id." },
                { name: "toggleTask", kind: "method", signature: "toggleTask(id: string)", summary: "Flip a task's done state; returns the new state." },
                { name: "setDone", kind: "method", signature: "setDone(id: string, done?: boolean)", summary: "Mark a task done (or not done)." },
                { name: "setPriority", kind: "method", signature: "setPriority(id: string, priority: \"high\"|\"medium\"|\"low\")", summary: "Change a task's priority." },
                { name: "setDue", kind: "method", signature: "setDue(id: string, due: string | null)", summary: "Set a due date (YYYY-MM-DD) or clear it with null." },
                { name: "removeTask", kind: "method", signature: "removeTask(id: string)", summary: "Delete a task.", caution: "Deletes immediately; no undo." },
                { name: "clearDone", kind: "method", signature: "clearDone()", summary: "Delete all finished tasks; returns how many.", caution: "Deletes immediately; no undo." },
                ...el.members,
            ],
            elements: declarations,
            provide: el.provide,
            summarize: () => ({ kind: "MyTodoApp", total: tasks.length, remaining: leftCount(), overdue: overdueCount(), filter }),
        },
        get items() { return itemsNode; },
        get remaining() { return leftCount(); },
        get overdue() { return overdueCount(); },
        get total() { return tasks.length; },
        get today() { return todayIso(); },
        get filter() { return filter; },
        set filter(v) { setFilter(v); },
        addTask, toggleTask, setDone, setPriority, setDue, removeTask, clearDone,
    };
    remote = aiVision.expose(model);
    lastShape = String(tasks.length > 0);
}

// ---------- start ----------
async function start() {
    if (P && P.state) {
        P.state.init({ tasks: [], filter: "all" }, { restorableKeys: ["tasks", "filter"] });
        try {
            const s = await P.state.get();
            if (s && Array.isArray(s.tasks)) tasks = s.tasks.map(upgrade);
            if (s && FILTERS.includes(s.filter)) filter = s.filter;
        } catch (e) {
            console.warn("Could not restore tasks:", e);
        }
    }
    render();
    exposeModel();
    input.focus();
}
start();
