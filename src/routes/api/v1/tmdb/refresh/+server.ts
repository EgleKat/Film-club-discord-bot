import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getAllFilms, updateFilmTmdbData } from '$lib/server/database'
import MovieSearch from '$lib/server/movie-search'

/**
 * POST /api/v1/tmdb/refresh
 *
 * One-off endpoint to fetch additional TMDB data (runtime, language, revenue, rating, genres)
 * for all films in the database. This populates the new fields needed for Wrapped awards.
 *
 * Response includes count of updated films and any errors encountered.
 */
export const POST: RequestHandler = async () => {
    const films = await getAllFilms()

    const results = {
        total: films.length,
        updated: 0,
        skipped: 0,
        errors: [] as string[]
    }

    for (const film of films) {
        try {
            // Skip films that already have the new data
            if (film.runtime !== null && film.genres !== null) {
                results.skipped++
                continue
            }

            // Handle films with tmdb_ prefix (no IMDB ID)
            let tmdbData = null
            if (film.imdbId.startsWith('tmdb_')) {
                const tmdbId = parseInt(film.imdbId.replace('tmdb_', ''), 10)
                tmdbData = await MovieSearch.tmdbGetMovie(tmdbId)
            } else {
                // Look up by IMDB ID
                tmdbData = await MovieSearch.tmdbFindByImdbId(film.imdbId)
            }

            if (!tmdbData) {
                results.errors.push(`Could not find TMDB data for ${film.imdbId} (${film.originalTitle})`)
                continue
            }

            // Update the film with new data
            await updateFilmTmdbData(film.imdbId, {
                runtime: tmdbData.runtime,
                originalLanguage: tmdbData.original_language,
                revenue: tmdbData.revenue ? BigInt(tmdbData.revenue) : null,
                tmdbVoteAverage: tmdbData.vote_average,
                genres: tmdbData.genres ? JSON.stringify(tmdbData.genres.map(g => g.name)) : null
            })

            results.updated++

            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 250))
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            results.errors.push(`Error updating ${film.imdbId} (${film.originalTitle}): ${errorMessage}`)
        }
    }

    return json(results)
}
