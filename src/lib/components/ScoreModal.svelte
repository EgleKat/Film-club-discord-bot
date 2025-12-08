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
    <button
        type="button"
        class="action-button"
        on:click={sendScores}
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
        </svg>
        <span>Send to Discord</span>
    </button>
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

    .action-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        margin-top: 0.75rem;
        border: none;
        border-radius: 8px;
        background: linear-gradient(135deg, $main-blue 0%, darken($main-blue, 10%) 100%);
        color: white;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.25s ease;
        position: relative;
        overflow: hidden;

        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(white, 0.2),
                transparent
            );
            transition: left 0.4s ease;
        }

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba($main-blue, 0.4);

            &::before {
                left: 100%;
            }
        }

        &:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba($main-blue, 0.3);
        }

        &:active {
            transform: translateY(0);
        }

        svg {
            flex-shrink: 0;
        }
    }
</style>