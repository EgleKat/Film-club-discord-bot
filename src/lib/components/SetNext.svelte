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
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    </div>
    <form method="POST" action="?/meeting">
        <div class="form-group">
            <label for="date-input" class="form-label">Date:</label>
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

        <div class="form-group">
            <FilmSelector />
        </div>

        <button type="submit" class="submit-button" on:submit={closeSidePanel}>
            Set Next Film
        </button>
    </form>
</div>

<style lang="scss">
    .set-next-film {
        padding: 1.5rem;
        background: $body-color;
        min-height: 100%;
    }

    .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid $section-border;
    }

    .panel-title {
        margin: 0;
        font-size: 1.5rem;
        color: $main-blue;
        font-weight: 700;
    }

    .close-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        padding: 0;
        border: none;
        border-radius: 8px;
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
            box-shadow: 0 0 0 3px rgba($main-blue, 0.2);
        }

        &:active {
            transform: scale(0.95);
        }
    }

    .form-group {
        margin-bottom: 1.25rem;
    }

    .form-label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: $main-blue;
    }

    .form-input {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 2px solid $section-border;
        border-radius: 8px;
        font-size: 1rem;
        background: white;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;

        &:focus {
            outline: none;
            border-color: $main-blue;
            box-shadow: 0 0 0 3px rgba($main-blue, 0.15);
        }
    }

    .form-fieldset {
        border: 2px solid $section-border;
        border-radius: 12px;
        padding: 1rem;
        margin: 0 0 1.25rem 0;
        background: white;
    }

    .form-legend {
        font-weight: 600;
        color: $main-blue;
        padding: 0 0.5rem;
    }

    .host-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .host-option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border: 2px solid $section-border;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        background: $body-color;

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
        }
    }

    .host-name {
        font-size: 0.9rem;
    }

    .submit-button {
        width: 100%;
        padding: 1rem 1.5rem;
        margin-top: 1rem;
        border: none;
        border-radius: 10px;
        background: linear-gradient(135deg, $main-blue 0%, darken($main-blue, 10%) 100%);
        color: white;
        font-size: 1rem;
        font-weight: 600;
        letter-spacing: 0.5px;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;

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
            box-shadow: 0 6px 20px rgba($main-blue, 0.35);

            &::before {
                left: 100%;
            }
        }

        &:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba($main-blue, 0.3), 0 6px 20px rgba($main-blue, 0.35);
        }

        &:active {
            transform: translateY(0);
            box-shadow: 0 2px 10px rgba($main-blue, 0.25);
        }
    }
</style>
