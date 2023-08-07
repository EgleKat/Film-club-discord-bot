
<script lang="ts">
    import type { Film } from '@prisma/client'
    import AboutData from "$lib/AboutData.svelte"

    export let data:{films:Film[]};
    export let form:{
        success:boolean,
        message?:string,
        film: Film
    }
</script>


<section>
    <AboutData title="about" body="body" films={data.films} />
    <h1>Add a Film</h1>
    {#if form?.film}
        <h2>Film Added</h2>
        <p>{form.film.title}</p>
    {/if}
    <form method="post" action="?/create">
        <label for="title">Title:</label>
        <input type="text" name="title" />
        <label for="description">Description:</label>
        <input type="text" name="description" />
        <button type="submit">Create Film</button>
        <p class="error" class:hidden={!form?.success}>{form?.message}</p>
    </form>
</section>

<style lang="sass">
    .error
        color: red

    .hidden
        display: none
</style>