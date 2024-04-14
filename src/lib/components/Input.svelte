<script lang="ts">
    let props: any = {
        type: $$restProps.type,
        id: $$restProps.id,
        class: [$$restProps.class + " input"],
        name: $$restProps.name,
    };
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<input on:click on:mouseover on:mouseenter on:mouseleave {...props}/>

<style lang="scss">
    .input {
        border: none;
        border-bottom: $main-orange solid 1px;
        background-color: transparent;
        line-height: 1.2rem;
        font-size: 1rem;
        border-top-left-radius: 2px;
        border-top-right-radius: 2px;
        &:hover, &:focus {
            border-color: $main-blue;
        }
    }
    .score-input {
        max-width: 10rem;
    }
</style>
