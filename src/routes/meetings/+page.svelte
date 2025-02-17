<script lang="ts">
    import { getTitleWithOriginalTitle } from "$lib";
  import FilmTitle from "$lib/components/FilmTitle.svelte";
    import type { PageData } from "./$types"

    export let data: PageData
</script>

<table>
    <thead>
        <tr>
            <th>Film</th>
            <th>Date</th>
            <th>Host</th>
            <th>Score</th>
        </tr>
    </thead>
    <tbody>
        {#each data.meetings as meeting}
            <tr class:hidden={meeting.hidden}>
                <td><FilmTitle film={meeting.film} /></td>
                <td>{meeting.date.toLocaleDateString()}</td>
                <td>{meeting.host}</td>
                <td>{meeting.scores.map(score => score.clubber.slice(0, 2) + ":" + score.score).join(",")}</td>
                <td>
                    <form method="post" action="?/toggleHidden">
                        <input type="hidden" name="id" value={meeting.id} />
                        <button type="submit">
                            {#if meeting.hidden}
                                Unhide
                            {:else}
                                Hide
                            {/if}
                        </button>
                    </form>
                </td>
            </tr>
        {/each}
    </tbody>
</table>

<style>
    .hidden {
        color: grey;
    }
</style>