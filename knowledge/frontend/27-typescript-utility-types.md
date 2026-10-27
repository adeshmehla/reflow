# TypeScript Utility Types

Built-in mapped types that transform existing types:

```ts
type User = { id: number; name: string; email: string; role: 'admin' | 'user' };

Partial<User>        // all props optional
Required<User>       // all props required
Readonly<User>       // all props readonly
Pick<User, 'id'|'name'>   // keep subset
Omit<User, 'email'>       // remove subset
Record<string, User>      // key → value map
Exclude<'a'|'b'|'c', 'a'>  // remove from union → 'b'|'c'
Extract<'a'|'b', 'a'|'c'>  // keep intersection → 'a'
NonNullable<string | null>  // remove null/undefined
ReturnType<typeof fn>       // infer return type of function
Parameters<typeof fn>       // infer parameter tuple
Awaited<Promise<string>>    // unwrap promise → string
```

**Template literal types:**
```ts
type EventName = `on${Capitalize<string>}`; // 'onClick', 'onChange', ...
```

tags: TypeScript, utility types, Partial, Omit, Pick, mapped types, conditional types
