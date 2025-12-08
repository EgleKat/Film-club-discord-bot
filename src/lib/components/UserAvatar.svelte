<script lang="ts">
    import Icon from "./Icon.svelte";

    export let imageUrl: string | null = null;
    export let size: string = "1.2rem";
    export let username: string = "";
</script>

{#if imageUrl}
    <img
        class="user-avatar"
        src={imageUrl}
        alt={username ? `${username}'s avatar` : 'User avatar'}
        style="width: {size}; height: {size};"
    />
{:else}
    <Icon type="user" width={size} height={size} />
{/if}

<style lang="scss">
    .user-avatar {
        border-radius: 50%;
        object-fit: cover;
        vertical-align: middle;
    }
</style>
