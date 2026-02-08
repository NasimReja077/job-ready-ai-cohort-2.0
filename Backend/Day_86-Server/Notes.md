
## 1. Program Server to Respond to Users

### What is a Server?

A **server** is a program that:

- Listens for requests from clients (browser, mobile app, Postman)
- Processes the request
- Sends back a response

In web development, servers usually respond via **HTTP**.

---

### Basic Express Server Code

```jsx
const express =require('express');
const app =express();

// Route
app.get('/',(req, res) => {
    res.send('Hello User, Server is working!');
});

// Start server
app.listen(3000,() => {
console.log('Server running on port 3000');
});

```

### Explanation

- `express()` → creates the server
- `app.get()` → handles GET requests
- `req` → request object (data from user)
- `res` → response object (data sent back)
- `listen()` → starts the server

---

## 2. Deploy Server (Basic Understanding)

### What is Deployment?

Deployment means:

> Making your server available on the internet, not just localhost.
> 

### Common Platforms

- Render
- Railway
- Vercel (mostly frontend)
- AWS / DigitalOcean (advanced)

### Basic Deployment Steps (Conceptual)

1. Push code to GitHub
2. Connect GitHub repo to hosting service
3. Add environment variables
4. Build & start server
Displaying Day 86 Notes.md.