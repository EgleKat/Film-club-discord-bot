<script lang="ts">
    import ScoreModal from '$lib/components/ScoreModal.svelte'
    import type { TmdbFilm, Meeting, Score } from '$lib/types'
    import lodash from 'lodash'
    const { debounce } = lodash

    export let data: { meeting?: Meeting, usernames: string[], scores: Score[]}
    const film = data.meeting?.film
    const scores = data.scores

    let autoCompleteList: TmdbFilm[] | null = null;

    const searchFilm = debounce((e: Event) => {
        e.preventDefault()
        const input = e.target as HTMLInputElement
        const title = input.value
        fetch(`/api/v1/tmdb/search?query=${encodeURIComponent(title)}`, { method: 'GET' })
            .then(res => res.json())
            .then(filmData => {
                autoCompleteList = filmData.results
            })
    }, 500)

    const today = new Date();
    const nextSundayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + (7 - today.getDay())));
</script>

<section>
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
    <form method="POST" action="?/meeting">
        <p>
        Date:
        <!--default to next sunday-->
        <input type="date" name="date" autocomplete="off" value={nextSundayUtc.toISOString().substring(0, 10)} />
        <p>
        <fieldset>
            <legend>Host</legend>
            {#each data?.usernames as username}
                <div>
                    <input type="radio" name="host" value={username} id={username} autocomplete="off" />
                    <label for={username}>{username}</label>
                </div>
            {/each}
        </fieldset>
        <p>
        Film:
        <input type="text" placeholder="Search for a film" on:input={searchFilm} autocomplete="off" />

        {#if !autoCompleteList}
            <p>Start typing to search for a film</p>
        {/if}
        {#if autoCompleteList && autoCompleteList.length === 0}
            <p>No films found</p>
        {/if}
        {#if autoCompleteList && autoCompleteList.length > 0}
        <ul>
            <fieldset style="border: none">
            {#each autoCompleteList as film}
                <li style="list-style-type: none;">
                    <input type="radio" id={film.id.toString()} name="film" value={film.id} autocomplete="off" />
                    <label for={film.id.toString()}>{film.original_title} ({film.release_date.substring(0, 4)})</label>
                </li>
            {/each}
            </fieldset>
        </ul>
        <button type="submit">Set next film</button>
        {/if}
    </form>
</section>
<section>
    <ScoreModal
        title={film?.title ?? ""}
        scores={scores}
    />
</section>