<svelte:head>
    <title>North Pole Film Club</title>
</svelte:head>


<script lang="ts">
    import type { OmdbFilm } from '$lib/types';
    import { debounce } from 'lodash';

    export let data: { currentFilm?: OmdbFilm }

    let autoCompleteList: OmdbFilm[] = [];

    const searchFilm = debounce((e: Event) => {
        e.preventDefault()
        const input = e.target as HTMLInputElement;
        const title = input.value
        fetch(`/api/v1/omdb?type=movie&s=${encodeURIComponent(title)}`, { method: 'GET' })
            .then(res => res.json())
            .then(filmData => {
                autoCompleteList = filmData.Search
            })
    }, 500)
</script>

<main>
    {#if data.currentFilm }
        This weeks film:
        <article>
            <h1>{data.currentFilm.Title} ({data.currentFilm.Year})</h1>
        </article>
    {:else}
        <p>
            No film set for this week yet!
        </p>
    {/if}
    <p>
    Set film:
    <form>
        <!--Searches a film database for film suggestions-->
        <input type="text" placeholder="Search for a film" on:input={searchFilm} />
        <ul>
            {#each autoCompleteList as film}
                <li>
                    <button type="button" on:click={() => data.currentFilm = film }>
                        {film.Title} ({film.Year})
                    </button>
                </li>
            {/each}
        </ul>
        <button type="submit">Set Film</button>
    </form>
</main>