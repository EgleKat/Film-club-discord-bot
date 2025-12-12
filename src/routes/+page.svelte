<script lang="ts">
    import ScoreModal from "$lib/components/ScoreModal.svelte";
    import type { Meeting, Score } from "$lib/types";
    import Toast from "$lib/components/Toast.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import SpanWithIcon from "$lib/components/SpanWithIcon.svelte";
    import SetNext from "$lib/components/SetNext.svelte";
    import { slide } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    import Button from "$lib/components/Button.svelte";
    import { getTitleWithOriginalTitle } from "$lib";
    import type { PageData } from "./$types";
    import FilmTitle from "$lib/components/FilmTitle.svelte";
    import UserAvatar from "$lib/components/UserAvatar.svelte";
    import CalendarSubscribe from "$lib/components/CalendarSubscribe.svelte";
    import { enhance } from "$app/forms";

    export let data: PageData;
    export let form;
    const meeting = data.meeting;
    const film = meeting?.film;
    const theme = data.theme;
    const scores = data?.scores;
    const numberOfSubmittedScores = data?.numberOfSubmittedScores;
    const hostProfileImageUrl = data?.hostProfileImageUrl;
    const scoreUserProfiles = data?.scoreUserProfiles ?? {};
    const submittedUsers = data?.submittedUsers ?? [];
    const submittedUserProfiles = data?.submittedUserProfiles ?? {};
    const baseUrl = data.baseUrl;
    let isSidePanelOpen = false;
    let isScorePopupOpen = false;
    let isCalendarPopupOpen = false;

    let recommendFriend = data.userFilmComment?.recommendFriend ?? false;
    let watchAgain = data.userFilmComment?.watchAgain ?? false;

    // Lock body scroll when side panel is open
    $: if (typeof document !== 'undefined') {
        document.body.style.overflow = isSidePanelOpen ? 'hidden' : '';
    }

    function submitComment() {
        const form = document.getElementById('comment-form') as HTMLFormElement;
        if (form) {
            form.requestSubmit();
        }
    }
</script>

