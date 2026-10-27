# Web Security: XSS & CSP

**Cross-Site Scripting (XSS):** Injecting malicious scripts into pages viewed by other users.

**Types:**
- Reflected – payload in URL, reflected in response.
- Stored – payload persisted (e.g., in a database).
- DOM-based – manipulation of the DOM without server involvement.

**Prevention:**
- Never set `innerHTML` from user data; use `textContent` instead.
- Sanitise with DOMPurify before any HTML insertion.
- Escape all user-supplied values in templates.

**Content Security Policy (CSP):** HTTP header that restricts what resources can be loaded:
```
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com
```

**Other essentials:** Set `HttpOnly` and `Secure` on cookies. Use `SameSite=Strict` or `Lax` to prevent CSRF. Avoid `eval()` and `new Function()`.

tags: security, XSS, CSP, CSRF, sanitisation, cookies
