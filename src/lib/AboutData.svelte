<script lang="ts">
    export let title:string
    export let body:string

    let name: string = "test"
    let showBackground = false

    let films = [
        "test",
        "anotherFilm"
    ]

    let changeFilms = () => {
        showBackground = true
        films = [...films, "myNewFilm"]
    }

    let changeName = () => {
        name = "Ted"
    }

    $: { 
        let test:number = 1 + 1

    }

    $: secondName = name
</script>

<section>
    <h1>{title}</h1>
    <p>{body}</p>
    <p>{name}</p>
    <p>{secondName}</p>
    <h1>films</h1>
    <div class:reactiveclass={showBackground}>
        {#each films as film}
            <p>{film}</p>
        {/each}
    </div>
    <button on:click={changeName}>Change Name</button>
    <button on:click={changeFilms}>Change Films</button>
</section>

<style>
    .reactiveclass {
        background-color: blue
    }
</style>