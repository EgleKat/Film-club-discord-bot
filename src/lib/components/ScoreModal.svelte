<script lang="ts">
    import type { Score } from "$lib/types"
    import Button from "./Button.svelte";
    import Icon from "./Icon.svelte";
    import Input from "./Input.svelte";
    
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
    <form method="post" action="?/score" class="score-form">
        <div class="score-form__film">Score for - <span class="score-form__film-name">
            {title}
        </span>
    </div>
        <label for="score">
            Your score:
        </label>
        <div class="score-form__inputs">
            <Input type="text" name="score" placeholder="Enter your score" id="score" class="score-input"/>
            <Button variant="secondary" size="medium" type="submit">
                <Icon type="tick" class="medium-button" width="1.25rem" height="1.25rem"/>
                Submit Score
            </Button>
        </div>
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

<style lang="scss">
    .score-form {
        padding-left: 1rem;
        padding-bottom: 1rem;
        padding-right: 1.5rem;
        margin-top: 1rem;
        margin-bottom: 1rem;
        border-radius: 2px;
        background-color: $section-bg;
        font-weight: normal;
        &__film{
            font-size: 1.25rem;
            padding-top: 1rem;
            padding-bottom: 0.4rem;
            margin-bottom: 1rem;
            border-bottom: $section-border 1px solid;
            &-name {                
                letter-spacing: 0.4px;
                font-weight: 700; 
            }
        }
        label {
            font-size: 1rem;
        }
        &__inputs{
            display: flex;
            gap: 0.5rem;

        }

    }
</style>