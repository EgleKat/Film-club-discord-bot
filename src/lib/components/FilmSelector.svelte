<script lang="ts">
    import type { TmdbFilm } from "$lib/types";
    import { debounce } from "lodash";
    import { getTitleWithOriginalTitle } from "$lib";

    let autoCompleteList: TmdbFilm[] | null = null;
    let selectedFilmId: number | null = null;

    const MAX_FILMS = 9;

    const searchFilm = debounce((e: Event) => {
        e.preventDefault();
        const input = e.target as HTMLInputElement;
        const title = input.value;
        fetch(`/api/v1/tmdb/search?query=${encodeURIComponent(title)}`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((filmData) => {
                autoCompleteList = filmData.results?.slice(0, MAX_FILMS) ?? [];
            });
    }, 200);

    function selectFilm(filmId: number) {
        selectedFilmId = filmId;
    }
</script>

<label for="filmSearch" class="search-label">Film:</label>
<input
    type="text"
    id="filmSearch"
    class="search-input"
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
    class="hidden-radio"
    tabindex="-1"
/>

{#if !autoCompleteList}
    <p class="search-hint">Start typing to search for a film</p>
{/if}
{#if autoCompleteList && autoCompleteList.length === 0}
    <p class="search-hint">No films found</p>
{/if}
{#if autoCompleteList && autoCompleteList.length > 0}
    <div class="films-grid">
        {#each autoCompleteList as film}
            <label
                class="film-card"
                class:selected={selectedFilmId === film.id}
                for={film.id.toString()}
            >
                <input
                    type="radio"
                    id={film.id.toString()}
                    name="film"
                    value={film.id}
                    autocomplete="off"
                    required
                    class="hidden-radio"
                    on:change={() => selectFilm(film.id)}
                />
                <div class="poster-container">
                    {#if film.poster_path}
                        <img
                            src="https://image.tmdb.org/t/p/w342{film.poster_path}"
                            alt="{film.title} poster"
                            class="film-poster"
                        />
                    {:else}
                        <div class="film-poster-placeholder">
                            <span class="no-poster-text">No Poster</span>
                        </div>
                    {/if}
                    <div class="title-overlay">
                        <span class="film-title">
                            {getTitleWithOriginalTitle({
                                title: film.title,
                                originalTitle: film.original_title,
                                year: film.release_date?.substring(0, 4) ?? 'unknown'
                            })}
                        </span>
                    </div>
                </div>
            </label>
        {/each}
    </div>
{/if}

<style lang="scss">
    .search-label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: $main-blue;
    }

    .search-input {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 2px solid $section-border;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
        background: white;

        &:focus {
            outline: none;
            border-color: $main-blue;
            box-shadow: 0 0 0 3px rgba($main-blue, 0.15);
        }

        &::placeholder {
            color: #999;
        }
    }

    .search-hint {
        color: #666;
        font-style: italic;
        margin: 1rem 0;
    }

    .hidden-radio {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
        pointer-events: none;
    }

    .films-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        margin-top: 1rem;
        max-height: 65vh;
        overflow-y: auto;
        padding: 0.25rem;

        @include desktop {
            grid-template-columns: repeat(3, 1fr);
        }
    }

    .film-card {
        position: relative;
        cursor: pointer;
        border-radius: 12px;
        overflow: hidden;
        border: 3px solid transparent;
        transition: border-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
        background: #1a1a2e;

        &:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        &.selected {
            border-color: $main-blue;
            box-shadow: 0 0 0 2px rgba($main-blue, 0.3), 0 8px 25px rgba($main-blue, 0.2);
        }
    }

    .poster-container {
        position: relative;
        aspect-ratio: 2 / 3;
        overflow: hidden;
    }

    .film-poster {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.4s ease, filter 0.4s ease;
    }

    .film-poster-placeholder {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #2d2d44 0%, #1a1a2e 100%);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .no-poster-text {
        color: #666;
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .title-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
            to top,
            rgba($main-blue, 0.95) 0%,
            rgba($main-blue, 0.85) 40%,
            rgba($main-blue, 0.7) 100%
        );
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        opacity: 0;
        transition: opacity 0.4s ease;
    }

    .film-card:hover .title-overlay,
    .film-card:focus-within .title-overlay {
        opacity: 1;
    }

    .film-card:hover .film-poster,
    .film-card:focus-within .film-poster {
        transform: scale(1.1);
        filter: blur(2px);
    }

    .film-title {
        color: white;
        font-size: 0.875rem;
        font-weight: 600;
        text-align: center;
        line-height: 1.4;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        transform: translateY(20px);
        transition: transform 0.4s ease;

        @include desktop {
            font-size: 1rem;
        }
    }

    .film-card:hover .film-title,
    .film-card:focus-within .film-title {
        transform: translateY(0);
    }
</style>
