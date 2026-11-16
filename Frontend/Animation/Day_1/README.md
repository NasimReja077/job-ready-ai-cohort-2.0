# GSAP + React Simple Demo

A minimal React project that shows basic GSAP animations and how to properly **deactivate / kill** them.

## Features

- Play / Pause / Resume / Kill controls
- Proper cleanup on component unmount
- Clean CSS styling
- Uses Vite + React 18 + GSAP 3

## How to run

```bash
cd gsap-react-demo
npm install
npm run dev
```

Then open the URL shown in the terminal (usually http://localhost:5173).

## Key points demonstrated

1. Storing the tween in a `useRef` so we can control it later
2. Calling `.kill()` when we want to completely stop and remove the animation
3. Resetting the element with `gsap.set()` after killing
4. Cleanup function inside `useEffect` to prevent memory leaks when the component unmounts
