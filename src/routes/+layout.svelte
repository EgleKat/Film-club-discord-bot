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

</style>