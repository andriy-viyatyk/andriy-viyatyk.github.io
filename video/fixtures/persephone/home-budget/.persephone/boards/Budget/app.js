// Budget board — custom editor (content-host) for *.budget.csv files.
// Columns: date,category,item,amount. Read-only viewer: it never writes the file.
const P = window.persephone;
const T = window.PersephoneChartTheme;
const TOP_COUNT = 8;

const emptyData = (error = "") => ({ rows: [], categories: [], total: 0, month: "", days: 0, error });
let data = emptyData();
let chart = null;
let palette = ["#4ea1ff"];

// ---------- parsing ----------
function parseCsvLine(line) {
    const out = [];
    let cur = "";
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (quoted) {
            if (ch === "\"" && line[i + 1] === "\"") { cur += "\""; i++; }
            else if (ch === "\"") quoted = false;
            else cur += ch;
        } else if (ch === "\"") quoted = true;
        else if (ch === ",") { out.push(cur); cur = ""; }
        else cur += ch;
    }
    out.push(cur);
    return out.map((s) => s.trim());
}

function analyze(text) {
    const lines = String(text || "").replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
    if (!lines.length) return emptyData();
    const head = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
    const dateCol = head.indexOf("date");
    const catCol = head.indexOf("category");
    const itemCol = head.indexOf("item");
    const amountCol = head.indexOf("amount");
    if (catCol < 0 || amountCol < 0) return emptyData("Expected columns: date, category, item, amount.");

    const rows = [];
    for (const line of lines.slice(1)) {
        const f = parseCsvLine(line);
        const amount = parseFloat(f[amountCol]);
        if (!isFinite(amount)) continue;
        rows.push({
            date: dateCol >= 0 ? f[dateCol] : "",
            category: f[catCol] || "Other",
            item: itemCol >= 0 ? f[itemCol] : "",
            amount,
        });
    }
    const byCat = new Map();
    for (const r of rows) {
        const c = byCat.get(r.category) || { name: r.category, total: 0, count: 0 };
        c.total += r.amount;
        c.count++;
        byCat.set(r.category, c);
    }
    const total = rows.reduce((s, r) => s + r.amount, 0);
    const categories = [...byCat.values()]
        .sort((a, b) => b.total - a.total)
        .map((c) => ({ ...c, total: round(c.total), share: total ? round((c.total / total) * 100, 1) : 0 }));
    const dates = rows.map((r) => r.date).filter(Boolean).sort();
    const month = dates.length ? dates[0].slice(0, 7) : "";
    let days = 0;
    if (/^\d{4}-\d{2}$/.test(month)) {
        const [y, m] = month.split("-").map(Number);
        days = new Date(y, m, 0).getDate();
    }
    return { rows, categories, total: round(total), month, days, error: "" };
}

const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
const money = (n) => n.toLocaleString(undefined, { style: "currency", currency: "USD" });
const topExpenses = (n = TOP_COUNT) => [...data.rows].sort((a, b) => b.amount - a.amount).slice(0, n);
const monthLabel = (ym) => {
    if (!/^\d{4}-\d{2}$/.test(ym)) return "Budget";
    const [y, m] = ym.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
};
const colorFor = (cat) => {
    const i = data.categories.findIndex((c) => c.name === cat);
    return palette[(i < 0 ? 0 : i) % palette.length];
};

// ---------- rendering ----------
const $ = (id) => document.getElementById(id);

function render() {
    $("title").textContent = monthLabel(data.month);
    $("subtitle").textContent = data.error ? "" : `${data.rows.length} expenses · ${data.categories.length} categories`;
    if (data.error) {
        $("total").textContent = "—";
        $("total-note").textContent = data.error;
    } else {
        $("total").textContent = money(data.total);
        $("total-note").textContent = `across ${data.rows.length} expenses`;
    }
    const top = data.categories[0];
    $("top-cat").textContent = top ? top.name : "—";
    $("top-cat-note").textContent = top ? `${money(top.total)} · ${top.share}% of the month` : "";
    $("daily").textContent = data.days ? money(data.total / data.days) : "—";
    $("daily-note").textContent = data.days ? `over ${data.days} days` : "";

    const list = $("top");
    list.textContent = "";
    for (const r of topExpenses()) {
        const li = document.createElement("li");
        li.innerHTML = "<div><div class=\"item-name\"></div><div class=\"item-meta\"><span class=\"dot\"></span>"
            + "<span class=\"cat\"></span><span>·</span><span class=\"date\"></span></div></div><div class=\"amount\"></div>";
        li.querySelector(".item-name").textContent = r.item || r.category;
        li.querySelector(".dot").style.background = colorFor(r.category);
        li.querySelector(".cat").textContent = r.category;
        li.querySelector(".date").textContent = r.date;
        li.querySelector(".amount").textContent = money(r.amount);
        list.appendChild(li);
    }
    renderChart();
    if (P && P.setStatusText) {
        P.setStatusText(data.error ? "Not a budget file" : `${data.rows.length} expenses · total ${money(data.total)}`);
    }
    refreshAiVision();
}