<section>
    {#if form?.error}
        <Toast status="error" title="Error" description={form.error} />
    {/if}
    {#if theme}
        <div class="current-theme">
            <span>Current theme: <strong>{theme.name}</strong></span>
            <SpanWithIcon>
                <Icon type="calendar-mark" />
                <span class="theme-end-date">Ends {theme.endDate.toLocaleDateString()}</span>
            </SpanWithIcon>
        </div>
    {/if}
    {#if film}
        <div class="this-week">
            <SpanWithIcon>
                <span> This week, chosen by </span>
                <UserAvatar imageUrl={hostProfileImageUrl} username={meeting?.host} size="1rem" />
                <span class="film-host">{meeting?.host}</span>
            </SpanWithIcon>
        </div>
        <div class="date-with-calendar">
            <SpanWithIcon>
                <span>To be discussed on </span>
                <Icon type="calendar-mark" />
                <span>{meeting?.date.toLocaleDateString()}</span></SpanWithIcon
            >
            <button
                class="calendar-add-button"
                on:click={() => isCalendarPopupOpen = true}
                title="Add to calendar"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                    <line x1="12" y1="14" x2="12" y2="18"></line>
                    <line x1="10" y1="16" x2="14" y2="16"></line>
                </svg>
            </button>
        </div>

        <div class="film-description">
            <div class="film-header">
                <div class="film-title-wrapper">
                    <div class="film-title"><FilmTitle film={meeting.film} /></div>
                </div>
                <button class="action-button" on:click={() => (isSidePanelOpen = !isSidePanelOpen)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                    <span>Choose next</span>
                </button>
            </div>
            {#if film.director}
                <p class="film-director">Director - {film.director}</p>
            {/if}
            {#if film.country}
                <p class="film-country">Origin - {film.country}</p>
            {/if}
            {#if film.budget && film.budget > 0}
                <p class="film-budget">Budget - {film.budget.toLocaleString()}</p>
            {/if}
            {#if film.runtime}
                <p class="film-runtime">Runtime - {Math.floor(film.runtime / 60)}h {film.runtime % 60}m</p>
            {/if}
            {#if film.revenue && film.revenue > 0}
                <p class="film-revenue">Revenue - {Number(film.revenue) >= 1_000_000_000
                    ? `$${(Number(film.revenue) / 1_000_000_000).toFixed(1)}B`
                    : Number(film.revenue) >= 1_000_000
                        ? `$${Math.round(Number(film.revenue) / 1_000_000)}M`
                        : `$${Number(film.revenue).toLocaleString()}`}</p>
            {/if}
            {#if film.genres}
                <div class="film-genres">
                    {#each JSON.parse(film.genres) as genre}
                        <span class="genre-tag">{genre}</span>
                    {/each}
                </div>
            {/if}
            <div class="film-poster-and-plot">
                <img
                    class="film-poster"
                    src={film.poster}
                    alt={`Poster for ${film.originalTitle}`}
                />
                <div class="plot-and-score-wrapper">
                    <p class="film-plot">{film.plot}</p>
                    <ScoreModal
                        title={getTitleWithOriginalTitle(film)}
                        {scores}
                        {numberOfSubmittedScores}
                        userProfiles={scoreUserProfiles}
                        {submittedUsers}
                        {submittedUserProfiles}
                        showForm={false}
                        onAddScore={() => isScorePopupOpen = true}
                    />
                </div>
            </div>
        </div>

        {#if isScorePopupOpen}
            <div class="popup-overlay" on:click={() => isScorePopupOpen = false} on:keydown={(e) => e.key === 'Escape' && (isScorePopupOpen = false)} role="button" tabindex="0">
                <div class="score-popup" on:click|stopPropagation on:keydown|stopPropagation role="dialog">
                    <button class="popup-close" on:click={() => isScorePopupOpen = false}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>

                    <div class="popup-content">
                        <form method="post" action="?/score" class="score-form">
                            <div class="score-form__film">Score for - <span class="score-form__film-name">
                                {getTitleWithOriginalTitle(film)}
                            </span>
                            </div>
                            <label for="popup-score">
                                Your score:
                            </label>
                            <div class="score-form__inputs">
                                <input type="text" name="score" placeholder="Enter your score" id="popup-score" class="score-input"/>
                                <Button variant="secondary" size="medium" type="submit">
                                    <Icon type="tick" class="medium-button" width="1.25rem" height="1.25rem"/>
                                    Submit Score
                                </Button>
                            </div>
                        </form>

                        <div class="film-comments">
                            <h3>Your thoughts on this film</h3>
                            <form id="comment-form" method="post" action="?/comment" use:enhance>
                                <input type="hidden" name="recommendFriend" value={recommendFriend} />
                                <input type="hidden" name="watchAgain" value={watchAgain} />

                                <div class="comment-options">
                                    <button
                                        type="button"
                                        class="comment-option"
                                        class:selected={recommendFriend}
                                        on:click={() => { recommendFriend = !recommendFriend; submitComment(); }}
                                    >
                                        <span class="comment-icon">👍</span>
                                        <span class="comment-text">Would recommend to a friend</span>
                                        {#if recommendFriend}
                                            <span class="check-mark">✓</span>
                                        {/if}
                                    </button>

                                    <button
                                        type="button"
                                        class="comment-option"
                                        class:selected={watchAgain}
                                        on:click={() => { watchAgain = !watchAgain; submitComment(); }}
                                    >
                                        <span class="comment-icon">🔄</span>
                                        <span class="comment-text">Would watch again</span>
                                        {#if watchAgain}
                                            <span class="check-mark">✓</span>
                                        {/if}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
        {#if isCalendarPopupOpen}
            <div class="popup-overlay" on:click={() => isCalendarPopupOpen = false} on:keydown={(e) => e.key === 'Escape' && (isCalendarPopupOpen = false)} role="button" tabindex="0">
                <div class="calendar-popup" on:click|stopPropagation on:keydown|stopPropagation role="dialog">
                    <button class="popup-close calendar-popup-close" on:click={() => isCalendarPopupOpen = false}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <CalendarSubscribe {baseUrl} />
                </div>
            </div>
        {/if}
    {:else}
        <p>No film set for this week yet!</p>
        <button class="action-button action-button--large" on:click={() => (isSidePanelOpen = !isSidePanelOpen)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            <span>Choose next film</span>
        </button>
    {/if}
    {#if isSidePanelOpen}
        <div
            class="side-panel-overlay"
            on:click={() => isSidePanelOpen = false}
            on:keydown={(e) => e.key === 'Escape' && (isSidePanelOpen = false)}
            role="button"
            tabindex="0"
            aria-label="Close side panel"
        ></div>
        <div
            class="side-panel"
            transition:slide={{
                delay: 250,
                duration: 300,
                easing: quintOut,
                axis: "x",
            }}
        >
            <SetNext closeSidePanel={() => isSidePanelOpen = false} userProfiles={data?.userProfiles} />
        </div>
    {/if}
</section>


<style lang="scss">
    .current-theme {
        margin-top: 1rem;
        padding: 1rem;
        background-color: $main-blue;
        color: #cadff4;
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .theme-end-date {
            font-size: 0.9rem;
            opacity: 0.8;
        }
    }
    .this-week {
        margin-top: 2rem;
        .film-host {
            font-weight: bold;
            text-transform: capitalize;
        }
    }
    .film-description {
        margin: 1rem 0;
        background-color: $main-orange;
        padding: 2rem;
        position: relative;
        border-radius: 12px;
        .film-header{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            @include tablet {
                flex-direction: column;
                gap: 0.75rem;
            }
            @include desktop {
                flex-direction: row;
            }
        }
        .film-title-wrapper {
            display: flex;
            flex-direction: column;
        }
        .film-title {
            color: #2a1a04;
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
        }
        .film-director,
        .film-country,
        .film-budget,
        .film-runtime,
        .film-revenue {
            margin: 0.25rem 0;
        }
        .film-genres {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin: 0.75rem 0;
        }
        .genre-tag {
            background-color: rgba(0, 0, 0, 0.15);
            color: #2a1a04;
            padding: 0.25rem 0.75rem;
            border-radius: 16px;
            font-size: 0.85rem;
            font-weight: 500;
        }
        .film-poster-and-plot {
            border-radius: 4px;
            margin-bottom: 3rem;
            display: flex;
            gap: 1rem;
            align-items: flex-start;
            @include tablet {
                flex-direction: column;
            }
            @include desktop {
                flex-direction: row;
            }
            .film-poster {
                border-radius: 8px;
                height: auto;
                flex: 0 0 auto;
                @include tablet {
                    width: 60%;
                    max-height: 90vw;
                }
                @include desktop {
                    width: 50%;
                }
            }
            .plot-and-score-wrapper {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                flex: 1;
            }
            .film-plot {
                margin: 0;
                padding: 1rem;
                border-radius: 4px;
                line-height: 1.5rem;
                background-color: $main-blue;
                color: #cadff4;
                z-index: 1;
            }
        }
    }
    .side-panel-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
        z-index: 10;
        cursor: pointer;
    }

    .side-panel {
        background: $body-color;
        right: 0;
        position: fixed;
        top: 0;
        height: 100vh;
        width: 90vw;
        max-width: 420px;
        overflow-y: auto;
        z-index: 11;
        box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);

        @include desktop {
            width: 400px;
        }
    }
    .action-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1rem;
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

        &--large {
            padding: 0.85rem 1.5rem;
            font-size: 1rem;
            border-radius: 10px;
        }
    }

    .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(1px);
        -webkit-backdrop-filter: blur(1px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
    }

    .score-popup {
        background: white;
        border-radius: 16px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    .popup-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 8px;
        color: #666;
        transition: all 0.2s ease;

        &:hover {
            background: rgba(0, 0, 0, 0.05);
            color: #333;
        }
    }

    .popup-content {
        padding: 2rem;
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
        }

        &__film-name {
            letter-spacing: 0.4px;
            font-weight: 700;
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

    .score-input {
        padding: 0.75rem 1rem;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 1rem;
        flex: 1;
        min-width: 150px;

        &:focus {
            outline: none;
            border-color: $main-blue;
        }
    }

    .film-comments {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 2px solid rgba(0, 0, 0, 0.1);

        h3 {
            margin: 0 0 1rem 0;
            font-size: 1.1rem;
            color: #333;
        }
    }

    .comment-options {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .comment-option {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        background: #fafafa;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
        width: 100%;

        &:hover {
            border-color: $main-blue;
            background: #f5f8ff;
        }

        &.selected {
            border-color: $main-blue;
            background: linear-gradient(135deg, rgba($main-blue, 0.1) 0%, rgba($main-blue, 0.05) 100%);
        }

        .comment-icon {
            font-size: 1.25rem;
        }

        .comment-text {
            flex: 1;
            font-size: 0.95rem;
            color: #333;
        }

        .check-mark {
            color: $main-blue;
            font-weight: bold;
            font-size: 1.1rem;
        }
    }

    .date-with-calendar {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .calendar-add-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        padding: 0;
        border: none;
        border-radius: 6px;
        background: linear-gradient(135deg, $main-blue 0%, darken($main-blue, 10%) 100%);
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;

        &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba($main-blue, 0.4);
        }

        &:active {
            transform: translateY(0);
        }

        svg {
            flex-shrink: 0;
        }
    }

    .calendar-popup {
        background: transparent;
        border-radius: 16px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow: hidden;
        position: relative;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);

        :global(.calendar-subscribe) {
            margin: 0;
            border-radius: 16px;
        }
    }

    .calendar-popup-close {
        z-index: 1;
        color: rgba(255, 255, 255, 0.8);

        &:hover {
            background: rgba(255, 255, 255, 0.15);
            color: white;
        }
    }
</style>
