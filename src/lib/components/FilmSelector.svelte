<script lang="ts">
    import type { TmdbFilm } from "$lib/types";
    import { debounce } from "lodash";
    import { getTitleWithOriginalTitle } from "$lib";

    let autoCompleteList: TmdbFilm[] | null = null;
    const searchFilm = debounce((e: Event) => {
        e.preventDefault();
        const input = e.target as HTMLInputElement;
        const title = input.value;
        fetch(`/api/v1/tmdb/search?query=${encodeURIComponent(title)}`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((filmData) => {
                autoCompleteList = filmData.results;
            });
    }, 200);
</script>

<label for="filmSearch">Film:</label>
<input
    type="text"
    id="filmSearch"
    placeholder="e.g. Titanic"
    on:input={searchFilm}
    autocomplete="off"
/>
<!-- Hidden radio button to ensure the form can't be submitted even if there's no search-->
<input
    type="radio"
    name="film"
    value=""
    autocomplete="off"
    required
    style="width: 0"
    tabindex="-1"
/>

{#if !autoCompleteList}
    <p>Start typing to search for a film</p>
{/if}
{#if autoCompleteList && autoCompleteList.length === 0}
    <p>No films found</p>
{/if}
{#if autoCompleteList && autoCompleteList.length > 0}
    <ul>
        {#each autoCompleteList as film}
        <li class="film-option">
            <input
                type="radio"
                id={film.id.toString()}
                name="film"
                value={film.id}
                autocomplete="off"
                required
            />
            <label for={film.id.toString()} class="film-label">
                {#if film.poster_path}
                    <img
                        src="https://image.tmdb.org/t/p/w92{film.poster_path}"
                        alt="{film.title} poster"
                        class="film-poster"
                    />
                {:else}
                    <div class="film-poster-placeholder"></div>
                {/if}
                <span class="film-title">{getTitleWithOriginalTitle({title: film.title, originalTitle: film.original_title, year: film.release_date?.substring(0, 4) ?? 'unknown'})}</span>
            </label>
        </li>
        {/each}
    </ul>
{/if}

<style lang="scss">
    ul {
        overflow-y: auto;
        max-height: 60vh;
        padding-left: 0;
    }

    .film-option {
        list-style-type: none;
        margin-bottom: 0.5rem;
    }

    .film-label {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
    }

    .film-poster {
        width: 46px;
        height: 69px;
        object-fit: cover;
        border-radius: 4px;
        flex-shrink: 0;
    }

    .film-poster-placeholder {
        width: 46px;
        height: 69px;
        background-color: var(--secondary-bg, #333);
        border-radius: 4px;
        flex-shrink: 0;
    }

    .film-title {
        flex: 1;
    }
</style>