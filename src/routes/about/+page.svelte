<script lang="ts">
    import AboutData from "$lib/AboutData.svelte";
    export let data:{films:string[]};
    
</script>


<section>
    <AboutData title="about" body="body" />
    <!-- {data.films.map(film => (
        <a>test</a>
    ) -->
</section>