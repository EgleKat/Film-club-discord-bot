<script lang="ts">
    import type { Score } from "$lib/types"
    import Button from "./Button.svelte";
    import Input from "./Input.svelte";
    import UserAvatar from "./UserAvatar.svelte";
    import Icon from "./Icon.svelte";

    export let title: string
    export let scores: Score[]
    export let numberOfSubmittedScores: number
    export let userProfiles: Record<string, string | null> = {}
    export let showForm: boolean = true
    export let submittedUsers: string[] = []
    export let submittedUserProfiles: Record<string, string | null> = {}
    export let onAddScore: (() => void) | null = null

    const sendScores = () => {
        fetch("/api/v1/discord/scores", { method: 'POST' })
            .then(res => res.json())
            .then(res => {
                scores = res.scores
            })
    }
</script>

<section class="score-section">
    <div class="scores-display">
        <div class="scores-header">
            <h3 class="scores-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="1.2rem" height="1.2rem" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Scores
            </h3>
            <span class="scores-count">{numberOfSubmittedScores} submitted</span>
        </div>

        {#if scores.length > 0}
            <div class="scores-grid">
                {#each scores as score}
                    <div class="score-card">
                        <div class="score-card__avatar">
                            <UserAvatar
                                imageUrl={userProfiles[score.clubber] ?? null}
                                username={score.clubber}
                                size="2.5rem"
                            />
                        </div>
                        <div class="score-card__info">
                            <span class="score-card__username">{score.clubber}</span>
                            <span class="score-card__score">{score.score}</span>
                        </div>
                    </div>
                {/each}
            </div>
        {:else if submittedUsers.length > 0}
            <p class="no-scores-text">Scores not revealed yet</p>
            <div class="submitted-users">
                <p class="submitted-label">Submitted:</p>
                <div class="submitted-users-grid">
                    {#each submittedUsers as user}
                        <div class="submitted-user">
                            <UserAvatar
                                imageUrl={submittedUserProfiles[user] ?? null}
                                username={user}
                                size="2rem"
                            />
                            <span class="submitted-user__name">{user}</span>
                        </div>
                    {/each}
                </div>
            </div>
        {:else}
            <p class="no-scores">No scores submitted yet</p>
        {/if}

        <div class="action-buttons">
            {#if onAddScore}
                <button
                    type="button"
                    class="action-button"
                    on:click={onAddScore}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 11l3 3L22 4"/>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                    <span>Add your score</span>
                </button>
            {/if}
            <button
                type="button"
                class="action-button"
                on:click={sendScores}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span>Send to Discord</span>
            </button>
        </div>
    </div>

    {#if showForm}
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
    {/if}
</section>

<style lang="scss">
    .score-section {
    }

    .score-form {
        padding: 1rem;
        border-radius: 8px;
        background-color: rgba(0, 0, 0, 0.05);
        font-weight: normal;

        &__film {
            font-size: 1.1rem;
            padding-bottom: 0.5rem;
            margin-bottom: 0.75rem;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            &-name {
                letter-spacing: 0.4px;
                font-weight: 700;
            }
        }

        label {
            font-size: 0.95rem;
            display: block;
            margin-bottom: 0.5rem;
        }

        &__inputs {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
    }

    .scores-display {
        background-color: $main-teal;
        border-radius: 12px;
        padding: 1.25rem;
        color: #2d3b2d;
        margin-bottom: 1.5rem;
    }

    .scores-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.15);
    }

    .scores-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: #1a2e1a;
    }

    .scores-count {
        font-size: 0.85rem;
        opacity: 0.8;
        background-color: rgba(0, 0, 0, 0.1);
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
    }

    .scores-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 0.75rem;
        margin-bottom: 1rem;
    }

    .score-card {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        background-color: rgba(0, 0, 0, 0.08);
        border-radius: 10px;
        transition: all 0.2s ease;

        &:hover {
            background-color: rgba(0, 0, 0, 0.12);
            transform: translateY(-2px);
        }

        &__avatar {
            flex-shrink: 0;
        }

        &__info {
            display: flex;
            flex-direction: column;
            min-width: 0;
        }

        &__username {
            font-size: 0.85rem;
            font-weight: 500;
            text-transform: capitalize;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: rgba(0, 0, 0, 0.8);
        }

        &__score {
            font-size: 1.1rem;
            font-weight: 700;
            color: #1a2e1a;
        }
    }

    .no-scores {
        text-align: center;
        padding: 1.5rem;
        opacity: 0.7;
        font-style: italic;
        margin: 0;
    }

    .no-scores-text {
        text-align: center;
        opacity: 0.7;
        font-style: italic;
        margin: 0 0 0.75rem 0;
    }

    .submitted-users {
        margin-bottom: 1rem;
    }

    .submitted-label {
        font-size: 0.85rem;
        opacity: 0.8;
        margin: 0 0 0.5rem 0;
    }

    .submitted-users-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
    }

    .submitted-user {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background-color: rgba(0, 0, 0, 0.08);
        border-radius: 8px;

        &__name {
            font-size: 0.85rem;
            text-transform: capitalize;
            color: rgba(0, 0, 0, 0.8);
        }
    }

    .action-buttons {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-top: 0.5rem;
    }

    .action-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 8px;
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.08) 100%);
        color: #1a2e1a;
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
                rgba(0, 0, 0, 0.1),
                transparent
            );
            transition: left 0.4s ease;
        }

        &:hover {
            transform: translateY(-2px);
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%);

            &::before {
                left: 100%;
            }
        }

        &:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.2);
        }

        &:active {
            transform: translateY(0);
        }

        svg {
            flex-shrink: 0;
        }
    }
</style>
