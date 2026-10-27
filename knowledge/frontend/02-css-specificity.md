# CSS Specificity

Specificity determines which CSS rule applies when multiple rules target the same element. Calculated as a (a, b, c) triple:

- a = inline styles (weight 1000)
- b = IDs (weight 100)
- c = classes, attributes, pseudo-classes (weight 10)
- d = elements, pseudo-elements (weight 1)

`!important` overrides all specificity but should be avoided. Use it only as a last resort.

**Selector examples (low → high specificity):**
```
p { }                  /* 0,0,0,1 */
.card { }              /* 0,0,1,0 */
#header { }            /* 0,1,0,0 */
style="..."            /* 1,0,0,0 */
```

**Tip:** Prefer low-specificity selectors (classes) for maintainable styles. Avoid nesting more than 3 levels deep.

tags: CSS, specificity, selectors, cascade, styling
