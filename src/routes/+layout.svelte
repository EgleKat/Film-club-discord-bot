<svelte:head>
    <title>North Pole Film Club</title>
</svelte:head>
<script lang="ts">
    import ProfileDropdown from '$lib/components/ProfileDropdown.svelte';
    import ProfileImageModal from '$lib/components/ProfileImageModal.svelte';
    import UserManagementModal from '$lib/components/UserManagementModal.svelte';
    import ChangePasswordModal from '$lib/components/ChangePasswordModal.svelte';
    import CalendarSubscribe from '$lib/components/CalendarSubscribe.svelte';

    type PageData = {
        username: string
        profileImageUrl: string | null
        baseUrl: string
    }
    export let data: PageData
    let username = data?.username;
    let profileImageUrl = data?.profileImageUrl;
    let baseUrl = data?.baseUrl;
    let isProfileModalOpen = false;
    let isUserManagementModalOpen = false;
    let isChangePasswordModalOpen = false;
    let isCalendarPopupOpen = false;

    // Check if it's December
    const now = new Date()
    const isDecember = now.getMonth() === 11
    const isSecondHalfOfDecember = isDecember && now.getDate() >= 15
    const showWrappedLink = isDecember

    function handleChangeImage() {
        isProfileModalOpen = true;
    }

    function handleManageUsers() {
        isUserManagementModalOpen = true;
    }

    function handleChangePassword() {
        isChangePasswordModalOpen = true;
    }

    function handleCalendar() {
        isCalendarPopupOpen = true;
    }

    function handleProfileUpdated(event: CustomEvent<{ imageUrl: string | null }>) {
        profileImageUrl = event.detail.imageUrl;
    }
</script>
<main>
    <div class="header">
        <div class="left-side">
            <span>North Pole Film Club </span>
            <a href="/">Home</a> |
            <a href="/meetings">Meetings</a> |
            <a href="/my-watchlist">My Watchlist</a> |
            <a href="/theme-spinner">Theme Spinner</a>
            {#if showWrappedLink}
                |
                {#if isSecondHalfOfDecember}
                    <a href="/wrapped" class="wrapped-link">✨ Wrapped ✨</a>
                {:else}
                    <span class="wrapped-coming-soon">✨ Wrapped (coming soon!) ✨</span>
                {/if}
            {/if}
        </div>
        <div class="right-side">
            <ProfileDropdown
                {username}
                imageUrl={profileImageUrl}
                on:changeImage={handleChangeImage}
                on:manageUsers={handleManageUsers}
                on:changePassword={handleChangePassword}
                on:calendar={handleCalendar}
            />
        </div>
    </div>
    <slot />
</main>

<ProfileImageModal
    bind:isOpen={isProfileModalOpen}
    currentImageUrl={profileImageUrl}
    {username}
    on:close={() => isProfileModalOpen = false}
    on:updated={handleProfileUpdated}
/>

<UserManagementModal
    bind:isOpen={isUserManagementModalOpen}
    on:close={() => isUserManagementModalOpen = false}
/>

<ChangePasswordModal
    bind:isOpen={isChangePasswordModalOpen}
    {username}
    on:close={() => isChangePasswordModalOpen = false}
/>

{#if isCalendarPopupOpen}
    <div class="popup-overlay" on:click={() => isCalendarPopupOpen = false} on:keydown={(e) => e.key === 'Escape' && (isCalendarPopupOpen = false)} role="button" tabindex="0">
        <div class="calendar-popup" on:click|stopPropagation on:keydown|stopPropagation role="dialog">
            <button class="popup-close" on:click={() => isCalendarPopupOpen = false}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            <CalendarSubscribe {baseUrl} />
        </div>
    </div>
{/if}

<style lang="scss" >
    .header {
        display: flex;
        justify-content: space-between;
        border-bottom: rgb(209, 203, 203) solid 1px;
        padding-bottom: 1rem;
        .left-side{
            :global(.wrapped-link) {
                background: linear-gradient(45deg, $main-orange, gold);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-weight: bold;
                animation: shimmer 2s ease-in-out infinite;
            }

            :global(.wrapped-coming-soon) {
                color: #999;
                font-style: italic;
                cursor: default;
            }
        }
        .right-side{
            text-transform: capitalize;
        }
    }

    @keyframes shimmer {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.2); }
    }

    :global(body) {
        width: 90vw;
        margin: 2vh auto;
        font-family: AR;
        background-color: $body-color;
        @include desktop {
            max-width: 60vw;
        }
    }

    .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(1px);
        -webkit-backdrop-filter: blur(1px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
    }

    .calendar-popup {
        background: transparent;
        border-radius: 16px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow: hidden;
        position: relative;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);

        :global(.calendar-subscribe) {
            margin: 0;
            border-radius: 16px;
        }
    }

    .popup-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 8px;
        z-index: 1;
        color: rgba(255, 255, 255, 0.8);
        transition: all 0.2s ease;

        &:hover {
            background: rgba(255, 255, 255, 0.15);
            color: white;
        }
    }

</style>