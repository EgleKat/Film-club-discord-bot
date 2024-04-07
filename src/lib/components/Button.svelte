<script lang="ts">
    export let variant: "primary" | "secondary" | undefined;
    export let size: "small" | "medium" | "large" | undefined;

    const variantText = variant ? " button--" + variant : "";
    const sizeText = size ? " button--" + size : "";
    let buttonProps: any = {
        type: $$restProps.type,
        class: [$$restProps.class + " button" + variantText + sizeText],
    };
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<button on:click on:mouseover on:mouseenter on:mouseleave {...buttonProps}>
    <slot />
</button>

<style lang="scss">
    .button {
        border-radius: 7px;
        border: 1px solid $button-border;
        padding: 0.2rem 0.8rem;
        letter-spacing: 0.5px;
        display: button;
        margin-left: 0.2rem;
        &--primary {
            background-color: $button-primary-bg;
            color: $button-primary-color;
            border-color: $button-primary-border;
            &:hover,
            &:focus {
                background-color: $button-primary-hover-bg;
                border-color: $button-primary-hover-border;
            }
            &:active {
                background-color: $button-primary-active-bg;
            }
        }
        &--secondary {
            // TODO: implement
        }
        &--xsmall {
            // TODO: implement
            font-size: 0.5rem;
        }
        &--small {
            // TODO: implement
            font-size: 0.75rem;
            line-height: 1rem;
        }
        &--medium {
            font-size: 1rem;
            line-height: 1.25rem;
        }
        &--large {
            // TODO: implement
            font-size: 1.5rem;
        }
        &--xlarge {
            // TODO: implement
            font-size: 1.5rem;
        }
    }
</style>
