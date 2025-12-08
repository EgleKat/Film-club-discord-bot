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

    export let data: PageData;
    export let form;
    const meeting = data.meeting;
    const film = meeting?.film;
    const theme = data.theme;
    const scores = data?.scores;
    const numberOfSubmittedScores = data?.numberOfSubmittedScores;
    const hostProfileImageUrl = data?.hostProfileImageUrl;
    let isSidePanelOpen = false;
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
        <div>
            <SpanWithIcon>
                <span>To be discussed on </span>
                <Icon type="calendar-mark" />
                <span>{meeting?.date.toLocaleDateString()}</span></SpanWithIcon
            >
        </div>

        <div class="film-description">
            <div class="film-header">
                <div class="film-title"><FilmTitle film={meeting.film} /></div>
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
            {#if film.budget && film.budget > 0}
                <p class="film-budget">Budget - {film.budget.toLocaleString()}</p>
            {/if}
            <div class="film-poster-and-plot">
                <img
                    class="film-poster"
                    src={film.poster}
                    alt={`Poster for ${film.originalTitle}`}
                />
                <p class="film-plot">{film.plot}</p>
            </div>
        </div>
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
            class="side-panel"
            transition:slide={{
                delay: 250,
                duration: 300,
                easing: quintOut,
                axis: "x",
            }}
        >
            <SetNext closeSidePanel={() => isSidePanelOpen = false} usernames={data?.usernames} />
        </div>
    {/if}
</section>
<section>
    {#if film}
        <ScoreModal
            title={getTitleWithOriginalTitle(film)}
            {scores}
            {numberOfSubmittedScores}
        />
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
        $cutout-height: 6rem;
        margin-bottom: $cutout-height;
        &:after {
            content: "";
            position: absolute;
            display: block;
            left: 0rem;
            width: 101%;
            background-color: #f0f0ff;
            transform: skewY(-3deg);
            border-top: solid #f0f0ff $cutout-height;
        }
        .film-header{
            display: flex;
            justify-content: space-between;
        }
        .film-title {
            color: #2a1a04;
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
        }
        .film-director{

        }
        .film-budget {
            
        }
        .film-poster-and-plot {
            border-radius: 4px;
            margin-bottom: 3rem;
            display: flex;
            gap: 1rem;
            align-items: center;
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
            .film-plot {
                margin: auto 1rem;
                padding: 1rem;
                border-radius: 4px;
                line-height: 1.5rem;
                background-color: $main-blue;
                color: #cadff4;
                z-index: 1;
            }
        }
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
        z-index: 10;
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
</style>
