<script lang="ts">
  import { getTitleWithOriginalTitle } from "$lib";
  import type { Film } from "@prisma/client";

    export let film: Film
</script>

<a href="https://www.imdb.com/title/{film.imdbId}">{getTitleWithOriginalTitle(film)}</a>