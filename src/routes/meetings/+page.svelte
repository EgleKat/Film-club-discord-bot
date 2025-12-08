<script lang="ts">
    import { getTitleWithOriginalTitle } from "$lib";
    import FilmTitle from "$lib/components/FilmTitle.svelte";
    import Button from "$lib/components/Button.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import type { PageData } from "./$types"

    export let data: PageData

    let showHidden = false;

    function formatDate(date: Date): string {
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    function calculateAverageScore(scores: { score: string }[]): string | null {
        if (scores.length === 0) return null;
        const numericScores = scores
            .map(s => parseFloat(s.score))
            .filter(s => !isNaN(s));
        if (numericScores.length === 0) return null;
        const avg = numericScores.reduce((a, b) => a + b, 0) / numericScores.length;
        return avg.toFixed(1);
    }
</script>

<div class="meetings-header">
    <h1>Meetings</h1>
    <label class="show-hidden-toggle">
        <input type="checkbox" bind:checked={showHidden} />
        Show hidden
    </label>
</div>

<div class="meetings-grid">
    {#each data.meetings as meeting}
        {#if showHidden || !meeting.hidden}
            <article class="meeting-card" class:hidden={meeting.hidden}>
                <div class="poster-container">
                    {#if meeting.film.poster && meeting.film.poster !== 'N/A'}
                        <img
                            src={meeting.film.poster}
                            alt="{meeting.film.title || meeting.film.originalTitle} poster"
                            class="poster"
                            loading="lazy"
                        />
                    {:else}
                        <div class="poster-placeholder">
                            <span class="poster-placeholder-icon">🎬</span>
                        </div>
                    {/if}
                    {#if meeting.hidden}
                        <div class="hidden-badge">Hidden</div>
                    {/if}
                </div>

                <div class="meeting-details">
                    <h2 class="film-title">
                        <FilmTitle film={meeting.film} />
                    </h2>

                    <div class="meeting-meta">
                        <div class="meta-item">
                            <span class="meta-label">Date</span>
                            <span class="meta-value">{formatDate(meeting.date)}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Host</span>
                            <span class="meta-value host-name">{meeting.host}</span>
                        </div>
                        {#if calculateAverageScore(meeting.scores)}
                            <div class="meta-item">
                                <span class="meta-label">Average</span>
                                <span class="meta-value average-score">{calculateAverageScore(meeting.scores)}</span>
                            </div>
                        {/if}
                    </div>

                    {#if meeting.scores.length > 0}
                        <div class="scores-section">
                            <span class="scores-label">Scores</span>
                            <div class="scores-grid">
                                {#each meeting.scores as score}
                                    <div class="score-chip">
                                        <span class="scorer-name">{score.clubber}</span>
                                        <span class="score-value">{score.score}</span>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <div class="card-actions">
                        <form method="post" action="?/toggleHidden">
                            <input type="hidden" name="id" value={meeting.id} />
                            <Button type="submit" variant="tertiary" size="small">
                                {#if meeting.hidden}
                                    <Icon type="eye" width="1rem" height="1rem" />
                                    Unhide
                                {:else}
                                    <Icon type="eye-slash" width="1rem" height="1rem" />
                                    Hide
                                {/if}
                            </Button>
                        </form>
                    </div>
                </div>
            </article>
        {/if}
    {:else}
        <div class="no-meetings">
            <p>No meetings yet!</p>
        </div>
    {/each}
</div>

<style lang="scss">
    .meetings-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        gap: 1rem;

        h1 {
            margin: 0;
            font-size: 2rem;
        }
    }

    .show-hidden-toggle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        font-size: 0.9rem;
        color: #666;

        input {
            cursor: pointer;
        }
    }

    .meetings-grid {
        display: grid;
        gap: 1.5rem;
    }

    .meeting-card {
        display: grid;
        grid-template-columns: 140px 1fr;
        gap: 1.5rem;
        background: white;
        border-radius: 12px;
        padding: 1.25rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: box-shadow 0.2s ease, transform 0.2s ease;

        &:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
            transform: translateY(-2px);
        }

        &.hidden {
            opacity: 0.6;
            background: #f8f8f8;
        }

        @media (max-width: 600px) {
            grid-template-columns: 100px 1fr;
            gap: 1rem;
            padding: 1rem;
        }

        @media (max-width: 400px) {
            grid-template-columns: 1fr;

            .poster-container {
                justify-self: center;
            }
        }
    }

    .poster-container {
        position: relative;
        aspect-ratio: 2/3;
        border-radius: 8px;
        overflow: hidden;
        background: #e8e8e8;
    }

    .poster {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .poster-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .poster-placeholder-icon {
        font-size: 2.5rem;
        opacity: 0.8;
    }

    .hidden-badge {
        position: absolute;
        top: 0.5rem;
        left: 0.5rem;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        font-size: 0.7rem;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .meeting-details {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .film-title {
        font-size: 1.25rem;
        margin: 0;
        line-height: 1.3;

        :global(a) {
            color: $main-blue;
            text-decoration: none;

            &:hover {
                text-decoration: underline;
            }
        }
    }

    .meeting-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .meta-item {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
    }

    .meta-label {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #888;
    }

    .meta-value {
        font-size: 0.95rem;
        color: #333;
    }

    .host-name {
        text-transform: capitalize;
        font-weight: 500;
    }

    .average-score {
        font-weight: 600;
        color: $main-orange;
    }

    .scores-section {
        margin-top: 0.5rem;
    }

    .scores-label {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #888;
        display: block;
        margin-bottom: 0.5rem;
    }

    .scores-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .score-chip {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: #f4f4f4;
        padding: 0.35rem 0.65rem;
        border-radius: 20px;
        font-size: 0.85rem;
    }

    .scorer-name {
        color: #555;
        text-transform: capitalize;
    }

    .score-value {
        font-weight: 600;
        color: $main-blue;
    }

    .card-actions {
        margin-top: auto;
        padding-top: 0.5rem;

        form {
            display: inline-block;
        }
    }

    .no-meetings {
        text-align: center;
        padding: 3rem;
        color: #666;
        grid-column: 1 / -1;
    }
</style>
