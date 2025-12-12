<script lang="ts">
    import { createEventDispatcher, onDestroy } from 'svelte';

    export let isOpen = false;
    export let title = 'Confirm Action';
    export let message = 'Are you sure you want to proceed?';
    export let confirmText = 'Confirm';
    export let cancelText = 'Cancel';
    export let confirmButtonClass: 'primary' | 'danger' = 'primary';

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

    function confirm() {
        dispatch('confirm');
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
                <h3>{title}</h3>
            </div>

            <div class="dialog-body">
                <p>{message}</p>
            </div>

            <div class="dialog-footer">
                <button class="cancel-button" on:click={close}>
                    {cancelText}
                </button>
                <button
                    class="confirm-button"
                    class:danger={confirmButtonClass === 'danger'}
                    on:click={confirm}
                >
                    {confirmText}
                </button>
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
        background: rgba(0, 0, 0, 0.4);
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
        max-width: 400px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
        animation: slideIn 0.2s ease-out;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }

    .dialog-header {
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #eee;

        h3 {
            margin: 0;
            font-size: 1.1rem;
            color: #333;
        }
    }

    .dialog-body {
        padding: 1.5rem;

        p {
            margin: 0;
            color: #666;
            line-height: 1.5;
        }
    }

    .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        border-top: 1px solid #eee;
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

    .confirm-button {
        padding: 0.6rem 1.2rem;
        background: $main-blue;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        font-family: inherit;
        color: white;
        font-weight: 500;

        &:hover {
            background: darken($main-blue, 5%);
        }

        &.danger {
            background: #dc2626;

            &:hover {
                background: darken(#dc2626, 5%);
            }
        }
    }
</style>
