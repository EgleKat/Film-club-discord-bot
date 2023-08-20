<svelte:head>
    <title>North Pole Film Club</title>
</svelte:head>


<script lang="ts">
    import FilmCard from '$lib/FilmCard.svelte'
    import type { OmdbFilm } from '$lib/types';
    import type { Film } from '@prisma/client'
    import { debounce } from 'lodash';

    export let data: { currentFilm?: Film }

    let autoCompleteList: HTMLUListElement;

    const searchFilm = debounce((e: Event) => {
        e.preventDefault()
        const input = e.target as HTMLInputElement;
        const title = input.value
        fetch(`/api/v1/omdb?type=movie&s=${encodeURIComponent(title)}`, { method: 'GET' })
            .then(res => res.json())
            .then(filmData => {
                autoCompleteList.innerHTML = ''
                autoCompleteList.append(...filmData.Search.map((film: OmdbFilm) => {
                    const li = document.createElement('li')
                    li.textContent = film.Title
                    li.addEventListener('click', () => {
                        input.value = film.Title
                    })
                    return li
                }))
            })
    }, 500)
</script>

<main>
    {#if data.currentFilm }
        This weeks film: <FilmCard film={data.currentFilm} />
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
        <ul bind:this={autoCompleteList}>

        </ul>
        <button type="submit">Set Film</button>
    </form>
</main>