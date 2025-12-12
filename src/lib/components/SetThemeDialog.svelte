<script lang="ts">
    import { createEventDispatcher, onDestroy } from 'svelte';
    import Button from './Button.svelte';

    export let isOpen = false;
    export let selectedTheme = '';
    export let defaultEndDate: Date;

    const dispatch = createEventDispatcher();

    // Lock body scroll when dialog is open
    $: if (typeof document !== 'undefined') {
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    onDestroy(() => {
        if (typeof document !== 'undefined') {
            document.body.style.overflow = '';
        }
    });

    function close() {
        dispatch('close');
    }

    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            close();
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            close();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
    <div class="dialog-backdrop" on:click={handleBackdropClick} role="dialog" aria-modal="true">
        <div class="dialog">
            <div class="dialog-header">
                <h3>Set Theme</h3>
                <button class="close-button" on:click={close} aria-label="Close">
                    ✕
                </button>
            </div>

            <div class="dialog-body">
                <form method="POST" action="?/setTheme">
                    <label>
                        <span class="label-text">Theme:</span>
                        <input
                            type="text"
                            name="theme"
                            bind:value={selectedTheme}
                            required
                        />
                    </label>
                    <label>
                        <span class="label-text">Theme ends on:</span>
                        <input
                            type="date"
                            name="endDate"
                            value={defaultEndDate.toISOString().substring(0, 10)}
                            required
                        />
                    </label>
                    <div class="dialog-actions">
                        <button type="button" class="cancel-button" on:click={close}>
                            Cancel
                        </button>
                        <Button type="submit" variant="primary">Set as current theme</Button>
                    </div>
                </form>
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
    .dialog-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1100;
    }

    .dialog {
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 420px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }

    .dialog-header {
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
            margin: 0;
            font-size: 1.25rem;
            color: #333;
        }

        .close-button {
            background: none;
            border: none;
            font-size: 1.25rem;
            cursor: pointer;
            color: #666;
            padding: 0.25rem;
            line-height: 1;

            &:hover {
                color: #333;
            }
        }
    }

    .dialog-body {
        padding: 1.5rem;

        form {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
        }

        label {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .label-text {
            font-weight: 500;
            color: #333;
        }

        input[type="date"],
        input[type="text"] {
            padding: 0.75rem;
            border-radius: 8px;
            border: 1px solid #ccc;
            font-size: 1rem;
            font-family: inherit;

            &:focus {
                outline: none;
                border-color: $main-blue;
                box-shadow: 0 0 0 3px rgba($main-blue, 0.15);
            }
        }
    }

    .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 0.5rem;
    }

    .cancel-button {
        padding: 0.6rem 1.2rem;
        background: #f0f0f0;
        border: 1px solid #ddd;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        font-family: inherit;
        color: #333;

        &:hover {
            background: #e5e5e5;
        }
    }
</style>
