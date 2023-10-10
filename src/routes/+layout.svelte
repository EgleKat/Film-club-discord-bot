<svelte:head>
    <title>North Pole Film Club</title>
</svelte:head>
<script lang="ts">
    type PageData = {
        username: string
    }
    export let data: PageData
    let username = data?.username;
</script>
<main>
    <div class="header">
        <div class="left-side">
            <span>North Pole Film Club </span>
            <a href="/">Home</a> |
            <a href="/meetings">Meetings</a>
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

        }
        .right-side{
            text-transform: capitalize;
        }
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