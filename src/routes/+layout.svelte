<svelte:head>
    <title>North Pole Film Club</title>
</svelte:head>
<script lang="ts">
    type PageData = {
        username: string
    }
    export let data: PageData
    let username = data?.username;

    // Check if it's December
    const now = new Date()
    const isDecember = now.getMonth() === 11
    const isSecondHalfOfDecember = isDecember && now.getDate() >= 15
    const showWrappedLink = isDecember

    // TMDB refresh
    let isRefreshing = false
    let refreshResult: { total: number, updated: number, skipped: number, errors: string[] } | null = null

    async function refreshTmdbData() {
        if (isRefreshing) return
        isRefreshing = true
        refreshResult = null
        try {
            const response = await fetch('/api/v1/tmdb/refresh', { method: 'POST' })
            refreshResult = await response.json()
        } catch (error) {
            refreshResult = { total: 0, updated: 0, skipped: 0, errors: [String(error)] }
        }
        isRefreshing = false
    }
</script>
<main>
    <div class="header">
        <div class="left-side">
            <span>North Pole Film Club </span>
            <a href="/">Home</a> |
            <a href="/meetings">Meetings</a> |
            <a href="/my-watchlist">My Watchlist</a> |
            <a href="/theme-spinner">Theme Spinner</a>
            {#if showWrappedLink}
                |
                {#if isSecondHalfOfDecember}
                    <a href="/wrapped" class="wrapped-link">✨ Wrapped ✨</a>
                {:else}
                    <span class="wrapped-coming-soon">✨ Wrapped (coming soon!) ✨</span>
                {/if}
            {/if}
        </div>
        <div class="right-side">
            <span class="username">
                Hello, {username}
            </span>
        </div>

    </div>
    <slot />
</main>
<footer>
    <button class="refresh-btn" on:click={refreshTmdbData} disabled={isRefreshing}>
        {#if isRefreshing}
            Refreshing TMDB data...
        {:else}
            Refresh TMDB Data
        {/if}
    </button>
    {#if refreshResult}
        <span class="refresh-result">
            Updated {refreshResult.updated}/{refreshResult.total} films
            {#if refreshResult.skipped > 0}(skipped {refreshResult.skipped}){/if}
            {#if refreshResult.errors.length > 0}
                - {refreshResult.errors.length} errors
            {/if}
        </span>
    {/if}
</footer>
<style lang="scss" >
    .header {
        display: flex;
        justify-content: space-between;
        border-bottom: rgb(209, 203, 203) solid 1px;
        padding-bottom: 1rem;
        .left-side{
            :global(.wrapped-link) {
                background: linear-gradient(45deg, $main-orange, gold);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-weight: bold;
                animation: shimmer 2s ease-in-out infinite;
            }

            :global(.wrapped-coming-soon) {
                color: #999;
                font-style: italic;
                cursor: default;
            }
        }
        .right-side{
            text-transform: capitalize;
        }
    }

    @keyframes shimmer {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.2); }
    }

    :global(body) {
        width: 90vw;
        margin: 2vh auto;
        font-family: AR;
        background-color: $body-color;
        @include desktop {
            max-width: 60vw;
        }
    }

    :global(footer) {
        margin-top: 3rem;
        padding-top: 1rem;
        border-top: 1px solid rgb(209, 203, 203);
        display: flex;
        align-items: center;
        gap: 1rem;
        font-size: 0.85rem;
        color: #666;

        .refresh-btn {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
            background: #e8e8e8;
            border: 1px solid #ccc;
            border-radius: 4px;
            cursor: pointer;
            color: #555;

            &:hover:not(:disabled) {
                background: #ddd;
            }

            &:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
        }

        .refresh-result {
            color: #666;
        }
    }

</style>