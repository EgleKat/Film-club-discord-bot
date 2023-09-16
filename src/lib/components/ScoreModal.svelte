<script lang="ts">
  import type { Score } from "$lib/types";

    export let title: string
    export let scores: Score[]
</script>

<section>
    <form method="post" action="?/score">
        <h1>Score - {title}</h1>
        Your score:
        <input type="text" name="score" placeholder="Enter your score" />
        <input type="submit" name="submit" value="Submit score" />
    </form>
    Scores:
    <ul>
    {#each scores as score}
    <li>{score.clubber} - {score.score}</li>
    {/each}
    </ul>
</section>