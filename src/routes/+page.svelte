<script lang="ts">
    import ScoreModal from "$lib/components/ScoreModal.svelte";
    import type { Meeting, Score } from "$lib/types";
    import lodash from "lodash";
    import Toast from "$lib/components/Toast.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import SpanWithIcon from "$lib/components/SpanWithIcon.svelte";
    import SetNext from "$lib/components/SetNext.svelte";
    import { slide } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    import Button from "$lib/components/Button.svelte";
    type PageData = {
        meeting?: Meeting;
        usernames: string[];
        scores: Score[];
        numberOfSubmittedScores: number;
    };

    export let data: PageData;
    export let form;
    const meeting = data.meeting;
    const film = meeting?.film;
    const scores = data?.scores;
    const numberOfSubmittedScores = data?.numberOfSubmittedScores;
    let isSidePanelOpen = false;
</script>

<section>
    {#if form?.error}
        <Toast status="error" title="Error" description={form.error} />
    {/if}
    {#if film}
        <div class="this-week">
            <SpanWithIcon>
                <span> This week, chosen by </span>
                <Icon type="user" />
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
                <div class="film-title">{film.title} ({film.year})</div>
                <Button variant="tertiary" size="small" class="add-film" on:click={() => (isSidePanelOpen = !isSidePanelOpen)}>
                    Choose next film
                    <Icon type="chevron-double-right" width="1.5rem" height="1.5rem" />
                </Button>
            </div>
            {#if film.director}
                <p class="film-director">Director - {film.director}</p>
            {/if}
            {#if film.budget > 0}
                <p class="film-budget">Budget - {film.budget.toLocaleString()}</p>
            {/if}
            <div class="film-poster-and-plot">
                <img
                    class="film-poster"
                    src={film.poster}
                    alt={`Poster for ${film.title}`}
                />
                <p class="film-plot">{film.plot}</p>
            </div>
        </div>
    {:else}
        <p>No film set for this week yet!</p>
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
            title={film?.title ?? ""}
            {scores}
            {numberOfSubmittedScores}
        />
    {/if}
</section>

<style lang="scss">
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
        background: rgb(216, 216, 216);
        right: 0;
        position: fixed;
        top: 1vh;
        height: 90vh;
        margin: auto;
        padding: 2rem;
        z-index: 1;
    }
    .add-film {
        font-size: large;
        height: 8rem;
        width: 8rem;
        background-color: $main-blue;
        color: rgb(229, 230, 244);
        padding: 1rem;
        border-radius: 50%;
    }
</style>
