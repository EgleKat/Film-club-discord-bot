<script lang="ts">
    import { quintOut } from "svelte/easing";
    import type { PageData } from './$types';
    import { slide } from "svelte/transition";
    import Button from "$lib/components/Button.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import FilmSelector from "$lib/components/FilmSelector.svelte";
    import Input from "$lib/components/Input.svelte";
    import FilmTitle from "$lib/components/FilmTitle.svelte";

    export let data: PageData
    $: watchedWatchlist = data.watchlist.filter(watchlistEntry => watchlistEntry.dateWatched != null);
    $: unwatchedWatchlist = data.watchlist.filter(watchlistEntry => watchlistEntry.dateWatched == null);

    let isSidePanelOpen = false;
    let closeSidePanel = () => (isSidePanelOpen = false);
    let watched = false;
    const initDateInput = (node: HTMLInputElement) => {
        node.valueAsDate = new Date();
    };
    let showHidden = false;
    let showWatchedInMeetings = true;
    let viewMode: 'cards' | 'table' = 'cards';

    function formatDate(date: Date): string {
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    function getOtherScores(scores: { clubber: string, score: string | null }[], currentUser: string): { clubber: string, score: string }[] {
        return scores.filter((s): s is { clubber: string, score: string } => s.clubber !== currentUser && s.score != null);
    }

    function getMyScore(scores: { clubber: string, score: string | null }[], currentUser: string): string | null {
        const myScore = scores.find(s => s.clubber === currentUser);
        return myScore?.score || null;
    }

    function openDialog(id: number | null) {
        const dialog = document.getElementById(`score-popover-${id}`) as HTMLDialogElement;
        dialog?.showModal();
    }

    function closeDialog(id: number | null) {
        const dialog = document.getElementById(`score-popover-${id}`) as HTMLDialogElement;
        dialog?.close();
    }
</script>

{#if isSidePanelOpen}
    <div class="side-panel-overlay" on:click={closeSidePanel} on:keydown={(e) => e.key === 'Escape' && closeSidePanel()} role="button" tabindex="0"></div>
    <div
        class="side-panel"
        transition:slide={{
            delay: 250,
            duration: 300,
            easing: quintOut,
            axis: "x",
        }}
    >
        <div class="side-panel-header">
            <h2>Add Film</h2>
            <button class="close-button" on:click={closeSidePanel}>
                <Icon type="x" width="1.5rem" height="1.5rem" />
            </button>
        </div>
        <form method="POST" action="?/addFilm" class="add-film-form">
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" value="{watched}" on:click={() => watched = !watched} />
                    Already watched?
                </label>
            </div>
            {#if watched}
                <div class="form-group">
                    <label for="dateWatched">Date watched</label>
                    <input type="date" name="dateWatched" id="dateWatched" required use:initDateInput class="date-input" />
                </div>
                <div class="form-group">
                    <label for="score">Your score</label>
                    <Input type="text" name="score" placeholder="Enter your score" id="score" required/>
                </div>
            {/if}
            <div class="form-group">
                <label>Search film</label>
                <FilmSelector />
            </div>
            <Button type="submit" variant="primary" size="medium" on:submit={closeSidePanel}>
                Add to Watchlist
            </Button>
        </form>
    </div>
{/if}

<div class="watchlist-header">
    <h1>My Watchlist</h1>
    <div class="header-controls">
        <Button variant="primary" size="small" on:click={() => (isSidePanelOpen = !isSidePanelOpen)}>
            <Icon type="plus" width="1rem" height="1rem" />
            Add Film
        </Button>
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

<section class="watchlist-section">
    <h2 class="section-title">Unwatched</h2>

    {#if viewMode === 'cards'}
        <div class="watchlist-grid">
            {#each unwatchedWatchlist as watchlistEntry}
                {#if showHidden || !watchlistEntry.hidden}
                    <article class="watchlist-card" class:hidden={watchlistEntry.hidden}>
                        <div class="poster-container">
                            {#if watchlistEntry.film.poster && watchlistEntry.film.poster !== 'N/A'}
                                <img
                                    src={watchlistEntry.film.poster}
                                    alt="{watchlistEntry.film.title || watchlistEntry.film.originalTitle} poster"
                                    class="poster"
                                    loading="lazy"
                                />
                            {:else}
                                <div class="poster-placeholder">
                                    <span class="poster-placeholder-icon">🎬</span>
                                </div>
                            {/if}
                            {#if watchlistEntry.hidden}
                                <div class="hidden-badge">Hidden</div>
                            {/if}
                        </div>

                        <div class="card-details">
                            <h3 class="film-title">
                                <FilmTitle film={watchlistEntry.film} />
                            </h3>

                            {#if getOtherScores(watchlistEntry.scores, data.currentUserUsername).length > 0}
                                <div class="scores-section">
                                    <span class="scores-label">Others' Scores</span>
                                    <div class="scores-grid">
                                        {#each getOtherScores(watchlistEntry.scores, data.currentUserUsername) as score}
                                            <div class="score-chip">
                                                <span class="scorer-name">{score.clubber}</span>
                                                <span class="score-value">{score.score}</span>
                                            </div>
                                        {/each}
                                    </div>
                                </div>
                            {/if}

                            <div class="card-actions">
                                <Button variant="primary" size="small" on:click={() => openDialog(watchlistEntry.id)}>
                                    <Icon type="star" width="1rem" height="1rem" />
                                    Mark Watched
                                </Button>
                                <form method="post" action="?/toggleHidden">
                                    <input type="hidden" name="id" value={watchlistEntry.id} />
                                    <Button type="submit" variant="tertiary" size="small">
                                        {#if watchlistEntry.hidden}
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

                    <dialog id="score-popover-{watchlistEntry.id}" class="score-dialog">
                        <div class="dialog-content">
                            <h3>Mark as Watched</h3>
                            <form method="post" action="?/submitScore">
                                <input type="hidden" name="id" value={watchlistEntry.id} />
                                <div class="form-group">
                                    <label for="score-{watchlistEntry.id}">Your score</label>
                                    <Input type="text" name="score" placeholder="Enter your score" id="score-{watchlistEntry.id}"/>
                                </div>
                                <div class="form-group">
                                    <label for="date-{watchlistEntry.id}">Date watched</label>
                                    <input type="date" name="dateWatched" required id="date-{watchlistEntry.id}" use:initDateInput class="date-input" />
                                </div>
                                <div class="dialog-actions">
                                    <Button type="button" variant="tertiary" size="small" on:click={() => closeDialog(watchlistEntry.id)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="primary" size="small">
                                        Submit
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </dialog>
                {/if}
            {:else}
                <div class="empty-state">
                    <p>🎉 Congratulations, you've watched everything! Why not add another?</p>
                </div>
            {/each}
        </div>
    {:else}
        <div class="table-container">
            <table class="watchlist-table">
                <thead>
                    <tr>
                        <th>Film</th>
                        <th>Others' Scores</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {#each unwatchedWatchlist as watchlistEntry}
                        {#if showHidden || !watchlistEntry.hidden}
                            <tr class:hidden-row={watchlistEntry.hidden}>
                                <td class="film-cell">
                                    <FilmTitle film={watchlistEntry.film} />
                                </td>
                                <td class="scores-cell">
                                    {#if getOtherScores(watchlistEntry.scores, data.currentUserUsername).length > 0}
                                        {getOtherScores(watchlistEntry.scores, data.currentUserUsername).map(s => `${s.clubber}: ${s.score}`).join(', ')}
                                    {:else}
                                        -
                                    {/if}
                                </td>
                                <td class="actions-cell">
                                    <Button variant="primary" size="small" on:click={() => openDialog(watchlistEntry.id)}>
                                        Mark Watched
                                    </Button>
                                    <form method="post" action="?/toggleHidden">
                                        <input type="hidden" name="id" value={watchlistEntry.id} />
                                        <Button type="submit" variant="tertiary" size="small">
                                            {#if watchlistEntry.hidden}
                                                Unhide
                                            {:else}
                                                Hide
                                            {/if}
                                        </Button>
                                    </form>
                                </td>
                            </tr>
                        {/if}
                    {:else}
                        <tr>
                            <td colspan="3" class="empty-cell">Congratulations, you've watched everything!</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</section>

<section class="watchlist-section">
    <div class="section-header">
        <h2 class="section-title">Watched</h2>
        <label class="show-meetings-toggle">
            <input type="checkbox" bind:checked={showWatchedInMeetings} />
            Include meetings
        </label>
    </div>

    {#if viewMode === 'cards'}
        <div class="watchlist-grid">
            {#each watchedWatchlist as watchlistEntry}
                {#if (showHidden || !watchlistEntry.hidden) && (showWatchedInMeetings || !watchlistEntry.isMeeting)}
                    <article class="watchlist-card" class:hidden={watchlistEntry.hidden}>
                        <div class="poster-container">
                            {#if watchlistEntry.film.poster && watchlistEntry.film.poster !== 'N/A'}
                                <img
                                    src={watchlistEntry.film.poster}
                                    alt="{watchlistEntry.film.title || watchlistEntry.film.originalTitle} poster"
                                    class="poster"
                                    loading="lazy"
                                />
                            {:else}
                                <div class="poster-placeholder">
                                    <span class="poster-placeholder-icon">🎬</span>
                                </div>
                            {/if}
                            {#if watchlistEntry.hidden}
                                <div class="hidden-badge">Hidden</div>
                            {/if}
                            {#if watchlistEntry.isMeeting}
                                <div class="meeting-badge">Meeting</div>
                            {/if}
                        </div>

                        <div class="card-details">
                            <h3 class="film-title">
                                <FilmTitle film={watchlistEntry.film} />
                            </h3>

                            <div class="card-meta">
                                <div class="meta-item">
                                    <span class="meta-label">Watched</span>
                                    <span class="meta-value">{watchlistEntry.dateWatched ? formatDate(watchlistEntry.dateWatched) : '-'}</span>
                                </div>
                                {#if getMyScore(watchlistEntry.scores, data.currentUserUsername)}
                                    <div class="meta-item">
                                        <span class="meta-label">My Score</span>
                                        <span class="meta-value my-score">{getMyScore(watchlistEntry.scores, data.currentUserUsername)}</span>
                                    </div>
                                {/if}
                            </div>

                            {#if getOtherScores(watchlistEntry.scores, data.currentUserUsername).length > 0}
                                <div class="scores-section">
                                    <span class="scores-label">Others' Scores</span>
                                    <div class="scores-grid">
                                        {#each getOtherScores(watchlistEntry.scores, data.currentUserUsername) as score}
                                            <div class="score-chip">
                                                <span class="scorer-name">{score.clubber}</span>
                                                <span class="score-value">{score.score}</span>
                                            </div>
                                        {/each}
                                    </div>
                                </div>
                            {/if}

                            {#if !watchlistEntry.isMeeting}
                                <div class="card-actions">
                                    <form method="post" action="?/toggleHidden">
                                        <input type="hidden" name="id" value={watchlistEntry.id} />
                                        <Button type="submit" variant="tertiary" size="small">
                                            {#if watchlistEntry.hidden}
                                                <Icon type="eye" width="1rem" height="1rem" />
                                                Unhide
                                            {:else}
                                                <Icon type="eye-slash" width="1rem" height="1rem" />
                                                Hide
                                            {/if}
                                        </Button>
                                    </form>
                                </div>
                            {/if}
                        </div>
                    </article>
                {/if}
            {:else}
                <div class="empty-state">
                    <p>No films watched yet. Add some to your watchlist!</p>
                </div>
            {/each}
        </div>
    {:else}
        <div class="table-container">
            <table class="watchlist-table">
                <thead>
                    <tr>
                        <th>Film</th>
                        <th>Date</th>
                        <th>My Score</th>
                        <th>Others' Scores</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {#each watchedWatchlist as watchlistEntry}
                        {#if (showHidden || !watchlistEntry.hidden) && (showWatchedInMeetings || !watchlistEntry.isMeeting)}
                            <tr class:hidden-row={watchlistEntry.hidden}>
                                <td class="film-cell">
                                    <FilmTitle film={watchlistEntry.film} />
                                    {#if watchlistEntry.isMeeting}
                                        <span class="table-meeting-badge">Meeting</span>
                                    {/if}
                                </td>
                                <td class="date-cell">{watchlistEntry.dateWatched ? formatDate(watchlistEntry.dateWatched) : '-'}</td>
                                <td class="my-score-cell">{getMyScore(watchlistEntry.scores, data.currentUserUsername) || '-'}</td>
                                <td class="scores-cell">
                                    {#if getOtherScores(watchlistEntry.scores, data.currentUserUsername).length > 0}
                                        {getOtherScores(watchlistEntry.scores, data.currentUserUsername).map(s => `${s.clubber}: ${s.score}`).join(', ')}
                                    {:else}
                                        -
                                    {/if}
                                </td>
                                <td class="actions-cell">
                                    {#if !watchlistEntry.isMeeting}
                                        <form method="post" action="?/toggleHidden">
                                            <input type="hidden" name="id" value={watchlistEntry.id} />
                                            <Button type="submit" variant="tertiary" size="small">
                                                {#if watchlistEntry.hidden}
                                                    Unhide
                                                {:else}
                                                    Hide
                                                {/if}
                                            </Button>
                                        </form>
                                    {/if}
                                </td>
                            </tr>
                        {/if}
                    {:else}
                        <tr>
                            <td colspan="5" class="empty-cell">No films watched yet</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</section>

<style lang="scss">
    // Header styles
    .watchlist-header {
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
        gap: 1rem;
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

    .show-hidden-toggle, .show-meetings-toggle {
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

    // Section styles
    .watchlist-section {
        margin-bottom: 3rem;
    }

    .section-header {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
    }

    .section-title {
        font-size: 1.5rem;
        margin: 0 0 1rem 0;
        color: $main-blue;
    }

    .section-header .section-title {
        margin-bottom: 0;
    }

    // Card view styles
    .watchlist-grid {
        display: grid;
        gap: 1.5rem;
    }

    .watchlist-card {
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
                width: 140px;
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

    .hidden-badge, .meeting-badge {
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

    .meeting-badge {
        top: auto;
        bottom: 0.5rem;
        background: $main-blue;
    }

    .card-details {
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

    .card-meta {
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

    .my-score {
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
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;

        form {
            display: inline-block;
        }
    }

    .empty-state {
        text-align: center;
        padding: 3rem;
        color: #666;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    // Table view styles
    .table-container {
        overflow-x: auto;
    }

    .watchlist-table {
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

    .table-meeting-badge {
        display: inline-block;
        margin-left: 0.5rem;
        background: $main-blue;
        color: white;
        font-size: 0.65rem;
        padding: 0.15rem 0.4rem;
        border-radius: 4px;
        text-transform: uppercase;
        vertical-align: middle;
    }

    .date-cell {
        white-space: nowrap;
    }

    .my-score-cell {
        font-weight: 600;
        color: $main-orange;
    }

    .scores-cell {
        font-size: 0.9rem;
        color: #555;
        max-width: 300px;
    }

    .actions-cell {
        white-space: nowrap;

        form {
            display: inline-block;
        }
    }

    .empty-cell {
        text-align: center;
        padding: 2rem;
        color: #666;
    }

    // Side panel styles
    .side-panel-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        z-index: 10;
    }

    .side-panel {
        background: white;
        right: 0;
        position: fixed;
        top: 0;
        height: 100vh;
        width: 100%;
        max-width: 400px;
        padding: 2rem;
        z-index: 11;
        box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
        overflow-y: auto;
    }

    .side-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;

        h2 {
            margin: 0;
            font-size: 1.5rem;
            color: $main-blue;
        }
    }

    .close-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 4px;
        color: #666;
        transition: background 0.2s ease;

        &:hover {
            background: #f0f0f0;
        }
    }

    .add-film-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        label {
            font-size: 0.9rem;
            font-weight: 500;
            color: #333;
        }
    }

    .checkbox-label {
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
    }

    .date-input {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
    }

    // Score dialog styles
    .score-dialog {
        border: none;
        border-radius: 12px;
        padding: 0;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        max-width: 400px;
        width: 90%;

        &::backdrop {
            background: rgba(0, 0, 0, 0.4);
        }
    }

    .dialog-content {
        padding: 1.5rem;

        h3 {
            margin: 0 0 1.5rem 0;
            font-size: 1.25rem;
            color: $main-blue;
        }

        form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
    }

    .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        margin-top: 1rem;
    }
</style>
