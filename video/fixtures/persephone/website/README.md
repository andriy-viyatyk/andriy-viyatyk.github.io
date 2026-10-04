# Website

A small static site: product pages, a contact form, and a JSON product list.

## How a page is built

```mermaid
flowchart LR
    A[products.json] --> B[build script]
    B --> C[index.html]
    C --> D[GitHub Pages]
    E[styles.css] --> C
```

## To do

- [x] Product list
- [ ] Contact form
- [ ] Dark theme
