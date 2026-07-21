# Google OAuth 2.0 Authentication with Passport.js (Express)

## Overview

Google OAuth allows users to log in to your application using their Google account instead of creating a new username and password.

In this project, we use:

- **Express.js** → Backend framework
- **Passport.js** → Authentication middleware
- **passport-google-oauth20** → Google OAuth strategy
- **dotenv** → Store environment variables securely
- **morgan** → Log HTTP requests

---

# Authentication Flow

```text
                User
                  │
                  │
                  ▼
      http://localhost:3000/auth/google
                  │
                  ▼
        Passport Google Strategy
                  │
                  ▼
       Redirect to Google Login Page
                  │
                  ▼
        User logs into Google
                  │
                  ▼
 Google asks permission (Email/Profile)
                  │
                  ▼
       User clicks "Allow"
                  │
                  ▼
Google redirects to

/auth/google/callback
                  │
                  ▼
 Passport verifies the user
                  │
                  ▼
     profile object is received
                  │
                  ▼
done(null, profile)
                  │
                  ▼
req.user is created
                  │
                  ▼
Response sent to browser
```

---

# Folder Structure

```
project
│
├── server.js
├── package.json
├── .env
└── node_modules
```

---

# Required Packages

Install all dependencies.

```bash
npm install express passport passport-google-oauth20 dotenv morgan
```

---

# Environment Variables

Create a `.env` file.

```env
GOOGLE_CLIENT_ID=xxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxxxxxxxxxxxxx
```

Never upload this file to GitHub.

---

# Step-by-Step Code Explanation

---

## Step 1

Import packages

```javascript
import { config } from "dotenv";
import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import morgan from "morgan";
```

### Purpose

- express → Creates server
- passport → Authentication middleware
- GoogleStrategy → Google OAuth
- dotenv → Reads .env variables
- morgan → Logs requests

---

## Step 2

Load environment variables

```javascript
config();
```

This reads

```
.env
```

and makes them available as

```javascript
process.env.GOOGLE_CLIENT_ID
```

---

## Step 3

Create Express app

```javascript
const app = express();
```

This creates the server.

---

## Step 4

Morgan Middleware

```javascript
app.use(morgan("dev"));
```

Logs every request.

Example

```
GET / 200 5ms
```

---

## Step 5

Home Route

```javascript
app.get("/", (req, res) => {
    res.send("Hello World");
});
```

When user visits

```
http://localhost:3000/
```

Output

```
Hello World
```

---

## Step 6

Initialize Passport

```javascript
app.use(passport.initialize());
```

Passport middleware becomes active.

Without this,

```
passport.authenticate()
```

will not work.

---

# Step 7

Configure Google Strategy

```javascript
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback",
        },
        (_, __, profile, done) => {
            return done(null, profile);
        }
    )
);
```

This tells Passport how to authenticate users with Google.

---

## GoogleStrategy Options

### clientID

```javascript
clientID: process.env.GOOGLE_CLIENT_ID
```

Google identifies your application.

---

### clientSecret

```javascript
clientSecret: process.env.GOOGLE_CLIENT_SECRET
```

Google verifies your application.

Keep this secret.

---

### callbackURL

```javascript
callbackURL: "/auth/google/callback"
```

After login, Google redirects the user here.

---

# Callback Function

```javascript
(_, __, profile, done) => {
    return done(null, profile);
}
```

Passport calls this after Google successfully authenticates the user.

Parameters:

```
accessToken
refreshToken
profile
done
```

You're ignoring the first two parameters using `_` and `__`.

The important one is

```javascript
profile
```

Example:

```javascript
{
    id: "1122334455",
    displayName: "John Doe",
    emails: [
        {
            value: "john@gmail.com"
        }
    ],
    photos: [
        {
            value: "https://..."
        }
    ]
}
```

---

## done()

```javascript
done(null, profile);
```

Meaning

```
No error
Authenticated user = profile
```

Passport stores this object into

```javascript
req.user
```

---

# Step 8

Google Login Route

```javascript
app.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);
```

When user visits

```
/auth/google
```

Passport redirects user to Google.

---

## Scope

```javascript
scope: ["profile", "email"]
```

Permission requested:

```
✔ Profile
✔ Email
```

Without email scope,

```
profile.emails
```

will be empty.

---

# Step 9

Callback Route

```javascript
app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: "/",
    }),
    (req, res) => {
        console.log(req.user);
        res.send("Google authentication successful");
    }
);
```

After Google login,

Google redirects here.

Passport validates the authentication.

If successful,

```
req.user
```

contains the user's Google profile.

---

## session:false

```javascript
session: false
```

Passport normally stores users in a session.

Here we disable sessions.

This is useful when using JWT authentication.

---

## failureRedirect

```javascript
failureRedirect: "/"
```

If login fails,

User is redirected to

```
/
```

---

## req.user

```javascript
console.log(req.user);
```

Example output

```javascript
{
    id: '103489234',
    displayName: 'John Doe',
    name: {
        familyName: 'Doe',
        givenName: 'John'
    },
    emails: [
        {
            value: 'john@gmail.com'
        }
    ],
    photos: [
        {
            value: 'https://lh3.googleusercontent.com/...'
        }
    ]
}
```

Passport automatically attaches this object.

---

# Step 10

Start Server

```javascript
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
```

Server starts at

```
http://localhost:3000
```

---

# Complete Authentication Flow

```
User
 │
 ▼
GET /auth/google
 │
 ▼
Passport
 │
 ▼
Google Login
 │
 ▼
User enters credentials
 │
 ▼
Google verifies
 │
 ▼
Google redirects
/auth/google/callback
 │
 ▼
Passport validates response
 │
 ▼
GoogleStrategy callback
 │
 ▼
done(null, profile)
 │
 ▼
req.user created
 │
 ▼
Response sent
```

---

# What Passport Does Internally

Without Passport:

```
Receive Google response

↓

Verify token

↓

Fetch user profile

↓

Handle errors

↓

Attach user to request

↓

Call next()
```

With Passport:

```
passport.authenticate()

↓

Everything handled automatically
```

---

# Why Use Passport?

### Advantages

- Easy authentication
- Supports many providers (Google, GitHub, Facebook, Twitter, etc.)
- Session support
- JWT support
- Secure implementation
- Less code
- Widely used

---

# Common Errors

### callbackURL mismatch

Google Console callback URL must exactly match:

```
http://localhost:3000/auth/google/callback
```

---

### Invalid Client ID

Check `.env`

```
GOOGLE_CLIENT_ID
```

---

### Invalid Client Secret

Check

```
GOOGLE_CLIENT_SECRET
```

---

### Redirect URI Mismatch

Occurs when the callback URL in Google Cloud Console doesn't match your application's callback URL.

---

### Missing Scope

If `"email"` isn't included in the scope, email information won't be available in `profile.emails`.

---

# Summary

1. User visits `/auth/google`.
2. Passport redirects the user to Google.
3. Google authenticates the user.
4. Google redirects to `/auth/google/callback`.
5. Passport verifies the authentication.
6. Google profile is returned in the callback.
7. `done(null, profile)` stores the profile in `req.user`.
8. The application can now identify the authenticated user.
