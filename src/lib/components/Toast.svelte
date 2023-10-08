<script lang="ts">
    let nodeRef: HTMLDivElement;
    export let title: string;
    export let description: string;
    export let status: "success" | "warning" | "error";
</script>

<div class={"toast " + status} bind:this={nodeRef}>
    <span class:hidden={!title}>
        {title}
    </span>
    
    <div class="button-container">
        <button
            aria-label="Close"
            on:click={() => nodeRef?.parentNode?.removeChild(nodeRef)}
        >
            X
        </button>
    </div>
    <div class:hidden={!description}>
        {description}
    </div>
</div>

<style>
    .toast {
        & > * {
            display: flex;
        }
        position: absolute;
        top: 0.5rem;
        left: 1rem;
        width: calc(100% - 4rem);
        padding: 0.8rem;
        border-radius: 5px;
        display: grid;
        grid-template-columns: 95% auto;
        grid-template-rows: auto auto;
    }
    .button-container {
        align-items: center;
        justify-content: flex-end;
        grid-row-start: 1;
        grid-row-end: span 2;
        grid-column-start: 2;
        grid-column-end: 2;
        & > button {
            width: 1.5rem;
            height: 1.5rem;
            background-color: antiquewhite;
            border: 0.1rem;
            border-radius: 8px;
            box-shadow: 1px 1px 6px grey;
            opacity: 80%;
            &:hover {
                cursor: pointer;
                opacity: 90%;
            }
        }
    }
    .error {
        background-color: #ff4949;
    }
    .warning {
        background-color: #f6b145;
    }
    .success {
        background-color: #51c551;
    }
    .hidden {
        display: none;
    }
</style>
