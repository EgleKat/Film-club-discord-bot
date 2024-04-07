<script lang="ts">
    import type { Score } from "$lib/types"
    import Button from "./Button.svelte";
    import Icon from "./Icon.svelte";
    
    export let title: string
    export let scores: Score[]
    export let numberOfSubmittedScores: number

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
        <Button variant="primary" size="medium" type="submit">
            <Icon type="check-circle" class="medium-button"/>
            Submit Score
        </Button>
    </form>
    <input 
        type="submit" 
        name="send-discord" 
        value="Send Scores to Discord" 
        on:click={sendScores}
    />
    {numberOfSubmittedScores} Scores Submitted
    <br>
    Scores:
    <ul>
    {#each scores as score}
        <li>{score.clubber} - {score.score}</li>
    {/each}
    </ul>
</section>