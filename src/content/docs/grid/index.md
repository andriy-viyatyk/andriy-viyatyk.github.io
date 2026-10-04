---
title: av-grid
description: A dependency-free, framework-agnostic virtualized data grid built for 100,000+ rows.
sidebar:
  label: Overview
  order: 1
---

**av-grid** is the data grid from [Persephone](/persephone/), extracted into a standalone library.
It is virtualized and renders straight to the DOM, with **no runtime dependencies and no
framework**, and it handles **100,000+ rows** while you scroll, select a range or edit.

**[▶ Live demo](https://andriy-viyatyk.github.io/av-grid/)** — seventeen examples in the browser, including a 100,000-row benchmark
you can run yourself.

```js
import { AVGrid } from "av-grid";

const grid = AVGrid.create("#host", { rows: data });
```

That is the whole minimum call. Columns, header labels, widths, data types, alignment and row keys
are all inferred from the rows.

Source and full documentation: [github.com/andriy-viyatyk/av-grid](https://github.com/andriy-viyatyk/av-grid).
