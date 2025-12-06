<script lang="ts">
    import { onMount } from 'svelte'
    import { fade, fly, scale } from 'svelte/transition'
    import { quintOut, elasticOut } from 'svelte/easing'
    import type { PageData } from './$types'
    import confetti from 'canvas-confetti'

    export let data: PageData

    let currentAwardIndex = -1 // -1 means showing intro
    let showIntro = true
    let awardVisible = false
    let confettiCanvas: HTMLCanvasElement

    const festiveEmojis = ['🎬', '🎥', '🍿', '🎞️', '⭐', '🌟', '✨', '🎉', '🏆', '🎊']

    function getRandomEmoji() {
        return festiveEmojis[Math.floor(Math.random() * festiveEmojis.length)]
    }

    function fireConfetti() {
        if (!confettiCanvas) return

        const myConfetti = confetti.create(confettiCanvas, {
            resize: true,
            useWorker: true
        })

        // Fire from both sides
        myConfetti({
            particleCount: 100,
            spread: 70,
            origin: { x: 0.1, y: 0.6 }
        })
        myConfetti({
            particleCount: 100,
            spread: 70,
            origin: { x: 0.9, y: 0.6 }
        })

        // Fire some stars
        myConfetti({
            particleCount: 30,
            spread: 360,
            shapes: ['star'],
            colors: ['#ec9a29', '#054a91', '#a5d8ff'],
            origin: { x: 0.5, y: 0.5 }
        })
    }

    function startWrapped() {
        showIntro = false
        currentAwardIndex = 0
        awardVisible = true
        setTimeout(fireConfetti, 300)
    }

    function nextAward() {
        if (currentAwardIndex < data.awards.length - 1) {
            awardVisible = false
            setTimeout(() => {
                currentAwardIndex++
                awardVisible = true
                setTimeout(fireConfetti, 300)
            }, 300)
        }
    }

    function prevAward() {
        if (currentAwardIndex > 0) {
            awardVisible = false
            setTimeout(() => {
                currentAwardIndex--
                awardVisible = true
            }, 300)
        }
    }

    onMount(() => {
        // Initial sparkle effect
        if (!data.isComingSoon) {
            setTimeout(() => {
                fireConfetti()
            }, 500)
        }
    })

    // Handle keyboard navigation
    function handleKeydown(event: KeyboardEvent) {
        if (showIntro) {
            if (event.key === 'Enter' || event.key === ' ') {
                startWrapped()
            }
        } else {
            if (event.key === 'ArrowRight' || event.key === ' ') {
                nextAward()
            } else if (event.key === 'ArrowLeft') {
                prevAward()
            }
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<canvas bind:this={confettiCanvas} class="confetti-canvas"></canvas>

<div class="wrapped-container">
    {#if data.isComingSoon}
        <div class="coming-soon" in:fade={{ duration: 500 }}>
            <div class="emoji-burst">
                {#each Array(8) as _, i}
                    <span
                        class="floating-emoji"
                        style="--delay: {i * 0.2}s; --offset: {(i - 4) * 30}deg"
                    >
                        {getRandomEmoji()}
                    </span>
                {/each}
            </div>
            <h1 class="coming-soon-title">
                🎬 Film Club Wrapped {data.year} 🎬
            </h1>
            <p class="coming-soon-text">Coming December 15th!</p>
            <div class="countdown-emoji">⏳🍿🎥</div>
        </div>
    {:else if showIntro}
        <div class="intro" in:fade={{ duration: 500 }}>
            <div class="intro-content">
                <h1 class="intro-title" in:fly={{ y: -50, duration: 800, easing: quintOut }}>
                    ✨ North Pole Film Club ✨
                </h1>
                <h2 class="intro-year" in:fly={{ y: -30, duration: 800, delay: 200, easing: quintOut }}>
                    Wrapped {data.year}
                </h2>
                <p class="intro-subtitle" in:fade={{ duration: 800, delay: 400 }}>
                    A year of cinema, scores, and spirited debates
                </p>
                <button
                    class="start-button"
                    on:click={startWrapped}
                    in:scale={{ duration: 500, delay: 600, easing: elasticOut }}
                >
                    🎬 Let's Go! 🍿
                </button>
            </div>
        </div>
    {:else if data.awards.length > 0}
        <div class="awards-container">
            {#if awardVisible}
                {@const award = data.awards[currentAwardIndex]}
                <div
                    class="award-slide"
                    in:fly={{ x: 100, duration: 500, easing: quintOut }}
                    out:fly={{ x: -100, duration: 300 }}
                >
                    <div class="award-header">
                        <span class="award-emoji">{award.emoji}</span>
                        <h2 class="award-title">{award.title}</h2>
                        <span class="award-emoji">{award.emoji}</span>
                    </div>

                    <div class="winner-section">
                        <div class="winner-name-container">
                            <span class="winner-label">
                                {award.winnerType === 'film' ? 'Winner' : 'And the winner is...'}
                            </span>
                            <h3 class="winner-name">{award.winnerName}</h3>
                        </div>

                        {#if award.film}
                            <div class="poster-container">
                                <img
                                    src={award.film.poster}
                                    alt={award.film.title}
                                    class="award-poster"
                                />
                                <div class="poster-glow"></div>
                            </div>
                            <p class="film-year">{award.film.year}</p>
                        {/if}
                    </div>

                    <div class="stat-section">
                        <div class="stat-value">{award.statValue}</div>
                        <div class="stat-label">{award.statLabel}</div>
                    </div>

                    <p class="award-description">{award.description}</p>
                </div>
            {/if}

            <div class="navigation">
                <button
                    class="nav-button prev"
                    on:click={prevAward}
                    disabled={currentAwardIndex === 0}
                >
                    ← Previous
                </button>
                <div class="progress">
                    {#each data.awards as _, i}
                        <span
                            class="progress-dot"
                            class:active={i === currentAwardIndex}
                            class:completed={i < currentAwardIndex}
                        ></span>
                    {/each}
                </div>
                <button
                    class="nav-button next"
                    on:click={nextAward}
                    disabled={currentAwardIndex === data.awards.length - 1}
                >
                    Next →
                </button>
            </div>

            <p class="nav-hint">Use arrow keys or swipe to navigate</p>
        </div>
    {:else}
        <div class="no-data" in:fade={{ duration: 500 }}>
            <h2>🎬 No awards data available yet</h2>
            <p>Check back later when more films have been scored!</p>
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

    .wrapped-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        margin: -2vh auto;
        margin-left: calc(-50vw + 50%);
        margin-right: calc(-50vw + 50%);
        width: 100vw;
    }

    // Coming Soon Styles
    .coming-soon {
        text-align: center;
        color: white;
        position: relative;
    }

    .emoji-burst {
        position: relative;
        height: 100px;
        margin-bottom: 2rem;
    }

    .floating-emoji {
        position: absolute;
        left: 50%;
        font-size: 2rem;
        animation: float 3s ease-in-out infinite;
        animation-delay: var(--delay);
        transform: translateX(-50%) rotate(var(--offset));
    }

    @keyframes float {
        0%, 100% { transform: translateX(-50%) translateY(0) rotate(var(--offset)); }
        50% { transform: translateX(-50%) translateY(-20px) rotate(var(--offset)); }
    }

    .coming-soon-title {
        font-size: 3rem;
        margin-bottom: 1rem;
        background: linear-gradient(45deg, $main-orange, $main-light-blue);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: shimmer 2s ease-in-out infinite;

        @include tablet {
            font-size: 2rem;
        }
    }

    @keyframes shimmer {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.3); }
    }

    .coming-soon-text {
        font-size: 1.5rem;
        color: $main-light-blue;
        margin-bottom: 2rem;
    }

    .countdown-emoji {
        font-size: 3rem;
        animation: bounce 1s ease-in-out infinite;
    }

    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }

    // Intro Styles
    .intro {
        text-align: center;
        color: white;
    }

    .intro-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .intro-title {
        font-size: 3.5rem;
        margin: 0;
        background: linear-gradient(45deg, $main-orange, gold, $main-orange);
        background-size: 200% 200%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: gradient-shift 3s ease infinite;

        @include tablet {
            font-size: 2rem;
        }
    }

    @keyframes gradient-shift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
    }

    .intro-year {
        font-size: 5rem;
        margin: 0;
        color: $main-light-blue;
        text-shadow: 0 0 30px rgba(165, 216, 255, 0.5);

        @include tablet {
            font-size: 3rem;
        }
    }

    .intro-subtitle {
        font-size: 1.25rem;
        color: #ccc;
        margin-top: 1rem;
    }

    .start-button {
        margin-top: 2rem;
        padding: 1rem 3rem;
        font-size: 1.5rem;
        background: linear-gradient(45deg, $main-orange, #f0a830);
        border: none;
        border-radius: 50px;
        color: #1a1a2e;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(236, 154, 41, 0.4);

        &:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 25px rgba(236, 154, 41, 0.6);
        }

        &:active {
            transform: scale(0.98);
        }
    }

    // Awards Container
    .awards-container {
        width: 100%;
        max-width: 600px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .award-slide {
        width: 100%;
        text-align: center;
        color: white;
        padding: 2rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 20px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .award-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    .award-emoji {
        font-size: 3rem;
        animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }

    .award-title {
        font-size: 2rem;
        margin: 0;
        background: linear-gradient(45deg, $main-orange, gold);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;

        @include tablet {
            font-size: 1.5rem;
        }
    }

    .winner-section {
        margin: 2rem 0;
    }

    .winner-name-container {
        margin-bottom: 1.5rem;
    }

    .winner-label {
        font-size: 0.9rem;
        color: #aaa;
        text-transform: uppercase;
        letter-spacing: 2px;
    }

    .winner-name {
        font-size: 2rem;
        margin: 0.5rem 0;
        color: white;
        text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        text-transform: capitalize;

        @include tablet {
            font-size: 1.5rem;
        }
    }

    .poster-container {
        position: relative;
        display: inline-block;
        margin: 1rem 0;
    }

    .award-poster {
        width: 200px;
        max-width: 100%;
        border-radius: 10px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        transition: transform 0.3s ease;
        position: relative;
        z-index: 1;

        &:hover {
            transform: scale(1.02);
        }
    }

    .poster-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 220px;
        height: 330px;
        background: radial-gradient(ellipse, rgba($main-orange, 0.3) 0%, transparent 70%);
        z-index: 0;
        animation: glow 3s ease-in-out infinite;
    }

    @keyframes glow {
        0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
    }

    .film-year {
        color: #aaa;
        margin-top: 0.5rem;
    }

    .stat-section {
        margin: 2rem 0;
        padding: 1rem;
        background: rgba(236, 154, 41, 0.1);
        border-radius: 10px;
        border: 1px solid rgba(236, 154, 41, 0.3);
    }

    .stat-value {
        font-size: 3rem;
        font-weight: bold;
        color: $main-orange;
        text-shadow: 0 0 20px rgba(236, 154, 41, 0.5);

        @include tablet {
            font-size: 2rem;
        }
    }

    .stat-label {
        font-size: 1rem;
        color: #aaa;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .award-description {
        color: #ccc;
        font-size: 1.1rem;
        line-height: 1.6;
        margin-top: 1rem;
    }

    // Navigation
    .navigation {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        max-width: 500px;
        margin-top: 2rem;
        gap: 1rem;
    }

    .nav-button {
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 25px;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }

        &:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }
    }

    .progress {
        display: flex;
        gap: 0.5rem;
    }

    .progress-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;

        &.active {
            background: $main-orange;
            transform: scale(1.3);
            box-shadow: 0 0 10px rgba(236, 154, 41, 0.5);
        }

        &.completed {
            background: $main-light-blue;
        }
    }

    .nav-hint {
        color: #666;
        font-size: 0.8rem;
        margin-top: 1rem;
    }

    // No Data
    .no-data {
        text-align: center;
        color: white;

        h2 {
            font-size: 2rem;
            margin-bottom: 1rem;
        }

        p {
            color: #aaa;
        }
    }
</style>