function renderChart() {
    const labels = data.categories.map((c) => c.name);
    const values = data.categories.map((c) => c.total);
    const colors = data.categories.map((_, i) => palette[i % palette.length]);
    if (chart) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = values;
        chart.data.datasets[0].backgroundColor = colors;
        chart.update();
        return;
    }
    chart = new Chart($("chart"), {
        type: "bar",
        data: { labels, datasets: [{ data: values, backgroundColor: colors, borderRadius: 4, maxBarThickness: 26 }] },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const c = data.categories[ctx.dataIndex];
                            return ` ${money(c.total)} · ${c.share}% · ${c.count} expense${c.count === 1 ? "" : "s"}`;
                        },
                    },
                },
            },
            scales: {
                x: { beginAtZero: true, ticks: { callback: (v) => money(Number(v)).replace(/\.00$/, "") } },
                y: { grid: { display: false } },
            },
        },
    });
}

// Re-theme from the live palette (never a cached persephone.theme after a switch).
function applyTheme(theme) {
    if (!T || !theme) return;
    T.applyDefaults(Chart, theme);
    // Base hues from the theme; extra categories get the base hues blended toward the
    // text color (paletteN blends toward the accent, which repeats the accent for #7).
    const base = T.palette(theme);
    const text = T.vars(theme)["--p-text"] || base[0];
    const n = Math.max(8, data.categories.length);
    palette = Array.from({ length: n }, (_, i) =>
        i < base.length ? base[i] : T.mix(base[i % base.length], text, 0.45));
    if (chart) { chart.destroy(); chart = null; }
}

// ---------- ai-vision model (pages[id].editor.app) ----------
let remote = null;
let lastShape = null;

const categoryNode = (c) => ({
    aiVision: {
        kind: "BudgetCategory",
        summary: "One spending category of the month.",
        members: [
            { name: "name", kind: "property", summary: "Category name as written in the CSV." },
            { name: "total", kind: "property", summary: "Sum of the category's amounts." },
            { name: "share", kind: "property", summary: "Percent of the month total (0-100)." },
            { name: "count", kind: "property", summary: "Number of expenses in the category." },
        ],
        summarize: () => ({ ...c }),
    },
    name: c.name,
    total: c.total,
    share: c.share,
    count: c.count,
});

const categoriesNode = {
    aiVision: {
        kind: "BudgetCategories",
        summary: "Categories sorted by total, largest first. Index by position or by category name.",
        members: [{ name: "length", kind: "property", summary: "Number of categories." }],
        index: (key) => {
            const c = typeof key === "number"
                ? data.categories[key]
                : data.categories.find((x) => x.name.toLowerCase() === String(key).toLowerCase());
            return c ? categoryNode(c) : undefined;
        },
        summarize: () => data.categories.map((c) => ({ name: c.name, total: c.total, share: c.share })),
    },
    get length() { return data.categories.length; },
};

function setupAiVision() {
    const aiVision = P && P.aiVision;
    if (!aiVision) return;
    const declarations = [
        { name: "month-total", view: "main", purpose: "The month's total spending.", where: "First card at the top left." },
        { name: "category-chart", view: "main", purpose: "Bar chart of spending by category.",
          where: "Large card under the totals, on the left." },
        { name: "top-expenses", view: "main", purpose: "The biggest single expenses of the month, largest first.",
          where: "Card to the right of the chart." },
    ];
    const el = aiVision.createElements(declarations);
    const model = {
        aiVision: {
            kind: "BudgetApp",
            summary: "Read-only monthly budget summary of the open *.budget.csv file.",
            overview: "Read total, month and categories; call topExpenses(n) for the largest items.\n"
                + "The viewer never edits the file.",
            help: "The Budget board shows one month of expenses from a CSV with columns date,category,item,amount. "
                + "Amounts are summed per category. Everything here is read-only; to change data, edit the CSV "
                + "(switch the page to the text or grid editor).",
            members: [
                { name: "month", kind: "property", summary: "The month as YYYY-MM, taken from the earliest date." },
                { name: "total", kind: "property", summary: "Sum of all amounts in the file." },
                { name: "expenseCount", kind: "property", summary: "Number of expense rows." },
                { name: "categories", kind: "property", node: true, indexable: true,
                  summary: "Per-category totals, largest first; index by position or name." },
                { name: "topExpenses", kind: "method", signature: "topExpenses(n?: number)",
                  summary: "The n largest expenses (default 8) as {date, category, item, amount}." },
                ...el.members,
            ],
            elements: declarations,
            provide: el.provide,
            summarize: () => ({
                kind: "BudgetApp", month: data.month, total: data.total,
                expenses: data.rows.length, categories: data.categories.length,
            }),
        },
        get month() { return data.month; },
        get total() { return data.total; },
        get expenseCount() { return data.rows.length; },
        get categories() { return categoriesNode; },
        topExpenses(n) {
            const count = n == null ? TOP_COUNT : Number(n);
            if (!Number.isInteger(count) || count < 1) throw new Error("topExpenses(n): n must be a positive integer.");
            return topExpenses(count);
        },
    };
    remote = aiVision.expose(model);
}

// expose() probes index(0) once — republish when categories go empty <-> non-empty.
function refreshAiVision() {
    if (!remote || P.view !== "main") return;
    const shape = String(data.categories.length > 0);
    if (shape === lastShape) return;
    lastShape = shape;
    remote.refresh();
}

// ---------- startup ----------
async function load() {
    try {
        data = analyze(await P.host.getContent());
    } catch (e) {
        data = emptyData(String((e && e.message) || e));
    }
    applyTheme(P.getTheme ? await P.getTheme() : P.theme);
    render();
}

if (P) {
    P.onThemeChange((theme) => { applyTheme(theme); render(); });
    P.host.onContentChange((text) => { data = analyze(text); render(); });
    setupAiVision();
    load();
}
