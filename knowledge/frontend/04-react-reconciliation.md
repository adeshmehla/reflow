# React Reconciliation & Fiber

Reconciliation is how React decides what changed between renders and updates the DOM minimally.

**Diffing rules:**
- Elements of different types → tear down the old tree, build a new one.
- Same type → update only changed props.
- Lists → use stable `key` props to preserve component state across reorders.

**Fiber** (React 16+) is the internal unit of work. It makes rendering interruptible — React can pause, abort, or restart render work to keep the UI responsive (time-slicing).

**Practical tips:**
- Never use array index as key when items can reorder or be deleted.
- Avoid creating new object/array references in render that will break shallow equality checks (causes `memo` to miss).
- Use `React.memo`, `useMemo`, `useCallback` only after profiling; premature memoisation adds cognitive cost.

tags: React, reconciliation, Fiber, keys, rendering, performance
