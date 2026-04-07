class TornadoTime extends HTMLElement {
  static get observedAttributes() {
    return ["minutes"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.totalSeconds = this.parseMinutes(this.getAttribute("minutes")) * 60;
    this.remainingMs = this.totalSeconds * 1000;
    this.running = false;
    this.hasFinished = false;
    this.frameId = null;
  }

  connectedCallback() {
    this.render();
    this.cacheDom();
    this.setupRing();
    this.buildStormBackground();
    this.startTimer();
    this.bindEvents();
    this.frameId = requestAnimationFrame((now) => this.tick(now));
  }

  disconnectedCallback() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "minutes" && oldValue !== newValue) {
      this.totalSeconds = this.parseMinutes(newValue) * 60;
      this.startTimer();
    }
  }

  parseMinutes(value) {
    const minutes = Number.parseInt(value ?? "5", 10);
    return Number.isFinite(minutes) && minutes > 0 ? minutes : 5;
  }

  cacheDom() {
    this.panel = this.shadowRoot.getElementById("panel");
    this.timer = this.shadowRoot.getElementById("timer");
    this.timeEl = this.shadowRoot.getElementById("time");
    this.progressCircle = this.shadowRoot.querySelector(".progress-ring .progress");
  }

  setupRing() {
    this.radius = 54;
    this.circumference = 2 * Math.PI * this.radius;
    this.progressCircle.style.strokeDasharray = this.circumference.toString();
    this.progressCircle.style.strokeDashoffset = "0";
  }

  bindEvents() {
    this.timer.addEventListener("click", () => this.startTimer());
    this.timer.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.startTimer();
      }
    });
  }

  startTimer() {
    this.remainingMs = this.totalSeconds * 1000;
    this.endTime = performance.now() + this.remainingMs;
    this.running = true;
    this.hasFinished = false;
    this.updateDisplay(this.remainingMs);
  }

  tick(now) {
    if (this.running) {
      this.remainingMs = Math.max(0, this.endTime - now);
      if (this.remainingMs === 0) {
        this.running = false;
      }
    }

    this.updateDisplay(this.remainingMs);
    this.frameId = requestAnimationFrame((nextNow) => this.tick(nextNow));
  }

  updateDisplay(msLeft) {
    const safeMs = Math.max(0, msLeft);
    const secondsLeft = Math.ceil(safeMs / 1000);
    const progress = 1 - safeMs / (this.totalSeconds * 1000);
    const offset = this.circumference * progress;

    this.timeEl.textContent = this.formatTime(secondsLeft);
    this.progressCircle.style.strokeDashoffset = offset.toString();

    if (safeMs === 0) {
      this.panel.classList.add("complete");
      if (!this.hasFinished) {
        this.hasFinished = true;
        this.celebrateFinish();
      }
    } else {
      this.hasFinished = false;
      this.panel.classList.remove("complete");
    }
  }

  formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  celebrateFinish() {
    this.panel.animate(
      [
        { transform: "rotate(0deg) scale(1)" },
        { transform: "rotate(-2deg) scale(1.03)" },
        { transform: "rotate(2deg) scale(1.05)" },
        { transform: "rotate(0deg) scale(1.02)" }
      ],
      { duration: 900, easing: "ease-out" }
    );
  }

  randomInt(limit) {
    return Math.floor(Math.random() * limit);
  }

  buildStormBackground() {
    const world = this.shadowRoot.getElementById("background");
    const totalPieces = 220;

    for (let index = 0; index < totalPieces; index += 1) {
      const piece = document.createElement("div");
      const driftDuration = `${this.randomInt(6) + 2}s`;
      const driftDelay = `${this.randomInt(2000)}ms`;
      const rotation = `${this.randomInt(360)}deg`;
      const lateralDrift = `${this.randomInt(4)}vw`;
      const colors = [
        "#ff5f8a99",
        "#ffd16699",
        "#7bdff299",
        "#7c58ff99",
        "#8cff98aa",
        "#ffffffbb",
        "#ffa94dcc",
        "#ff85c099"
      ];
      const glyphs = ["🌪️", "🌪️", "🌪️", "⭐", "🧹", "🧹", "✨", "🫧", "🧽", "🧼", "🪣"];

      piece.textContent = glyphs[this.randomInt(glyphs.length)];
      piece.style.pointerEvents = "none";
      piece.style.opacity = "0";
      piece.style.position = "absolute";
      piece.style.top = `${this.randomInt(40)}vh`;
      piece.style.left = `${this.randomInt(100)}vw`;
      piece.style.fontSize = `${this.randomInt(22) + 10}px`;
      piece.style.color = colors[this.randomInt(colors.length)];
      piece.style.zIndex = "0";
      piece.style.animation = `drift ${driftDuration} ease-in ${driftDelay} infinite`;
      piece.style.setProperty("--rotation", rotation);
      piece.style.setProperty("--drift-x", lateralDrift);
      piece.style.transform = `rotate(${rotation})`;

      world.appendChild(piece);
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          min-height: 100vh;
          font-family: "Trebuchet MS", "Avenir Next", sans-serif;
          --bg-top: #8fe7ff;
          --bg-middle: #b6ffcb;
          --bg-bottom: #fff0a8;
          --timer-ink: #000000;
        }

        * {
          box-sizing: border-box;
        }

        .app {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          display: grid;
          place-items: center;
          padding: 1.5rem;
          color: #2b2556;
          background:
            radial-gradient(circle at 15% 15%, rgba(255, 255, 255, 0.75), transparent 22%),
            radial-gradient(circle at 82% 20%, rgba(255, 255, 255, 0.52), transparent 20%),
            linear-gradient(180deg, var(--bg-top), var(--bg-middle) 52%, var(--bg-bottom));
        }

        .app::before,
        .app::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(22px);
          opacity: 0.55;
          z-index: 0;
        }

        .app::before {
          width: 24rem;
          height: 24rem;
          top: -7rem;
          left: -5rem;
          background: rgba(255, 120, 170, 0.32);
        }

        .app::after {
          width: 20rem;
          height: 20rem;
          right: -5rem;
          bottom: -7rem;
          background: rgba(124, 88, 255, 0.24);
        }

        .background-layer {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
          animation: sway 60s ease-in infinite;
        }

        .panel {
          position: relative;
          z-index: 1;
          width: min(96vw, 42rem);
          text-align: center;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .timer-shell {
          position: relative;
          display: grid;
          place-items: center;
          width: min(74vw, 18.5rem);
          aspect-ratio: 1;
          margin: 0 auto;
          border-radius: 50%;
          background:
            radial-gradient(circle at 50% 36%, rgba(255, 255, 255, 0.96), rgba(255, 242, 252, 0.92) 36%, #bbbbbb88 96%, rgba(160, 160, 160, 0.92));
          box-shadow:
            inset 0 0 0 3px rgba(255, 255, 255, 0.55),
            0 18px 46px rgba(83, 57, 183, 0.25);
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .timer-shell:hover {
          box-shadow:
            inset 0 0 0 3px rgba(255, 255, 255, 0.62),
            0 22px 54px rgba(83, 57, 183, 0.32);
        }

        .timer-shell:active {
          transform: scale(0.99);
        }

        .timer-shell::before {
          content: "";
          position: absolute;
          inset: 0.8rem;
          border-radius: 50%;
          border: 4px dashed rgba(44, 44, 88, 0.44);
        }

        .timer-shell::after {
          content: "";
          position: absolute;
          inset: 1.6rem;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.52), transparent 60%);
        }

        .ring-title {
          position: absolute;
          inset: -24%;
          width: 148%;
          height: 148%;
          pointer-events: none;
          z-index: 3;
        }

        .ring-title text {
          fill: var(--timer-ink);
          font-family: "Trebuchet MS", "Avenir Next", sans-serif;
          font-size: 16px;
          font-weight: 900;
          letter-spacing: 2px;
          text-transform: uppercase;
          stroke: #ffffff;
          stroke-width: 3;
          paint-order: stroke fill;
        }

        .progress-ring {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .progress-ring circle {
          fill: none;
          stroke-width: 5;
          stroke-linecap: round;
        }

        .progress-ring .track {
          stroke: rgba(255, 255, 255, 0.4);
        }

        .progress-ring .progress {
          stroke: var(--timer-ink);
          transition: stroke-dashoffset 0.2s linear;
        }

        .time-readout {
          position: relative;
          z-index: 2;
          display: grid;
          justify-items: center;
        }

        .time {
          font-size: clamp(2.8rem, 10vw, 4.9rem);
          line-height: 0.95;
          font-variant-numeric: tabular-nums;
          color: var(--timer-ink);
          text-shadow: 0 3px 0 rgba(255, 255, 255, 0.35);
        }

        .complete {
          animation: pulse 0.8s ease-in-out infinite alternate;
        }

        @keyframes pulse {
          from {
            transform: scale(1) rotate(-1deg);
          }
          to {
            transform: scale(1.04) rotate(1deg);
          }
        }

        @keyframes sway {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(4deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(-4deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes drift {
          0% {
            margin-top: 2vh;
            opacity: 0;
          }
          20% {
            opacity: 1;
            margin-top: 0;
            margin-left: 0;
            transform: rotate(var(--rotation));
          }
          100% {
            opacity: 0.4;
            margin-top: 100vh;
            margin-left: var(--drift-x);
            transform: rotate(1080deg);
          }
        }
      </style>

      <div class="app">
        <div id="background" class="background-layer" aria-hidden="true"></div>

        <section class="panel" id="panel">
          <h1 class="sr-only">Tidy Tornado Time</h1>

          <div class="timer-shell" id="timer" role="button" tabindex="0" aria-label="Restart timer">
            <svg class="ring-title" viewBox="0 0 160 160" aria-hidden="true">
              <defs>
                <path id="titleArcTop" d="M 12 80 A 68 68 0 0 1 148 80"></path>
              </defs>
              <text>
                <textPath href="#titleArcTop" startOffset="50%" text-anchor="middle">TIDY TORNADO TIMER</textPath>
              </text>
            </svg>

            <svg class="progress-ring" viewBox="0 0 120 120" aria-hidden="true">
              <circle class="track" cx="60" cy="60" r="54"></circle>
              <circle class="progress" cx="60" cy="60" r="54"></circle>
            </svg>

            <div class="time-readout">
              <div id="time" class="time">05:00</div>
            </div>
          </div>
        </section>
      </div>
    `;
  }
}

if (!customElements.get("tornado-time")) {
  customElements.define("tornado-time", TornadoTime);
}
