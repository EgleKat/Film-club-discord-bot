<script lang="ts">
    import { getTitleWithOriginalTitle } from "$lib";
    import type { Meeting } from "$lib/types";

    export let data: { meetings: Meeting[]}
</script>

<table>
    <thead>
        <tr>
            <th>Date</th>
            <th>Host</th>
            <th>Film</th>
            <th>Score</th>
        </tr>
    </thead>
    <tbody>
        {#each data.meetings as meeting}
            <tr class:hidden={meeting.hidden}>
                <td>{meeting.date.toLocaleDateString()}</td>
                <td>{meeting.host}</td>
                <td>{getTitleWithOriginalTitle(meeting.film)}</td>
                <td>{meeting.scores.map(score => score.clubber[0] + ":" + score.score).join(",")}</td>
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