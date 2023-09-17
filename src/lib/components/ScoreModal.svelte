<script lang="ts">
    import type { Score } from "$lib/types";

    export let title: string
    export let scores: Score[]

    const sendScores = () => {
        fetch("/api/v1/discord/scores", { method: 'POST' })
            .then(res => res.json())
            .then(res => {
                scores = res.scores
            })
    }
</script>

<section>
    <form method="post" action="?/score">
        <h1>Score - {title}</h1>
        Your score:
        <input type="text" name="score" placeholder="Enter your score" />
        <input type="submit" name="submit" value="Submit score" />
    </form>
    <input 
        type="submit" 
        name="send-discord" 
        value="Send Scores to Discord" 
        on:click={sendScores}
    />
    Scores:
    {#each scores as score}
    {score.clubber} {score.score}
    {/each}
</section>