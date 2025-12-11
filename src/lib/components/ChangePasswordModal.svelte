<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let isOpen = false;
    export let username: string;

    let currentPassword = '';
    let newPassword = '';
    let confirmPassword = '';
    let isSubmitting = false;
    let error: string | null = null;
    let success = false;

    const dispatch = createEventDispatcher();

    $: if (isOpen) {
        currentPassword = '';
        newPassword = '';
        confirmPassword = '';
        error = null;
        success = false;
    }

    function close() {
        dispatch('close');
    }

    async function handleSubmit() {
        error = null;

        if (!currentPassword) {
            error = 'Current password is required';
            return;
        }

        if (!newPassword) {
            error = 'New password is required';
            return;
        }

        if (newPassword.length < 4) {
            error = 'New password must be at least 4 characters';
            return;
        }

        if (newPassword !== confirmPassword) {
            error = 'New passwords do not match';
            return;
        }

        isSubmitting = true;

        try {
            const response = await fetch(`/api/v1/users/${encodeURIComponent(username)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'change-password',
                    currentPassword,
                    newPassword
                })
            });

            const result = await response.json();

            if (response.ok) {
                success = true;
                setTimeout(() => {
                    close();
                }, 1500);
            } else {
                error = result.error || 'Failed to change password';
            }
        } catch (e) {
            error = 'Failed to change password';
        } finally {
            isSubmitting = false;
        }
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
    <div class="modal-backdrop" on:click={handleBackdropClick} role="dialog" aria-modal="true">
        <div class="modal">
            <div class="modal-header">
                <h2>Change Password</h2>
                <button class="close-button" on:click={close} aria-label="Close">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            <div class="modal-body">
                {#if success}
                    <div class="success-message">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        <p>Password changed successfully!</p>
                    </div>
                {:else}
                    <div class="input-section">
                        <label for="current-password">Current Password</label>
                        <input
                            id="current-password"
                            type="password"
                            bind:value={currentPassword}
                            placeholder="Enter your current password"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div class="input-section">
                        <label for="new-password">New Password</label>
                        <input
                            id="new-password"
                            type="password"
                            bind:value={newPassword}
                            placeholder="Enter your new password"
                            disabled={isSubmitting}
                        />
                        <span class="hint">Must be at least 4 characters</span>
                    </div>

                    <div class="input-section">
                        <label for="confirm-password">Confirm New Password</label>
                        <input
                            id="confirm-password"
                            type="password"
                            bind:value={confirmPassword}
                            placeholder="Re-enter your new password"
                            disabled={isSubmitting}
                        />
                    </div>

                    {#if error}
                        <div class="error-message">{error}</div>
                    {/if}
                {/if}
            </div>

            {#if !success}
                <div class="modal-footer">
                    <button class="cancel-button" on:click={close} disabled={isSubmitting}>
                        Cancel
                    </button>
                    <button
                        class="save-button"
                        on:click={handleSubmit}
                        disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
                    >
                        {isSubmitting ? 'Changing...' : 'Change Password'}
                    </button>
                </div>
            {/if}
        </div>
    </div>
{/if}

<style lang="scss">
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal {
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #eee;

        h2 {
            margin: 0;
            font-size: 1.2rem;
            color: #333;
        }
    }

    .close-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem;
        color: #666;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
            background: #f0f0f0;
            color: #333;
        }
    }

    .modal-body {
        padding: 1.5rem;
    }

    .success-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem 1rem;
        color: #22c55e;

        svg {
            margin-bottom: 1rem;
        }

        p {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 500;
            color: #333;
        }
    }

    .input-section {
        margin-bottom: 1rem;

        &:last-of-type {
            margin-bottom: 0;
        }

        label {
            display: block;
            font-size: 0.9rem;
            font-weight: 500;
            color: #333;
            margin-bottom: 0.5rem;
        }

        input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 0.9rem;
            font-family: inherit;
            box-sizing: border-box;

            &:focus {
                outline: none;
                border-color: $main-blue;
                box-shadow: 0 0 0 3px rgba($main-blue, 0.1);
            }

            &:disabled {
                background: #f5f5f5;
            }
        }

        .hint {
            display: block;
            margin-top: 0.5rem;
            font-size: 0.8rem;
            color: #888;
        }
    }

    .error-message {
        margin-top: 1rem;
        padding: 0.75rem;
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 8px;
        color: #dc2626;
        font-size: 0.9rem;
    }

    .modal-footer {
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

        &:hover:not(:disabled) {
            background: #e5e5e5;
        }

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    }

    .save-button {
        padding: 0.6rem 1.2rem;
        background: $main-blue;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        font-family: inherit;
        color: white;
        font-weight: 500;

        &:hover:not(:disabled) {
            background: darken($main-blue, 5%);
        }

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    }
</style>
