# Web Components

Web Components are a set of browser APIs for creating reusable custom elements.

**Three pillars:**
1. **Custom Elements** – define new HTML tags with lifecycle callbacks.
2. **Shadow DOM** – encapsulated DOM subtree; scoped styles.
3. **HTML Templates** – `<template>` and `<slot>` for lazy rendering.

```js
class MyButton extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>button { color: navy; }</style>
      <button><slot></slot></button>`;
  }
}
customElements.define('my-button', MyButton);
```

**Interop:** Work in any framework. React 19 adds full custom-element support. Use `element-internals` for form participation.

**When to choose:** Framework-agnostic design systems or widgets that need to live in multiple apps. For app-internal components, a framework component is simpler.

tags: web components, custom elements, shadow DOM, browser API, design system
