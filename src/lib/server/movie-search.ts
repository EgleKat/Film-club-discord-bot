import { env } from "$env/dynamic/private";
import { building } from '$app/environment';
import type { TmdbFilmWithExtras, TmdbFilmCredits} from "$lib/types";

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
async function tmdbGetMovieCredits(tmdbId: number): Promise<TmdbFilmCredits> {
    const result = fetch(
        `https://api.themoviedb.org/3/movie/${tmdbId}/credits`,
        tmdbFetchOptions
    );
    return (await result).json();
}

interface TmdbFindResult {
    movie_results: Array<{ id: number }>;
}

/**
 * Find a movie by IMDB ID using TMDB's find endpoint
 */
async function tmdbFindByImdbId(imdbId: string): Promise<TmdbFilmWithExtras | null> {
    const findResult = await fetch(
        `https://api.themoviedb.org/3/find/${imdbId}?external_source=imdb_id`,
        tmdbFetchOptions
    );
    const findData: TmdbFindResult = await findResult.json();

    if (findData.movie_results && findData.movie_results.length > 0) {
        const tmdbId = findData.movie_results[0].id;
        return await tmdbGetMovie(tmdbId);
    }

    return null;
}


export default {queryOmdb, tmdbSearch, tmdbGetMovie, tmdbGetMovieCredits, tmdbFindByImdbId}