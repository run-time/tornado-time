# Tornado Time

A fun, kid-friendly countdown timer web component with animated confetti and colorful gradients. Perfect for time management activities, classroom timers, or game countdowns.

## Usage

### Basic Embed

Add this to your HTML:

```html
<script src="https://tornado-time.vercel.app/tornado-timer.js"></script>
<tornado-timer minutes="5"></tornado-timer>
```

### Attributes

- **`minutes`** (optional, default: `5`)
  Set the countdown duration in minutes.

  ```html
  <tornado-timer minutes="10"></tornado-timer>
  ```

### Styling

The component uses CSS custom properties for theming:

```css
tornado-timer {
  --bg-top: #8fe7ff;
  --bg-middle: #b6ffcb;
  --bg-bottom: #fff0a8;
  --timer-ink: #000000;
}
```

## Interaction

- **Click** the timer circle to restart
- **Press Enter** or **Space** to restart when the timer is focused
- Timer automatically celebrates with a brief animation when it reaches zero

## Deployment

This is a static web component hosted on Vercel.
