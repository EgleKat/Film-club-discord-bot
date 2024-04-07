<script lang="ts">
    export let type: string;
    export let width: string = "1rem";
    export let height: string = "1rem";
</script>

<svg class={$$props.class} width={width} height={height}>
    <use href={`/svg/icons.svg#${type}`} />
</svg>


<style lang="scss">
    svg {
        &.medium-button {
            margin-bottom: -2px;
        }
    }
</style>