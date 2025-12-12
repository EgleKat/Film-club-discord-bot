<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import Button from '$lib/components/Button.svelte';
  import confetti from 'canvas-confetti';

  export let data: PageData;
  export let form;

  let confettiCanvas: HTMLCanvasElement;

  const currentTheme = data.theme;

  // Calculate the closest Sunday 4 weeks in the future (same logic as meeting date picker, but +3 weeks)
  const today = new Date();
  const fourWeeksSundayUtc = new Date(
    Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + (7 - today.getDay()) + 21
    )
  );

  let selectedTheme: string = '';
  let hasSpun: boolean = false;
  let wheel: any = null;

const themes = `
Female Protagonist
Based on a book
Anime
Top 100 IMDB
Bottom 1000 IMDB
3D Animation
Comedy
Romance
Slice of life
Budget under 1 mil
Cartoon
Crime
Slasher
Horror
Live Action
Thriller
Minority protagonist
Different Perspective
Feel-good film
Black and White
Body
Survival
Romance
Something unexpected happens
Musical
Contrast
Family
Animal
Hentai
Conflict
History
Based on a true story
Food
Unlikely pairing/group
vegetarian
no theme
no theme
no theme
no theme
sports
fantasy
sci-fi
hero
weird
festival entry/winner
award winning
`.split("\n").map(t => t.trim()).filter(Boolean)

function fireFireworkConfetti() {
  if (!confettiCanvas) return;

  const myConfetti = confetti.create(confettiCanvas, {
    resize: true,
    useWorker: true
  });

  // Firework burst from center
  const duration = 3000;
  const end = Date.now() + duration;

  const colors = ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff'];

  // Initial big burst
  myConfetti({
    particleCount: 100,
    spread: 100,
    origin: { y: 0.6 },
    colors: colors
  });

  // Continuous firework effect
  const frame = () => {
    myConfetti({
      particleCount: 7,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    });
    myConfetti({
      particleCount: 7,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();

  // Add some stars in the middle
  setTimeout(() => {
    myConfetti({
      particleCount: 50,
      spread: 360,
      shapes: ['star'],
      colors: colors,
      origin: { x: 0.5, y: 0.5 },
      scalar: 1.2
    });
  }, 500);
}

const props = {
  items: themes.map(t => ({label: t})),
  itemBackgroundColors: ["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"],
  onRest: (event: { currentIndex: number }) => {
    selectedTheme = themes[event.currentIndex];
    hasSpun = true;
    fireFireworkConfetti();
  }
}

onMount(async () => {
  const { Wheel } = await import('spin-wheel');
  wheel = new Wheel(
    document.getElementById('wheel'),
    props,
  )
})

function spinWheel() {
  if (wheel) {
    const duration = 3000 + Math.random() * 2000;
    const revolutions = 3 + Math.random() * 3;
    wheel.spinToItem(Math.floor(Math.random() * themes.length), duration, true, revolutions);
  }
}
</script>

<canvas bind:this={confettiCanvas} class="confetti-canvas"></canvas>

<div class="theme-spinner-container">
  {#if currentTheme}
    <div class="current-theme-banner">
      <span>Current theme: <strong>{currentTheme.name}</strong></span>
      <span class="theme-end-date">Ends {currentTheme.endDate.toLocaleDateString()}</span>
    </div>
  {:else}
    <div class="current-theme-banner no-theme">
      <span>No theme currently set</span>
    </div>
  {/if}

  {#if form?.success}
    <div class="success-message">Theme set successfully!</div>
  {/if}
  {#if form?.error}
    <div class="error-message">{form.error}</div>
  {/if}

  <div class="wheel-container">
    <svg viewBox="0 0 100 100" class="pointer desktop-only">
      <polygon fill="currentColor" points="50 100, 100 0, 0 0"/>
    </svg>
    <div id="wheel">
      <svg viewBox="0 0 100 100" class="pointer mobile-only">
        <polygon fill="currentColor" points="50 100, 100 0, 0 0"/>
      </svg>
    </div>
  </div>

  <div class="controls">
    <Button variant="primary" on:click={spinWheel}>Spin!</Button>
  </div>

  {#if hasSpun}
    <div class="set-theme-form">
      <form method="POST" action="?/setTheme">
        <label>
          Theme:
          <input
            type="text"
            name="theme"
            bind:value={selectedTheme}
            required
          />
        </label>
        <label>
          Theme ends on:
          <input
            type="date"
            name="endDate"
            value={fourWeeksSundayUtc.toISOString().substring(0, 10)}
            required
          />
        </label>
        <Button type="submit" variant="primary">Set as current theme</Button>
      </form>
    </div>
  {/if}
</div>

<style lang="scss">
  .confetti-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1000;
  }

  .theme-spinner-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;

    @media (max-width: 768px) {
      overflow-x: clip;
      width: 100%;
      padding: 0;
    }
  }

  .current-theme-banner {
    background-color: $main-blue;
    color: #cadff4;
    padding: 1rem 2rem;
    border-radius: 8px;
    display: flex;
    gap: 2rem;
    align-items: center;
    margin-bottom: 1rem;

    &.no-theme {
      background-color: #666;
    }

    .theme-end-date {
      font-size: 0.9rem;
      opacity: 0.8;
    }
  }

  .success-message {
    background-color: #4caf50;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .error-message {
    background-color: #f44336;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .wheel-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 800px;

    .pointer {
      width: 5%;
      z-index: 1;

      &.mobile-only {
        display: none;
      }
    }

    #wheel {
      width: 100%;
      height: 500px;
      position: relative;
      top: -5%;
    }

    @media (max-width: 768px) {
      flex-direction: row;
      align-items: center;
      max-width: none;
      width: 150vw;
      margin-left: -50vw;
      overflow: visible;

      .pointer.desktop-only {
        display: none;
      }

      #wheel {
        width: 100%;
        height: 80vh;
        max-height: 600px;
        transform: rotate(90deg);

        .pointer.mobile-only {
          display: block;
          position: absolute;
          top: 0;
          right: 50%;
          width: 30px;
          height: 30px;
          z-index: 10;
        }
      }
    }
  }

  .controls {
    margin: 1rem 0;
  }

  .set-theme-form {
    margin-top: 2rem;
    padding: 1.5rem;
    background-color: $main-orange;
    border-radius: 8px;
    text-align: center;

    h3 {
      margin: 0 0 1rem 0;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: center;
    }

    label {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    input[type="date"],
    input[type="text"] {
      padding: 0.5rem;
      border-radius: 4px;
      border: 1px solid #ccc;
    }

    input[type="text"] {
      font-size: 1rem;
      min-width: 200px;
    }
  }
</style>