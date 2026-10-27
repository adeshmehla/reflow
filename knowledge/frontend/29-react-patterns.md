# React Composition Patterns

**Compound components** — parent + children share state via context:
```jsx
<Select>
  <Select.Trigger />
  <Select.List>
    <Select.Option value="a">A</Select.Option>
  </Select.List>
</Select>
```

**Render props** — pass a function as a prop that receives state and returns JSX. Largely superseded by hooks.

**Higher-Order Components (HOC)** — function that takes a component and returns an enhanced one. Common in older codebases.

**Controlled vs Uncontrolled components:**
- Controlled: state in React (`value` + `onChange`).
- Uncontrolled: state in the DOM (`defaultValue` + `ref`). Good for file inputs.

**Slot pattern** — pass JSX as a prop for flexible composition:
```jsx
<Card header={<h2>Title</h2>} footer={<Actions />}>Content</Card>
```

**`children` as a function** — flexible, composable, avoids prop drilling.

tags: React, patterns, compound components, HOC, render props, composition, controlled
