import type { Actions } from './$types';
import MovieSearch from '$lib/server/movie-search';
import { fail } from '@sveltejs/kit';
import { addFilm, createMeeting, createScore, getCurrentMeeting, getShownScores } from "$lib/server/database"
import { usernames } from '$lib/server/password'
import type { Score } from '@prisma/client';

export const load = async () => {
    const meeting = await getCurrentMeeting()
    let scores: Score[] = []

    if (meeting) {
        scores = await getShownScores(meeting.id)
    }

    return {
        meeting,
        usernames,
        scores
    }
}


export const actions = {
    meeting: async ({request}) => {
        const data = await request.formData();
        const date = data.get('date');
        const host = data.get('host');
        const tmdbId = data.get('film');

        if (!date) return fail(400, {missingFilm: true});
        if (!host) return fail(400, {missingHost: true});
        if (!tmdbId) return fail(400, {missingFilm: true});

        const film = await MovieSearch.tmdbGetMovie(parseInt(tmdbId as string, 10));
        if (!film.imdb_id) {
            // if the film doesn't have an imdb id, fallback to tmdb id
            film.imdb_id = "tmdb_" + tmdbId
        }
        // set next film
        await addFilm(film.imdb_id, film.original_title, film.release_date.substring(0, 4), "https://image.tmdb.org/t/p/w500" + film.poster_path, film.overview);
        await createMeeting(film.imdb_id, new Date(date as string), host as string);
    },
    score: async ({request, locals}) => {
        const data = await request.formData()
        const score = data.get('score') as string
    
        const meeting = await getCurrentMeeting()

        if (meeting) {
            createScore(meeting.id,  locals.user.username, score)
        }
    }
} satisfies Actions