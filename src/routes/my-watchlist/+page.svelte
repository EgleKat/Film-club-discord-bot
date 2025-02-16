<script lang="ts">
    import { getTitleWithOriginalTitle } from "$lib";
    import { quintOut } from "svelte/easing";
    import type { PageData } from './$types';
    import { slide } from "svelte/transition";
    import Button from "$lib/components/Button.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import FilmSelector from "$lib/components/FilmSelector.svelte";
    import Input from "$lib/components/Input.svelte";

    export let data: PageData
    let watchedWatchlist = data.watchlist.filter(watchlistEntry => watchlistEntry.dateWatched != null);
    let unwatchedWatchlist = data.watchlist.filter(watchlistEntry => watchlistEntry.dateWatched == null);
    let isSidePanelOpen = false;
    let closeSidePanel = () => (isSidePanelOpen = false);
    let watched = false;
    const initDateInput = (node: HTMLInputElement) => {
        node.valueAsDate = new Date();
    };
    let showHidden = false;
    let showWatchedInMeetings = true;
</script>
{#if isSidePanelOpen}
    <div
        class="side-panel"
        transition:slide={{
            delay: 250,
            duration: 300,
            easing: quintOut,
            axis: "x",
        }}
    >
        <button class="icon-button" on:click={closeSidePanel}>Close</button>
        <form method="POST" action="?/addFilm">
            <p>
                <input type="checkbox" value="{watched}" on:click={() => watched = !watched} id="watched" /><label for="watched">Watched?</label>
            </p>
            {#if watched}
                <p>
                    Date watched: <input type="date" name="dateWatched" required use:initDateInput />
                </p>
                <p>
                    <label for="score">
                        Your score:
                    </label>
                    <div class="score-form__inputs">
                        <Input type="text" name="score" placeholder="Enter your score" id="score" class="score-input" required/>
                    </div>
            {/if}
            <p>
                <FilmSelector />
            </p>
            <button type="submit" class="add-film" on:submit={closeSidePanel}>Add Film</button>
        </form>
    </div>
{/if}
<h1>My Watchlist</h1>
<Button variant="tertiary" size="small" class="add-film" on:click={() => (isSidePanelOpen = !isSidePanelOpen)}>
    Add film
    <Icon type="chevron-double-right" width="1.5rem" height="1.5rem" />
</Button>
<label for="showHidden">Show hidden films</label><input type="checkbox" bind:checked={showHidden} id="showHidden" />
<br>
<label for="showWatchedInMeetings">Show films watched for meetings</label><input type="checkbox" bind:checked={showWatchedInMeetings} id="showWatchedInMeetings" />
<h2>Watched</h2>
<table>
    <thead>
        <tr>
            <th>Date</th>
            <th>Film</th>
            <th>Score</th>
        </tr>
    </thead>
    <tbody>
        {#each watchedWatchlist as watchlistEntry}
            {#if (showHidden || !watchlistEntry.hidden) && (showWatchedInMeetings || !watchlistEntry.isMeeting)}
            <tr class:hidden={watchlistEntry.hidden}>
                <td>{watchlistEntry.dateWatched.toLocaleDateString()}</td>
                <td>{getTitleWithOriginalTitle(watchlistEntry.film)}</td>
                <td>{watchlistEntry.scores.filter(score => score.score != null).map(score => score.clubber.slice(0, 2) + ":" + score.score).join(",")}</td>
                {#if !watchlistEntry.isMeeting}
                <td>
                    <form method="post" action="?/toggleHidden">
                        <input type="hidden" name="id" value={watchlistEntry.id} />
                        <button type="submit">
                            {#if watchlistEntry.hidden}
                                Unhide
                            {:else}
                                Hide
                            {/if}
                        </button>
                    </form>
                </td>
                {/if}
            </tr>
            {/if}
        {:else}
            <tr>
                <td colspan="3">No films watched yet</td>
            </tr>
        {/each}
    </tbody>
</table>

<h2>Unwatched</h2>
<table>
    <thead>
        <tr>
            <th>Film</th>
            <th>Other people's scores</th>
        </tr>
    </thead>
    <tbody>
        {#each unwatchedWatchlist as watchlistEntry}
            {#if showHidden || !watchlistEntry.hidden}
            <tr class:hidden={watchlistEntry.hidden}>
                <td>{getTitleWithOriginalTitle(watchlistEntry.film)}</td>
                {#if watchlistEntry.scores.length > 0}
                <td>{watchlistEntry.scores.filter(score => score.score != null).map(score => score.clubber.slice(0, 2) + ":" + score.score).join(",")}</td>
                {:else}
                <td></td>
                {/if}
                <td>
                    <form method="post" action="?/toggleHidden">
                        <input type="hidden" name="id" value={watchlistEntry.id} />
                        <button type="submit">
                            {#if watchlistEntry.hidden}
                                Unhide
                            {:else}
                                Hide
                            {/if}
                        </button>
                    </form>
                </td>
                <td>
                    <button on:click={() => document.getElementById(`score-popover-${watchlistEntry.id}`).showModal()}>Add Score</button>
                    <dialog id="score-popover-{watchlistEntry.id}">
                        <form method="post" action="?/submitScore">
                            <input type="hidden" name="id" value={watchlistEntry.id} />
                            <label for="score-{watchlistEntry.id}">
                                Your score:
                            </label>
                            <Input type="text" name="score" placeholder="Enter your score" id="score-{watchlistEntry.id}" class="score-input"/>
                            <label for="date-{watchlistEntry.id}">
                                Date watched:
                            </label>
                            <input type="date" name="dateWatched" required id="date-{watchlistEntry.id}" use:initDateInput />
                            <button type="submit">
                                Submit Score
                            </button>
                        </form>
                    </dialog>
                </td>
            </tr>
            {/if}
        {:else}
            <tr>
                <td colspan="3">Congratulations, you watched everything! Why not add another?</td>
            </tr>
        {/each}
    </tbody>
</table>

<style lang="scss">
    .hidden {
        color: grey;
    }
    .side-panel {
        background: rgb(216, 216, 216);
        right: 0;
        position: fixed;
        top: 1vh;
        height: 90vh;
        margin: auto;
        padding: 2rem;
        z-index: 1;
        border-left: 1px solid rgb(184, 184, 184);
        padding-left: 3rem;
    }
    .add-film {
        font-size: large;
        height: 8rem;
        width: 8rem;
        background-color: $main-blue;
        color: rgb(229, 230, 244);
        padding: 1rem;
        border-radius: 50%;
    }
</style>