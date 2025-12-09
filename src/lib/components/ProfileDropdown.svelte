<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import UserAvatar from './UserAvatar.svelte';

    export let username: string;
    export let imageUrl: string | null = null;

    let isOpen = false;
    const dispatch = createEventDispatcher();

    function toggleDropdown() {
        isOpen = !isOpen;
    }

    function closeDropdown() {
        isOpen = false;
    }

    function handleChangeImage() {
        dispatch('changeImage');
        closeDropdown();
    }

    function handleManageUsers() {
        dispatch('manageUsers');
        closeDropdown();
    }

    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('.profile-dropdown')) {
            closeDropdown();
        }
    }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="profile-dropdown">
    <button class="dropdown-trigger" on:click|stopPropagation={toggleDropdown}>
        <UserAvatar {imageUrl} {username} size="1.5rem" />
        <span class="username">Hello, {username}</span>
        <svg class="chevron" class:open={isOpen} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6"/>
        </svg>
    </button>

    {#if isOpen}
        <div class="dropdown-menu">
            <button class="dropdown-item" on:click={handleChangeImage}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21"/>
                </svg>
                <span>Change profile image</span>
            </button>
            <button class="dropdown-item" on:click={handleManageUsers}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span>Manage users</span>
            </button>
        </div>
    {/if}
</div>

<style lang="scss">
    .profile-dropdown {
        position: relative;
    }

    .dropdown-trigger {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.4rem 0.6rem;
        border-radius: 8px;
        transition: background-color 0.2s;
        font-family: inherit;
        font-size: inherit;
        color: inherit;

        &:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }

        .username {
            text-transform: capitalize;
        }

        .chevron {
            transition: transform 0.2s;

            &.open {
                transform: rotate(180deg);
            }
        }
    }

    .dropdown-menu {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 0.5rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        min-width: 200px;
        z-index: 100;
        overflow: hidden;
    }

    .dropdown-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.75rem 1rem;
        background: none;
        border: none;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.9rem;
        color: #333;
        transition: background-color 0.2s;
        text-align: left;

        &:hover {
            background-color: #f5f5f5;
        }

        svg {
            flex-shrink: 0;
            color: #666;
        }
    }
</style>
