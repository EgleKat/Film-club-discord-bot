<script lang="ts">
    // import type { Score } from "$lib/types";

    export let title: string
    export let description: string
    export let status: "success" | "warning" | "error"
    // const sendScores = () => {
    //     fetch("/api/v1/discord/scores", { method: 'POST' })
    //         .then(res => res.json())
    //         .then(res => {
    //             scores = res.scores
    //         })
    // }
</script>

<style>

    .error {
        background-color: red;
    }
    .warning {
        background-color: yellow;
    }
    .success {
        background-color: green;
    }
    .hidden {
        display: none;
    }
</style>

<div class={"toast " + status} >
    <span class:hidden={title}>
        {title}
    </span>
    <div class:hidden={description}>
        {description}
    </div>
</div>