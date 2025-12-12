<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import Button from '$lib/components/Button.svelte';
  import SetThemeDialog from '$lib/components/SetThemeDialog.svelte';
  import confetti from 'canvas-confetti';

  export let data: PageData;
  export let form;

  let confettiCanvas: HTMLCanvasElement;
  let wheelContainer: HTMLElement;
  let audioContext: AudioContext | null = null;
  let isSpinning = false;
  let spinAnimationFrame: number | null = null;
  let lastSegmentIndex = -1;
  let isMobile = false;

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
  let showThemeDialog: boolean = false;
  let wheel: any = null;

function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume audio context if suspended (required for mobile browsers)
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

function playTickSound() {
  const ctx = initAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.03);

  gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.05);
}

function getCurrentSegmentIndex(): number {
  if (!wheel) return -1;
  const rotation = wheel.rotation % 360;
  const segmentAngle = 360 / themes.length;
  return Math.floor(((360 - rotation + segmentAngle / 2) % 360) / segmentAngle);
}

function trackWheelRotation() {
  if (!isSpinning) return;

  const currentSegment = getCurrentSegmentIndex();
  if (currentSegment !== lastSegmentIndex && lastSegmentIndex !== -1) {
    playTickSound();
  }
  lastSegmentIndex = currentSegment;

  spinAnimationFrame = requestAnimationFrame(trackWheelRotation);
}

function stopTrackingRotation() {
  isSpinning = false;
  if (spinAnimationFrame !== null) {
    cancelAnimationFrame(spinAnimationFrame);
    spinAnimationFrame = null;
  }
}

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

const segmentAngle = 360 / themes.length;

const props = {
  items: themes.map(t => ({label: t})),
  itemBackgroundColors: ["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"],
  pointerAngle: 0,
  rotation: -(segmentAngle / 2), // Offset to center segments on the pointer
  onRest: (event: { currentIndex: number }) => {
    stopTrackingRotation();
    selectedTheme = themes[event.currentIndex];
    hasSpun = true;
    fireFireworkConfetti();
    // Delay showing dialog by 1 second to let user see the result
    setTimeout(() => {
      showThemeDialog = true;
    }, 1000);
  }
}

onMount(async () => {
  const { Wheel } = await import('spin-wheel');

  // Detect mobile for touch handling
  isMobile = window.matchMedia('(max-width: 768px)').matches;

  // Listen for resize to update mobile state
  const mediaQuery = window.matchMedia('(max-width: 768px)');
  const handleResize = (e: MediaQueryListEvent) => {
    isMobile = e.matches;
    // Update wheel interactivity based on screen size
    if (wheel) {
      wheel.isInteractive = !isMobile;
    }
  };
  mediaQuery.addEventListener('change', handleResize);

  wheel = new Wheel(
    wheelContainer,
    {
      ...props,
      // Disable built-in drag on mobile since 90deg rotation breaks touch coordinates
      isInteractive: !isMobile
    },
  );

  // Add custom touch handling for mobile that accounts for the 90-degree rotation
  if (isMobile) {
    setupMobileTouchHandling();
  }

  return () => {
    mediaQuery.removeEventListener('change', handleResize);
  };
})

// Touch handling variables for mobile swipe-to-spin
let touchStartY = 0;
let touchStartTime = 0;
let touchStartRotation = 0;
let isTouchDragging = false;

function setupMobileTouchHandling() {
  if (!wheelContainer) return;

  const canvas = wheelContainer.querySelector('canvas');
  if (!canvas) return;

  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
  canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
}

function handleTouchStart(e: TouchEvent) {
  if (isSpinning || !wheel) return;

  // Initialize audio context on first touch interaction (required for mobile)
  initAudioContext();

  e.preventDefault();
  const touch = e.touches[0];

  // On mobile with 90deg rotation, horizontal swipe = wheel rotation
  // We use clientX because the wheel is rotated, so horizontal movement spins it
  touchStartY = touch.clientX;
  touchStartTime = Date.now();
  touchStartRotation = wheel.rotation;
  isTouchDragging = true;
}

