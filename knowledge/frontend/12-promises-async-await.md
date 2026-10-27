# Promises & async/await

**Promise states:** pending → fulfilled | rejected. Settled means it's either fulfilled or rejected.

```js
// Sequential (each awaits the previous)
const a = await fetchA();
const b = await fetchB(a);

// Parallel (both in-flight simultaneously)
const [a, b] = await Promise.all([fetchA(), fetchB()]);

// First settled
const result = await Promise.race([fetchA(), timeout(5000)]);

// All settled (never rejects)
const results = await Promise.allSettled([fetchA(), fetchB()]);
```

**Error handling:** Use try/catch with async/await; or `.catch()` on promise chains.

**Common mistake:** Forgetting to await in a loop:
```js
// Wrong — all fired, but you don't await them
items.forEach(async item => await process(item));
// Correct
for (const item of items) { await process(item); }
// Or parallel: await Promise.all(items.map(process));
```

tags: JavaScript, async, await, promises, Promise.all, error handling
