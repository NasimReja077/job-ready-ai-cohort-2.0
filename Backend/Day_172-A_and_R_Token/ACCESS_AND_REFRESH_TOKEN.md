# Access Token and Refresh Token Flow

This file explains the Access Token and Refresh Token system used in this project, based on the actual code in the backend.

## 1) Token Generation

The project creates both tokens in `backend/src/utils/generateTokens.js`.

```js
import jwt from "jsonwebtoken";

const generateAccessToken = (userId) => {
     return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
          expiresIn: "1m",
     });
};

const generateRefreshToken = (userId) => {
     return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
          expiresIn: "1d",
     });
};

export { generateAccessToken, generateRefreshToken };
```

### Purpose

- Access Token:
  - Short-lived
  - Used to access protected routes
  - Expires in 1 minute

- Refresh Token:
  - Long-lived
  - Used to generate a fresh access token
  - Expires in 1 day

---

## 2) When Tokens Are Created

During registration and login, the backend generates both tokens and saves the refresh token to the user document.

```js
let accessToken = generateAccessToken(newUser._id);
let refreshToken = generateRefreshToken(newUser._id);

newUser.refreshToken = refreshToken;
await newUser.save();
```

This logic is in `backend/src/service/auth.service.js`.

---

## 3) Setting Tokens in Cookies

After successful register/login, the controller stores both tokens as cookies.

```js
res.cookie("accessToken", accessToken, {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  maxAge: 60 * 1000,
});

res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  maxAge: 24 * 60 * 60 * 1000,
});
```

This is in `backend/src/controllers/auth.controller.js`.

### Why cookies?

- `httpOnly: true` keeps the cookie safe from JavaScript access
- `sameSite: "lax"` helps prevent cross-site issues
- `secure: false` is used in local development
- `maxAge` controls the token lifetime

---

## 4) Refreshing Access Token

When the access token expires, the frontend can call the refresh endpoint.

```js
let getAccessTokenService = async (refreshToken) => {
  let decode = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  if (!decode) throw new Error("unauthorized");

  let user = await UserModel.findById(decode.id);

  if (refreshToken !== user.refreshToken) throw new Error("unauthorized");

  let accessToken = generateAccessToken(user._id);

  return accessToken;
};
```

The controller then sets the new access token in a cookie again:

```js
let refreshToken = req.cookie.refreshToken;
if (!refreshToken) {
  return res.status(401).json({ message: "Unauthorized request" });
}

let accessToken = await getAccessTokenService(refreshToken);

res.cookie("accessToken", accessToken, {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  maxAge: 10 * 60 * 1000,
});
```

This is the main refresh mechanism in the project.

---

## 5) Protecting Routes

The project validates the access token in middleware before allowing access to protected routes.

```js
const authMiddleware = async (req, res, next) => {
     try{
          const accessToken = req.cookies.accessToken;
          if (!accessToken){
               return res.status(401).json({
                    message: "Unauthorized request",
               });
          }

          let decode = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);

          if(!decode){
               return res.status(401).json({
                    message: "Unauthorized request",
               });
          }

          let user = await UserModel.findById(decode.id)

          req.user = user;
          next();
     } catch (error){
          return res.status(404).json({
               message: "Unauthorized",
          });
     }
};
```

This middleware checks whether the user is authenticated before continuing.

---

## 6) Token Workflow Summary

1. User registers or logs in
2. Backend generates Access Token + Refresh Token
3. Refresh token is saved in the database
4. Both are sent as cookies
5. Access token is used to authenticate requests
6. When it expires, refresh token is used to generate a new access token
7. Middleware verifies access token before granting access

---

## 7) Example Flow

```text
Register/Login
   -> generateAccessToken()
   -> generateRefreshToken()
   -> save refresh token to DB
   -> set cookies

Protected request
   -> authMiddleware reads req.cookies.accessToken
   -> jwt.verify(accessToken, JWT_ACCESS_SECRET)
   -> allow request

Access token expired
   -> call /api/auth/get-accessToken
   -> verify refresh token
   -> generate new access token
   -> save new access token cookie
```

---

## 8) Security Notes

- Access token should stay short-lived
- Refresh token should be stored securely and compared with the DB value
- Never expose tokens to the client as plain JavaScript variables when using cookies
- In production, use `secure: true` in HTTPS environments

This pattern is a standard and safe JWT authentication flow for a Node.js + Express backend.
