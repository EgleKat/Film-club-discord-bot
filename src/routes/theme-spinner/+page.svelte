<script lang="ts">
  import { onMount } from 'svelte';
const themes = `
Female Protagonist
Based on a book
Anime
Top 100 IMDB
Bottom 1000 IMDB
3D Animation
Comedy
Romance
Slice of life
Budget under 1 mil
Cartoon
Crime
Slasher
Horror
Live Action
Thriller
Minority protagonist
Different Perspective
Feel-good film
Black and White
Body
Survival
Romance
Something unexpected happens
Musical
Contrast
Family
Animal
Hentai
Conflict
History
Based on a true story
Food
Unlikely pairing/group
vegetarian
no theme
no theme
no theme
no theme
sports
fantasy
sci-fi
hero
weird
festival entry/winner
award winning
`.split("\n").map(t => t.trim()).filter(Boolean)
const props = {
  items: themes.map(t => ({label: t})),
  itemBackgroundColors: ["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"]
}

onMount(async () => {
  const { Wheel } = await import('spin-wheel');
  new Wheel(
    document.getElementById('wheel'),
    props,
  )
})

</script>

<div style="display: flex; justify-content: center; align-items: center; flex-direction: column">
<svg viewBox="0 0 100 100" width="5%">
  <polygon fill="currentColor" points="50 100, 100 0, 0 0"/>
</svg>
<div id="wheel" style="width: 100%; height: 100%; position: relative; top: -5%"></div>
</div>