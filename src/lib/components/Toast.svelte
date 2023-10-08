<script lang="ts">
    let nodeRef: HTMLDivElement;
    export let title: string
    export let description: string
    export let status: "success" | "warning" | "error"
</script>

<style>

    .error {
        background-color: red;
    }
    .warning {
        background-color: yellow;
    }
    .success {
        background-color: green;
    }
    .hidden {
        display: none;
    }
</style>

<div class={"toast " + status} bind:this={nodeRef}>
    <span class:hidden={title}>
        {title}
    </span>
    <div class:hidden={description}>
        {description}
    </div>
    <button aria-label="Close" on:click={() => nodeRef?.parentNode?.removeChild(nodeRef)}>
        X
    </button>
</div>