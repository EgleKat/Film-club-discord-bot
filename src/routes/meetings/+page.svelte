<script lang="ts">
    import { getTitleWithOriginalTitle } from "$lib";
    import FilmTitle from "$lib/components/FilmTitle.svelte";
    import Button from "$lib/components/Button.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import UserAvatar from "$lib/components/UserAvatar.svelte";
    import type { PageData } from "./$types"

    export let data: PageData

    let showHidden = false;
    let viewMode: 'cards' | 'table' = 'cards';

    // Delete confirmation state
    let deleteConfirmFilmId: string | null = null;
    let deleteConfirmFilmTitle: string | null = null;

    function showDeleteConfirm(filmId: string, filmTitle: string) {
        deleteConfirmFilmId = filmId;
        deleteConfirmFilmTitle = filmTitle;
    }

    function cancelDelete() {
        deleteConfirmFilmId = null;
        deleteConfirmFilmTitle = null;
    }

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

    function formatScoresForTable(scores: { clubber: string, score: string }[]): string {
        return scores.map(s => `${s.clubber}: ${s.score}`).join(', ');
    }

    function getRecommendUsers(meetingId: number): { clubber: string, imageUrl: string | null }[] {
        const comments = data.commentsByMeeting[meetingId] || [];
        return comments
            .filter(c => c.recommendFriend)
            .map(c => ({ clubber: c.clubber, imageUrl: data.userProfileMap[c.clubber] || null }));
    }

    function getWatchAgainUsers(meetingId: number): { clubber: string, imageUrl: string | null }[] {
        const comments = data.commentsByMeeting[meetingId] || [];
        return comments
            .filter(c => c.watchAgain)
            .map(c => ({ clubber: c.clubber, imageUrl: data.userProfileMap[c.clubber] || null }));
    }
</script>

<div class="meetings-header">
    <h1>Meetings</h1>
    <div class="header-controls">
        <div class="view-tabs">
            <button
                class="tab-button"
                class:active={viewMode === 'cards'}
                on:click={() => viewMode = 'cards'}
            >
                Cards
            </button>
            <button
                class="tab-button"
                class:active={viewMode === 'table'}
                on:click={() => viewMode = 'table'}
            >
                Table
            </button>
        </div>
        <label class="show-hidden-toggle">
            <input type="checkbox" bind:checked={showHidden} />
            Show hidden
        </label>
    </div>
</div>

