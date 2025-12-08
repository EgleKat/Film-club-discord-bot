<script lang="ts">
    import FilmSelector from "./FilmSelector.svelte";

    const today = new Date();
    const nextSundayUtc = new Date(
        Date.UTC(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + (7 - today.getDay())
        )
    );
    export let usernames: string[];
    export let closeSidePanel: () => void;
</script>

<div class="set-next-film">
    <div class="panel-header">
        <h2 class="panel-title">Set Next Film</h2>
        <button
            class="close-button"
            on:click={closeSidePanel}
            aria-label="Close panel"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    </div>
    <form method="POST" action="?/meeting">
        <div class="form-row">
            <div class="form-group form-group--date">
                <label for="date-input" class="form-label">Date</label>
                <input
                    type="date"
                    id="date-input"
                    name="date"
                    class="form-input"
                    autocomplete="off"
                    value={nextSundayUtc.toISOString().substring(0, 10)}
                    required
                />
            </div>

            <fieldset class="form-fieldset">
                <legend class="form-legend">Host</legend>
                <div class="host-options">
                    {#each usernames as username}
                        <label class="host-option" for={username}>
                            <input
                                type="radio"
                                name="host"
                                value={username}
                                id={username}
                                autocomplete="off"
                                required
                            />
                            <span class="host-name">{username}</span>
                        </label>
                    {/each}
                </div>
            </fieldset>
        </div>

        <div class="form-group film-selector-container">
            <FilmSelector />
        </div>

        <button type="submit" class="submit-button" on:submit={closeSidePanel}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6L9 17l-5-5"/>
            </svg>
            <span>Set Next Film</span>
        </button>
    </form>
</div>

<style lang="scss">
    .set-next-film {
        padding: 1rem;
        background: $body-color;
        height: 100%;
        display: flex;
        flex-direction: column;

        @include desktop {
            padding: 1.25rem;
        }
    }

    .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid $section-border;
        flex-shrink: 0;
    }

    .panel-title {
        margin: 0;
        font-size: 1.25rem;
        color: $main-blue;
        font-weight: 700;
    }

    .close-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: #666;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
            background: rgba($main-red, 0.1);
            color: $main-red;
            transform: scale(1.1);
        }

        &:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba($main-blue, 0.2);
        }

        &:active {
            transform: scale(0.95);
        }
    }

    form {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
    }

    .form-row {
        display: flex;
        gap: 0.75rem;
        align-items: stretch;
        flex-shrink: 0;
        margin-bottom: 0.75rem;
    }

    .form-group {
        &--date {
            flex: 0 0 auto;
        }
    }

    .form-label {
        display: block;
        margin-bottom: 0.25rem;
        font-weight: 600;
        font-size: 0.8rem;
        color: $main-blue;
    }

    .form-input {
        padding: 0.5rem 0.6rem;
        border: 2px solid $section-border;
        border-radius: 6px;
        font-size: 0.85rem;
        background: white;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;

        &:focus {
            outline: none;
            border-color: $main-blue;
            box-shadow: 0 0 0 2px rgba($main-blue, 0.15);
        }
    }

    .form-fieldset {
        border: 2px solid $section-border;
        border-radius: 8px;
        padding: 0.4rem 0.6rem;
        margin: 0;
        background: white;
        flex: 1;
    }

    .form-legend {
        font-weight: 600;
        font-size: 0.8rem;
        color: $main-blue;
        padding: 0 0.25rem;
    }

    .host-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
    }

    .host-option {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.25rem 0.5rem;
        border: 1.5px solid $section-border;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        background: $body-color;
        font-size: 0.8rem;

        &:hover {
            border-color: $main-light-blue;
            background: rgba($main-light-blue, 0.1);
        }

        &:has(input:checked) {
            border-color: $main-blue;
            background: rgba($main-blue, 0.1);
        }

        input {
            accent-color: $main-blue;
            width: 12px;
            height: 12px;
        }
    }

    .host-name {
        font-size: 0.8rem;
    }

    .film-selector-container {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .submit-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.75rem 1rem;
        margin-top: 0.75rem;
        border: none;
        border-radius: 8px;
        background: linear-gradient(135deg, $main-blue 0%, darken($main-blue, 10%) 100%);
        color: white;
        font-size: 0.9rem;
        font-weight: 600;
        letter-spacing: 0.5px;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        flex-shrink: 0;

        svg {
            flex-shrink: 0;
        }

        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(white, 0.2),
                transparent
            );
            transition: left 0.5s ease;
        }

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba($main-blue, 0.35);

            &::before {
                left: 100%;
            }
        }

        &:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba($main-blue, 0.3), 0 4px 15px rgba($main-blue, 0.35);
        }

        &:active {
            transform: translateY(0);
            box-shadow: 0 2px 8px rgba($main-blue, 0.25);
        }
    }
</style>
