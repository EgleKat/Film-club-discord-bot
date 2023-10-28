<script lang="ts">
    import type { TmdbFilm } from "$lib/types";
    import { debounce } from "lodash";

    const today = new Date();
    const nextSundayUtc = new Date(
        Date.UTC(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + (7 - today.getDay())
        )
    );
    let autoCompleteList: TmdbFilm[] | null = null;
    export let usernames: string[];
    export let closeSidePanel: () => void;
    const searchFilm = debounce((e: Event) => {
        e.preventDefault();
        const input = e.target as HTMLInputElement;
        const title = input.value;
        fetch(`/api/v1/tmdb/search?query=${encodeURIComponent(title)}`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((filmData) => {
                autoCompleteList = filmData.results;
            });
    }, 200);
</script>

<div class="set-next-film">
    <form method="POST" action="?/meeting">
        <p>
            Date:
            <!--default to next sunday-->
            <input
                type="date"
                name="date"
                autocomplete="off"
                value={nextSundayUtc.toISOString().substring(0, 10)}
            />
        </p>
        <p />
        <fieldset>
            <legend>Host</legend>
            {#each usernames as username}
                <div>
                    <input
                        type="radio"
                        name="host"
                        value={username}
                        id={username}
                        autocomplete="off"
                    />
                    <label for={username}>{username}</label>
                </div>
            {/each}
        </fieldset>
        <p>
            Film:
            <input
                type="text"
                placeholder="e.g. Titanic"
                on:input={searchFilm}
                autocomplete="off"
            />

            {#if !autoCompleteList}
                <p>Start typing to search for a film</p>
            {/if}
            {#if autoCompleteList && autoCompleteList.length === 0}
                <p>No films found</p>
            {/if}
            {#if autoCompleteList && autoCompleteList.length > 0}
                <ul>
                    <fieldset style="border: none">
                        {#each autoCompleteList as film}
                            <li style="list-style-type: none;">
                                <input
                                    type="radio"
                                    id={film.id.toString()}
                                    name="film"
                                    value={film.id}
                                    autocomplete="off"
                                />
                                <label for={film.id.toString()}
                                    >{film.original_title} ({film.release_date.substring(
                                        0,
                                        4
                                    )})</label
                                >
                            </li>
                        {/each}
                    </fieldset>
                </ul>
                <button type="submit" on:click={closeSidePanel}>Set next film</button>
            {/if}
        </p>
    </form>
</div>

<style lang="scss">
    .set-next-film {
        border-left: 1px solid rgb(184, 184, 184);
        padding-left: 1rem;
    }
</style>