{#if viewMode === 'cards'}
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

                        {#if getRecommendUsers(meeting.id).length > 0 || getWatchAgainUsers(meeting.id).length > 0}
                            <div class="comments-section">
                                {#if getRecommendUsers(meeting.id).length > 0}
                                    <div class="comment-row">
                                        <span class="comment-label">👍 Would recommend</span>
                                        <div class="comment-users">
                                            {#each getRecommendUsers(meeting.id) as user}
                                                <div class="comment-user" title={user.clubber}>
                                                    <UserAvatar imageUrl={user.imageUrl} username={user.clubber} size="1.25rem" />
                                                    <span class="comment-username">{user.clubber}</span>
                                                </div>
                                            {/each}
                                        </div>
                                    </div>
                                {/if}
                                {#if getWatchAgainUsers(meeting.id).length > 0}
                                    <div class="comment-row">
                                        <span class="comment-label">🔄 Would watch again</span>
                                        <div class="comment-users">
                                            {#each getWatchAgainUsers(meeting.id) as user}
                                                <div class="comment-user" title={user.clubber}>
                                                    <UserAvatar imageUrl={user.imageUrl} username={user.clubber} size="1.25rem" />
                                                    <span class="comment-username">{user.clubber}</span>
                                                </div>
                                            {/each}
                                        </div>
                                    </div>
                                {/if}
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
                            <Button
                                type="button"
                                variant="tertiary"
                                size="small"
                                on:click={() => showDeleteConfirm(meeting.film.imdbId, meeting.film.title || meeting.film.originalTitle)}
                            >
                                <Icon type="trash" width="1rem" height="1rem" />
                                Delete
                            </Button>
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
{:else}
    <div class="table-container">
        <table class="meetings-table">
            <thead>
                <tr>
                    <th>Film</th>
                    <th>Date</th>
                    <th>Host</th>
                    <th>Avg</th>
                    <th>Scores</th>
                    <th>👍 Recommend</th>
                    <th>🔄 Watch again</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {#each data.meetings as meeting}
                    {#if showHidden || !meeting.hidden}
                        <tr class:hidden-row={meeting.hidden}>
                            <td class="film-cell">
                                <FilmTitle film={meeting.film} />
                            </td>
                            <td class="date-cell">{formatDate(meeting.date)}</td>
                            <td class="host-cell">{meeting.host}</td>
                            <td class="avg-cell">{calculateAverageScore(meeting.scores) || '-'}</td>
                            <td class="scores-cell">{formatScoresForTable(meeting.scores) || '-'}</td>
                            <td class="comments-cell">
                                {#if getRecommendUsers(meeting.id).length > 0}
                                    <div class="table-comment-users">
                                        {#each getRecommendUsers(meeting.id) as user}
                                            <div class="table-comment-user" title={user.clubber}>
                                                <UserAvatar imageUrl={user.imageUrl} username={user.clubber} size="1.1rem" />
                                                <span>{user.clubber}</span>
                                            </div>
                                        {/each}
                                    </div>
                                {:else}
                                    -
                                {/if}
                            </td>
                            <td class="comments-cell">
                                {#if getWatchAgainUsers(meeting.id).length > 0}
                                    <div class="table-comment-users">
                                        {#each getWatchAgainUsers(meeting.id) as user}
                                            <div class="table-comment-user" title={user.clubber}>
                                                <UserAvatar imageUrl={user.imageUrl} username={user.clubber} size="1.1rem" />
                                                <span>{user.clubber}</span>
                                            </div>
                                        {/each}
                                    </div>
                                {:else}
                                    -
                                {/if}
                            </td>
                            <td class="actions-cell">
                                <form method="post" action="?/toggleHidden">
                                    <input type="hidden" name="id" value={meeting.id} />
                                    <Button type="submit" variant="tertiary" size="small">
                                        {#if meeting.hidden}
                                            Unhide
                                        {:else}
                                            Hide
                                        {/if}
                                    </Button>
                                </form>
                                <Button
                                    type="button"
                                    variant="tertiary"
                                    size="small"
                                    on:click={() => showDeleteConfirm(meeting.film.imdbId, meeting.film.title || meeting.film.originalTitle)}
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    {/if}
                {:else}
                    <tr>
                        <td colspan="8" class="no-meetings-cell">No meetings yet!</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
{/if}

<!-- Delete Confirmation Dialog -->
{#if deleteConfirmFilmId}
    <div class="modal-overlay" on:click={cancelDelete} on:keydown={(e) => e.key === 'Escape' && cancelDelete()} role="button" tabindex="0">
        <div class="modal-content" on:click|stopPropagation role="dialog" aria-modal="true">
            <h2 class="modal-title">Delete Film</h2>
            <p class="modal-text">
                Are you sure you want to delete <strong>{deleteConfirmFilmTitle}</strong>?
            </p>
            <p class="modal-warning">
                This will remove the film from all meetings. This action cannot be undone.
            </p>
            <div class="modal-actions">
                <Button variant="tertiary" on:click={cancelDelete}>
                    Cancel
                </Button>
                <form method="post" action="?/deleteFilm" on:submit={cancelDelete}>
                    <input type="hidden" name="filmId" value={deleteConfirmFilmId} />
                    <Button type="submit" variant="primary">
                        <Icon type="trash" width="1rem" height="1rem" />
                        Delete Film
                    </Button>
                </form>
            </div>
        </div>
    </div>
{/if}

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

    .header-controls {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        flex-wrap: wrap;
    }

    .view-tabs {
        display: flex;
        background: #e8e8e8;
        border-radius: 6px;
        padding: 3px;
    }

    .tab-button {
        padding: 0.4rem 1rem;
        border: none;
        background: transparent;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.85rem;
        color: #666;
        transition: all 0.2s ease;

        &:hover {
            color: #333;
        }

        &.active {
            background: white;
            color: $main-blue;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

    // Card view styles
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

    // Table view styles
    .table-container {
        overflow-x: auto;
    }

    .meetings-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

        th, td {
            padding: 0.75rem 1rem;
            text-align: left;
        }

        thead {
            background: #f8f8f8;
            border-bottom: 1px solid #e8e8e8;

            th {
                font-weight: 600;
                font-size: 0.8rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #666;
            }
        }

        tbody tr {
            border-bottom: 1px solid #f0f0f0;

            &:last-child {
                border-bottom: none;
            }

            &:hover {
                background: #fafafa;
            }

            &.hidden-row {
                opacity: 0.5;
                background: #f8f8f8;
            }
        }
    }

    .film-cell {
        :global(a) {
            color: $main-blue;
            text-decoration: none;

            &:hover {
                text-decoration: underline;
            }
        }
    }

    .date-cell {
        white-space: nowrap;
    }

    .host-cell {
        text-transform: capitalize;
    }

    .avg-cell {
        font-weight: 600;
        color: $main-orange;
    }

    .scores-cell {
        font-size: 0.9rem;
        color: #555;
        max-width: 300px;
    }

    .actions-cell {
        form {
            display: inline-block;
        }
    }

    .no-meetings-cell {
        text-align: center;
        padding: 2rem;
        color: #666;
    }

    // Comments section styles for card view
    .comments-section {
        margin-top: 0.75rem;
        padding-top: 0.75rem;
        border-top: 1px solid #eee;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .comment-row {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
    }

    .comment-label {
        font-size: 0.75rem;
        color: #666;
        font-weight: 500;
    }

    .comment-users {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .comment-user {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        background: #f4f4f4;
        padding: 0.25rem 0.5rem;
        border-radius: 16px;
        font-size: 0.8rem;
    }

    .comment-username {
        color: #555;
        text-transform: capitalize;
    }

    // Comments cell styles for table view
    .comments-cell {
        font-size: 0.85rem;
        color: #555;
    }

    .table-comment-users {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .table-comment-user {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.8rem;
        text-transform: capitalize;
    }

    // Delete confirmation modal styles
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
    }

    .modal-content {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        max-width: 400px;
        width: 100%;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .modal-title {
        margin: 0 0 1rem;
        font-size: 1.25rem;
        color: #333;
    }

    .modal-text {
        margin: 0 0 0.5rem;
        color: #555;
        line-height: 1.5;

        strong {
            color: #333;
        }
    }

    .modal-warning {
        margin: 0 0 1.5rem;
        color: #c53030;
        font-size: 0.9rem;
        line-height: 1.5;
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;

        form {
            display: inline-block;
        }
    }
</style>
