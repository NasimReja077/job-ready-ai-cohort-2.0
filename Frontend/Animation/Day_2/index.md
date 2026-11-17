# GSAP Animation Notes

GSAP (GreenSock Animation Platform) animates JavaScript values and DOM elements. A tween describes how a target's properties change over time; a timeline sequences and coordinates tweens.

## Selecting targets

GSAP accepts CSS selectors, DOM elements, and arrays of elements:

```js
gsap.to(".box", { x: 150 });
```

The selector above targets every element with the `box` class.

## Tween methods

- `gsap.to(target, vars)` animates from the target's current values to the values in `vars`.
- `gsap.from(target, vars)` animates from the values in `vars` to the target's current values.
- `gsap.fromTo(target, fromVars, toVars)` explicitly defines both the starting and ending values.
- `gsap.set(target, vars)` applies values immediately, without animating.

```js
gsap.fromTo(
  ".box",
  { x: -300, opacity: 0 },
  { x: 150, opacity: 1, duration: 1 }
);
```

## Timing and easing

- `duration` is the animation length in seconds. GSAP's default is `0.5` seconds.
- `delay` is the number of seconds to wait before the tween starts.
- `ease` controls how the animation changes speed over its duration. The default is `power1.out`.
- An animation's end time is its start time plus its delay and duration.

```js
gsap.to(".box", {
  x: 1500,
  duration: 1.5,
  delay: 0.6,
  ease: "power2.inOut",
});
```

Common ease directions:

- `in`: starts slowly and speeds up; useful for motion leaving the screen.
- `out`: starts quickly and slows down; useful for motion entering the screen.
- `inOut`: starts and ends slowly, with faster motion in the middle.

For example, `power2.inOut` uses the `inOut` direction with a `power2` curve.

## Repeating and reversing

- `repeat: 0` (the default) plays once.
- A positive `repeat` value is the number of additional plays; `repeat: 2` plays three times in total.
- `repeat: -1` repeats indefinitely.
- `yoyo: true` alternates direction on each repeat.

```js
gsap.to(".box", {
  x: 1500,
  duration: 1.5,
  repeat: -1,
  yoyo: true,
});
```

## Callbacks

Callbacks run JavaScript functions at specific points in a tween's lifecycle:

| Callback | When it runs |
| --- | --- |
| `onStart` | When the tween starts. |
| `onUpdate` | On each animation frame while the tween is active. |
| `onComplete` | When the tween finishes. |
| `onRepeat` | When a repeated tween starts another cycle. |
| `onReverseComplete` | When a reversed tween reaches its starting point. |
| `onInterrupt` | When the tween is interrupted before completing. |

```js
gsap.to(".box", {
  x: 500,
  duration: 1.4,
  onComplete: () => console.log("Animation complete"),
});
```

Use `onUpdate` sparingly for work that needs to run every frame, such as synchronizing a visual value. Avoid logging on every update in production.

## Staggers

A stagger offsets the start time of the same tween across multiple targets. This creates a sequence rather than starting every target at once:

```js
gsap.to(".box", {
  y: 100,
  duration: 0.5,
  stagger: 0.15,
});
```

Each matching `.box` starts `0.15` seconds after the previous one.
