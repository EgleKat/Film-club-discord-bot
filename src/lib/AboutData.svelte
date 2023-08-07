<script lang="ts">
    import type { Film } from "@prisma/client";


    export let title:string
    export let body:string
    export let films:Film[]

    let name: string = "test"
    let showBackground = false

    let changeName = () => {
        name = 'Ted'
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
            <p>{film.title}</p>
        {/each}
    </div>
    <button on:click={changeName}>Change Name</button>
</section>

<style>
    .reactiveclass {
        background-color: blue
    }
</style>