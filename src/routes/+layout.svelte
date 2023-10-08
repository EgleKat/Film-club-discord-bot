<svelte:head>
    <title>North Pole Film Club</title>
</svelte:head>
<main>
    North Pole Film Club |
    <a href="/">Home</a> |
    <a href="/meetings">Meetings</a>
    <slot />
</main>
<style lang="scss" >
    :global(body) {
        width: 90vw;
        margin: 2vh auto;
        font-family: AR;
    }
</style>