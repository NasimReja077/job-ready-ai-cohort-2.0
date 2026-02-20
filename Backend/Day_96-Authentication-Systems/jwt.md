
## 1. Hashing (Passwords)

### What is Hashing?

Hashing is a **one-way cryptographic process** that converts data (like a password) into a **fixed-length string**.

- Cannot be reversed
- Same input → same output
- Used to store passwords securely

### Why Hash Passwords?

If the database is hacked:

- Plain passwords→ fully exposed
- Hashed passwords → original password not readable

---

### Code Explanation (Line by Line)

```jsx
const hash = crypto.createHash("md5")
```

- Creates a **hashing object**
- `"md5"` is the hashing algorithm (Message Digest 5) **MD5 is NOT secure for real apps** (used here only for learning)

---

```jsx
.update(password)
```

- Takes the `password` string
- Feeds it into the hash function

Example:

```jsx
password ="123456"
```

---

```jsx
.digest("hex")
```

- Finalizes the hashing process
- Converts binary hash → readable **hexadecimal string**

---

### Final Result

```jsx
password ="123456"
hash ="e10adc3949ba59abbe56e057f20f883e"
```

This hash is what you store in the database

Never store the original password

---

---

## 2. Cookies

### What is a Cookie?

A cookie is **small data stored in the browser** and sent with every request.

### Why Cookies?

- Maintain **login sessions**
- Store **JWT token**
- Track user state

---

### Example (Backend – Express)

```jsx
res.cookie("token", jwtToken, {httpOnly:true,secure:true,sameSite:"strict"
})
```

### Important Cookie Flags

| Flag | Purpose |
| --- | --- |
| `httpOnly` | JS cannot access → XSS protection |
| `secure` | Only sent over HTTPS |
| `sameSite` | CSRF protection |

---

### Cookie Flow

1. User logs in
2. Server sends cookie
3. Browser stores cookie
4. Cookie auto-sent on every request

---

## 3. Token (JWT)

### What is a Token?

A token is a **string that proves identity**.

Most common: **JWT (JSON Web Token)**

---

### JWT Structure

```
HEADER.PAYLOAD.SIGNATURE
```

Example:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Why Use Tokens?

- Stateless authentication
- No server session storage
- Easy to scale

JWT Flow

1. Login → server creates JWT
2. JWT stored in cookie or localStorage
3. Client sends token with request
4. Server verifies token

---

### Token Verification Example

```jsx
jwt.verify(token, process.env.JWT_SECRET)
```

- Checks token validity
- Decodes user data
- Protects routes
Displaying JWT.md.