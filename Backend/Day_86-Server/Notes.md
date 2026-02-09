
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

---
---
---
                                      ===========
## express vs listen

In the context of building a web application with Express, these two serve completely different roles. Think of **Express** as the "Brain" and **Listen** as the "Ears."

---

## 1. `express()` — The Builder

When you write `const app = express()`, you are creating an **instance** of an Express application.

* **What it does:** It sets up the framework. It gives you the tools to define routes (like `app.get`), use middleware, and handle logic.
* **Analog:** This is like building a radio station, setting up the microphones, and hiring the DJs. The station exists, but it isn't broadcasting yet.

## 2. `.listen()` — The Activator

The `.listen()` method is what actually starts the server and makes it wait for connections on a specific port (like 3000).

* **What it does:** It "binds" your application to a port on your computer so it can start receiving HTTP requests from the outside world (your browser).
* **Analog:** This is like turning on the "ON AIR" sign and opening the phone lines. People can now call in (send requests).

---

### Comparison Table

| Feature | `express()` | `.listen()` |
| --- | --- | --- |
| **Purpose** | Creates the app object. | Starts the web server. |
| **When to use** | At the very beginning of your file. | At the very end of your file. |
| **Result** | An object (`app`) with many methods. | A running process in your terminal. |
| **Example** | `const app = express();` | `app.listen(3000);` |

---

### Why your code was failing

In your previous terminal logs, you had a typo: `app.length(3000)`.

* **`length`** is a property used to count characters in a string or items in an array.
* Because `app` is a function/object, it doesn't have a `.length()` method you can call like that.

**Correct Syntax:**

```javascript
const port = 3000;

app.listen(port, () => {
  console.log(`Server is whispering on port ${port}`);
});

```
---
## req (Request) VS res (Response)

## 1. `req` (The Request)

This object contains all the information about the person "calling" your server. It’s the **order form** the customer hands to the waiter.

* **`req.url`**: What page are they asking for? (e.g., `/about`)
* **`req.method`**: Are they trying to GET data or POST (send) data?
* **`req.params`** & **`req.query`**: Are they searching for something specific? (e.g., `?search=pizza`)
* **`req.body`**: If they are logging in, their username and password are hidden in here.

## 2. `res` (The Response)

This object contains the methods for the server to **talk back** to the client. It’s the **tray** the waiter brings back from the kitchen.

* **`res.send()`**: Sends a simple string or HTML (like "Hello World").
* **`res.json()`**: Sends data in JSON format (common for APIs).
* **`res.status()`**: Tells the browser if things went well (**200 OK**) or if the page is missing (**404 Not Found**).
* **`res.render()`**: Sends an entire HTML file/template to be displayed.

---

### The Cycle in Action

When you write this code:

```javascript
app.get('/home', (req, res) => {
     res.send("This is Home Page")
})

```

1. **The Browser** sends a `req` to the server asking for `/home`.
2. **Express** looks at your code and finds the matching route.
3. **The Server** uses the `res` object to "send" the text back to the browser.
4. **The Browser** receives that text and displays it.

---

### A Cool Trick: See the `req` in your terminal

If you want to see what's happening under the hood, try adding a `console.log(req)` inside your route:

```javascript
app.get('/', (req, res) => {
    console.log("Someone visited the home page!");
    console.log("Their browser info:", req.headers['user-agent']);
    res.send("Check your terminal logs!");
});

```
![req vs res](image.png)