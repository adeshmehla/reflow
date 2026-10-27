# TypeScript Generics

Generics allow you to write reusable, type-safe code that works with any type.

```ts
function identity<T>(value: T): T {
  return value;
}

// Generic constraint
function getLength<T extends { length: number }>(arg: T): number {
  return arg.length;
}

// Generic with default
type ApiResponse<T = unknown> = {
  data: T;
  error: string | null;
};
```

**Common patterns:**
- `keyof T` – union of a type's keys.
- `T[K]` – lookup type.
- `Partial<T>`, `Required<T>`, `Readonly<T>`, `Pick<T, K>`, `Omit<T, K>` – built-in utility types.
- Conditional types: `T extends U ? X : Y`.
- Infer: extract a type from within a conditional.

tags: TypeScript, generics, types, utility types, type safety