function handleTouchMove(e: TouchEvent) {
  if (!isTouchDragging || !wheel) return;

  e.preventDefault();
  const touch = e.touches[0];

  // Calculate drag delta (using X because wheel is rotated 90deg)
  const deltaY = touch.clientX - touchStartY;

  // Convert pixel movement to rotation degrees
  // Negative because we want natural drag direction
  const rotationDelta = -deltaY * 0.5;

  // Update wheel rotation directly during drag
  wheel.rotation = touchStartRotation + rotationDelta;
}

function handleTouchEnd(e: TouchEvent) {
  if (!isTouchDragging || !wheel) return;

  e.preventDefault();
  isTouchDragging = false;

  const touchEndTime = Date.now();
  const touchDuration = touchEndTime - touchStartTime;

  // Get the final touch position from changedTouches
  const touch = e.changedTouches[0];
  const deltaY = touch.clientX - touchStartY;

  // Calculate velocity (pixels per millisecond)
  const velocity = Math.abs(deltaY) / touchDuration;

  // Only trigger spin if there was a meaningful flick gesture
  if (velocity > 0.3 && Math.abs(deltaY) > 30) {
    // Flick detected - trigger a spin
    triggerFlickSpin(velocity, deltaY > 0 ? -1 : 1);
  }
}

function triggerFlickSpin(velocity: number, direction: number) {
  if (!wheel) return;

  // Ensure audio context is ready (should already be initialized from touchstart)
  initAudioContext();

  // Scale duration and revolutions based on flick velocity
  const baseRevolutions = Math.min(velocity * 2, 4);
  const revolutions = Math.max(1.5, baseRevolutions);
  const duration = 4000 + revolutions * 1000;

  // Start tracking rotation for sound
  isSpinning = true;
  lastSegmentIndex = getCurrentSegmentIndex();
  trackWheelRotation();

  // Spin to a random item
  wheel.spinToItem(Math.floor(Math.random() * themes.length), duration, true, revolutions);
}

function spinWheel() {
  if (wheel) {
    // Initialize audio context on user interaction (required for mobile)
    initAudioContext();

    const duration = 6000 + Math.random() * 3000;
    const revolutions = 2 + Math.random() * 2;

    // Start tracking rotation for sound
    isSpinning = true;
    lastSegmentIndex = getCurrentSegmentIndex();
    trackWheelRotation();

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
    <div id="wheel" bind:this={wheelContainer}></div>
    <svg viewBox="0 0 100 100" class="pointer mobile-only">
      <polygon fill="currentColor" points="50 100, 100 0, 0 0"/>
    </svg>
  </div>

  <div class="controls">
    <Button variant="primary" on:click={spinWheel}>Spin!</Button>
  </div>

</div>

<SetThemeDialog
  bind:isOpen={showThemeDialog}
  bind:selectedTheme={selectedTheme}
  defaultEndDate={fourWeeksSundayUtc}
  on:close={() => showThemeDialog = false}
/>

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

      :global(canvas) {
        cursor: grab;

        &:active {
          cursor: grabbing;
        }
      }
    }

    @media (max-width: 768px) {
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      max-width: none;
      width: 100%;
      position: relative;
      overflow: hidden;

      .pointer.desktop-only {
        display: none;
      }

      .pointer.mobile-only {
        display: block;
        position: absolute;
        top: 50%;
        // Position arrow on right side of screen
        right: 5vw;
        // Rotate to point left (toward the wheel)
        transform: translateY(-50%) rotate(90deg);
        width: 30px;
        height: 30px;
        z-index: 10;
      }

      #wheel {
        // Make wheel large enough so half is visible and readable
        width: 150vw;
        height: 150vw;
        max-height: none;
        // Shift wheel left so only right half is visible (peeking from left)
        margin-left: -75vw;
        transform: rotate(90deg);

        // Prevent browser scroll/zoom during touch interactions
        :global(canvas) {
          touch-action: none;
          -webkit-user-select: none;
          user-select: none;
        }
      }
    }
  }

  .controls {
    margin: 1rem 0;
  }
</style>