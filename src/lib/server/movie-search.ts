import { env } from "$env/dynamic/private";
import { building } from '$app/environment';
import type { TmdbFilmWithExtras } from "$lib/types";

async function queryOmdb<T>(params: string): Promise<T> {
    if (env.OMDB_API_KEY === undefined) throw new Error("OMDB_API_KEY is not defined");
    const result = fetch(`https://www.omdbapi.com/?apikey=${env.OMDB_API_KEY}&${params}`);
    return (await result).json();
}

if (!building && env.TMDB_ACCESS_KEY === undefined) throw new Error("TMDB_ACCESS_KEY is not defined");
const tmdbFetchOptions = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${env.TMDB_ACCESS_KEY}`
  }
};
async function tmdbSearch<T>(params: string): Promise<T> {
    const result = fetch(
        `https://api.themoviedb.org/3/search/movie?include_adult=true&${params}`,
        tmdbFetchOptions
    );
    return (await result).json();
}
async function tmdbGetMovie(tmdbId: number): Promise<TmdbFilmWithExtras> {
    const result = fetch(
        `https://api.themoviedb.org/3/movie/${tmdbId}`,
        tmdbFetchOptions
    );
    return (await result).json();
}


export default {queryOmdb, tmdbSearch, tmdbGetMovie}