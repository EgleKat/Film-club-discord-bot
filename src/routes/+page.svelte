<svelte:head>
    <title>North Pole Film Club</title>
</svelte:head>


<script lang="ts">
    import type { OmdbFilm, Meeting } from '$lib/types';
    import lodash from 'lodash';
    const { debounce } = lodash;

    export let data: { meeting?: Meeting, usernames: string[] }
    const film = data.meeting?.film;

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
    {#if film }
        This weeks film:
        <article>
            <h1>{film.title} ({film.year})</h1>
            <h3>Chosen by {data.meeting?.host}</h3>
            <h3>To be discussed on {data.meeting?.date.toLocaleDateString()}</h3>
            <div>{film.plot}</div>
            <img src={film.poster} alt={`Poster for ${film.title}`} />
        </article>
    {:else}
        <p>
            No film set for this week yet!
        </p>
    {/if}
    <form method="POST">
        <p>
        Date:
        <input type="date" name="date"/>
        <p>
        <fieldset>
            <legend>Host</legend>
            {#each data?.usernames as username}
                <div>
                    <input type="radio" name="host" value={username} id={username} />
                    <label for={username}>{username}</label>
                </div>
            {/each}
        </fieldset>
        <p>
        Film:
        <input type="text" placeholder="Search for a film" on:input={searchFilm} />
        {#if autoCompleteList.length > 0}
        <ul>
            <fieldset style="border: none;">
            {#each autoCompleteList as film}
                <li style="list-style-type: none;">
                    <input type="radio" id={film.imdbID} name="film" value={film.imdbID} />
                    <label for={film.imdbID}>{film.Title} ({film.Year})</label>
                </li>
            {/each}
            </fieldset>
        </ul>
        {/if}

        <button type="submit">Set next film</button>
    </form>
</main>