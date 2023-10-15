<script lang="ts">
    import ScoreModal from '$lib/components/ScoreModal.svelte'
    import type { TmdbFilm, Meeting, Score } from '$lib/types'
    import lodash from 'lodash'
    import Toast from '$lib/components/Toast.svelte'
    import Icon from '$lib/components/Icon.svelte';
    import SpanWithIcon from '$lib/components/SpanWithIcon.svelte';
    const { debounce } = lodash

    type PageData = {
        meeting?: Meeting
        usernames: string[]
        scores: Score[] 
        numberOfSubmittedScores: number,
    }

    export let data: PageData
    export let form
    const meeting = data.meeting
    const film = meeting?.film
    const scores = data?.scores
    const numberOfSubmittedScores = data?.numberOfSubmittedScores
    let autoCompleteList: TmdbFilm[] | null = null

    const searchFilm = debounce((e: Event) => {
        e.preventDefault()
        const input = e.target as HTMLInputElement
        const title = input.value
        fetch(`/api/v1/tmdb/search?query=${encodeURIComponent(title)}`, { method: 'GET' })
            .then(res => res.json())
            .then(filmData => {
                autoCompleteList = filmData.results
            })
    }, 200)

    const today = new Date();
    const nextSundayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + (7 - today.getDay())));
</script>

<section>
    {#if form?.error}
        <Toast status="error" title="Error" description={form.error}/>
    {/if}
    {#if film }
        <div class="this-week">
            <SpanWithIcon>
                <span> This week, chosen by </span> <Icon type="user" /> <span class="film-host">{meeting?.host}</span>
            </SpanWithIcon>
        </div>
        <div>
            <SpanWithIcon>
                <span>To be discussed on </span> <Icon type="calendar-mark" /> <span>{meeting?.date.toLocaleDateString()}</span></SpanWithIcon>
        </div>
        

        <div class="film-description">
            <div class="film-title">{film.title} ({film.year})</div>
            <div class="film-poster-and-plot">
                <img class="film-poster" src={film.poster} alt={`Poster for ${film.title}`} />
                <p class="film-plot">{film.plot}</p>
            </div>
        </div>
    {:else}
        <p>
            No film set for this week yet!
        </p>
    {/if}
    <form method="POST" action="?/meeting" onerror="">
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
    {#if film }
    <ScoreModal
        title={film?.title ?? ""}
        {scores}
        {numberOfSubmittedScores}
    />
    {/if}
</section>

<style lang="scss">
    .this-week {
        margin-top: 2rem;
        .film-host {
            font-weight: bold;
            text-transform: capitalize;
        }

    }
    .film-description {
        margin: 1rem 0;
        background-color: $main-orange;
        padding: 2rem;
        margin-bottom: 2rem;
        position: relative;
        $cutout-height: 6rem;
        margin-bottom: $cutout-height;
        padding-bottom: $cutout-height - 2rem;
        &:after {
            content: "";
            position: absolute;
            display: block;
            left: 0rem;
            width: 101%;
            background-color: #f0f0ff;
            transform: skewY(-3deg);
            border-top: solid #f0f0ff $cutout-height;
        }
        .film-title {
            color: #2a1a04;
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
        }
    .film-poster-and-plot {
        border-radius: 4px;
        margin-bottom: 3rem;
        display: flex;
        gap: 1rem;
        align-items: center;
        @include tablet {
            flex-direction: column;
        }
        @include desktop {
            flex-direction: row;
        }
        .film-poster {
            border-radius: 8px;
            height: auto;
            flex: 0 0 auto;
            @include tablet{
                width: 60%;
                max-height: 90vw;
            }
            @include desktop{
                width: 50%;
            }
        }
        .film-plot {
            margin: auto 1rem;
            padding: 1rem;
            border-radius: 4px;
            line-height: 1.5rem;
            background-color: $main-blue;
            color: #cadff4;
            z-index: 1;
            transform: skewY(-3deg);
        }
    }
    }
</style>