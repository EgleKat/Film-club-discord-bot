<script lang="ts">
    import type { Film } from "@prisma/client"

    export let film: Film
</script>

<article>
    <h1>{film.title}</h1>
    <p>{film.description}</p>
</article>