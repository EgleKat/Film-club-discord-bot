<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import UserAvatar from './UserAvatar.svelte';

    interface User {
        username: string;
        imageUrl: string | null;
        hidden: boolean;
        updatedAt: string | null;
    }

    export let isOpen = false;

    let users: User[] = [];
    let isLoading = true;
    let error: string | null = null;
    let newUsername = '';
    let isAddingUser = false;
    let addUserError: string | null = null;

    const dispatch = createEventDispatcher();

    $: if (isOpen) {
        loadUsers();
    }

    async function loadUsers() {
        isLoading = true;
        error = null;
        try {
            const response = await fetch('/api/v1/users');
            if (response.ok) {
                const data = await response.json();
                users = data.users;
            } else {
                error = 'Failed to load users';
            }
        } catch (e) {
            error = 'Failed to load users';
        } finally {
            isLoading = false;
        }
    }

    function close() {
        dispatch('close');
    }

    async function toggleUserHidden(username: string) {
        try {
            const response = await fetch(`/api/v1/users/${encodeURIComponent(username)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggle-hidden' })
            });

            if (response.ok) {
                const data = await response.json();
                // Update local state
                users = users.map(u =>
                    u.username === username ? { ...u, hidden: data.user.hidden } : u
                );
            }
        } catch (e) {
            console.error('Failed to toggle user:', e);
        }
    }

    async function addUser() {
        if (!newUsername.trim()) {
            addUserError = 'Username is required';
            return;
        }

        isAddingUser = true;
        addUserError = null;

        try {
            const response = await fetch('/api/v1/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: newUsername.trim() })
            });

            const data = await response.json();

            if (response.ok) {
                newUsername = '';
                await loadUsers();
            } else {
                addUserError = data.error || 'Failed to add user';
            }
        } catch (e) {
            addUserError = 'Failed to add user';
        } finally {
            isAddingUser = false;
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

    function handleAddUserKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            addUser();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
    <div class="modal-backdrop" on:click={handleBackdropClick} role="dialog" aria-modal="true">
        <div class="modal">
            <div class="modal-header">
                <h2>Manage Users</h2>
                <button class="close-button" on:click={close} aria-label="Close">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            <div class="modal-body">
                {#if isLoading}
                    <div class="loading">Loading users...</div>
                {:else if error}
                    <div class="error">{error}</div>
                {:else}
                    <div class="add-user-section">
                        <h3>Add New User</h3>
                        <div class="add-user-row">
                            <input
                                type="text"
                                bind:value={newUsername}
                                placeholder="Enter username"
                                on:keydown={handleAddUserKeydown}
                                disabled={isAddingUser}
                            />
                            <button
                                class="add-button"
                                on:click={addUser}
                                disabled={isAddingUser || !newUsername.trim()}
                            >
                                {isAddingUser ? 'Adding...' : 'Add'}
                            </button>
                        </div>
                        {#if addUserError}
                            <span class="add-user-error">{addUserError}</span>
                        {/if}
                    </div>

                    <div class="users-section">
                        <h3>Users ({users.length})</h3>
                        <div class="users-list">
                            {#each users as user (user.username)}
                                <div class="user-row" class:hidden={user.hidden}>
                                    <div class="user-info">
                                        <UserAvatar imageUrl={user.imageUrl} username={user.username} size="2rem" />
                                        <span class="user-name">{user.username}</span>
                                        {#if user.hidden}
                                            <span class="hidden-badge">Hidden</span>
                                        {/if}
                                    </div>
                                    <button
                                        class="toggle-button"
                                        class:show={user.hidden}
                                        on:click={() => toggleUserHidden(user.username)}
                                    >
                                        {user.hidden ? 'Show' : 'Hide'}
                                    </button>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>

            <div class="modal-footer">
                <button class="done-button" on:click={close}>
                    Done
                </button>
            </div>
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
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal {
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
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
        overflow-y: auto;
        flex: 1;
    }

    .loading, .error {
        text-align: center;
        padding: 2rem;
        color: #666;
    }

    .error {
        color: #de3c4b;
    }

    .add-user-section {
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #eee;

        h3 {
            margin: 0 0 0.75rem 0;
            font-size: 1rem;
            color: #333;
        }

        .add-user-row {
            display: flex;
            gap: 0.5rem;

            input {
                flex: 1;
                padding: 0.6rem 0.75rem;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-size: 0.9rem;
                font-family: inherit;

                &:focus {
                    outline: none;
                    border-color: $main-blue;
                    box-shadow: 0 0 0 3px rgba($main-blue, 0.1);
                }

                &:disabled {
                    background: #f5f5f5;
                }
            }

            .add-button {
                padding: 0.6rem 1rem;
                background: $main-blue;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 0.9rem;
                font-family: inherit;
                color: white;
                font-weight: 500;
                white-space: nowrap;

                &:hover:not(:disabled) {
                    background: darken($main-blue, 5%);
                }

                &:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
            }
        }

        .add-user-error {
            display: block;
            margin-top: 0.5rem;
            font-size: 0.85rem;
            color: #de3c4b;
        }
    }

    .users-section {
        h3 {
            margin: 0 0 0.75rem 0;
            font-size: 1rem;
            color: #333;
        }
    }

    .users-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .user-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background: #f9f9f9;
        border-radius: 8px;
        transition: background-color 0.2s;

        &.hidden {
            background: #f0f0f0;
            opacity: 0.7;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 0.75rem;

            .user-name {
                font-weight: 500;
                color: #333;
                text-transform: capitalize;
            }

            .hidden-badge {
                font-size: 0.75rem;
                padding: 0.15rem 0.5rem;
                background: #999;
                color: white;
                border-radius: 4px;
            }
        }

        .toggle-button {
            padding: 0.4rem 0.8rem;
            background: #f0f0f0;
            border: 1px solid #ddd;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85rem;
            font-family: inherit;
            color: #666;
            transition: all 0.2s;

            &:hover {
                background: #e5e5e5;
            }

            &.show {
                background: $main-blue;
                border-color: $main-blue;
                color: white;

                &:hover {
                    background: darken($main-blue, 5%);
                }
            }
        }
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        padding: 1rem 1.5rem;
        border-top: 1px solid #eee;
    }

    .done-button {
        padding: 0.6rem 1.5rem;
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
    }
</style>
