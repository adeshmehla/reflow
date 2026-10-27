# JavaScript Event Loop

JavaScript is single-threaded. The event loop coordinates asynchronous work without blocking the main thread.

**Components:**
- **Call stack** – executes synchronous code frame by frame.
- **Heap** – memory allocation for objects.
- **Task queue (macrotask)** – setTimeout, setInterval, I/O callbacks.
- **Microtask queue** – Promise .then, queueMicrotask, MutationObserver.

**Execution order per tick:**
1. Run one macrotask.
2. Drain all microtasks.
3. Render if needed.
4. Repeat.

**Key insight:** Microtasks always run before the next render frame. Long synchronous work blocks the UI — move heavy computation to a Web Worker.

tags: JavaScript, async, event loop, promises, concurrency
