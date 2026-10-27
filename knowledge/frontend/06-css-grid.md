# CSS Grid Layout

Grid is a two-dimensional layout system for rows and columns simultaneously.

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
  gap: 16px;
}
```

**Key properties:**
- `grid-template-columns / rows` – define track sizes.
- `fr` unit – fraction of available space.
- `minmax(min, max)` – flexible but bounded tracks.
- `auto-fill` vs `auto-fit` – fill creates empty tracks; fit collapses them.
- `grid-area` – name a cell for semantic placement.

**When to use grid vs flexbox:** Grid for 2D layouts; Flexbox for 1D (row or column). They compose well — nest flex inside grid cells.

tags: CSS, grid, layout, responsive, flexbox
