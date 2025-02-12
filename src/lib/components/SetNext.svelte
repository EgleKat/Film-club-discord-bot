<script lang="ts">
    import FilmSelector from "./FilmSelector.svelte";

    const today = new Date();
    const nextSundayUtc = new Date(
        Date.UTC(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + (7 - today.getDay())
        )
    );
    export let usernames: string[];
    export let closeSidePanel: () => void;
</script>

<div class="set-next-film">
    <button class="icon-button" on:click={closeSidePanel}>
        Close
     </button>
    <form method="POST" action="?/meeting">
        <p>
            Date:
            <!--default to next sunday-->
            <input
                type="date"
                name="date"
                autocomplete="off"
                value={nextSundayUtc.toISOString().substring(0, 10)}
                required
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
                        required
                    />
                    <label for={username}>{username}</label>
                </div>
            {/each}
        </fieldset>
        <p>
            <FilmSelector />
        </p>
        <button type="submit" on:submit={closeSidePanel}>Set next film</button>
    </form>
</div>

<style lang="scss">
    .set-next-film {
        border-left: 1px solid rgb(184, 184, 184);
        padding-left: 1rem;
    }
</style>
