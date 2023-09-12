import type { Actions } from './$types';
import { addFilm, createMeeting, getCurrentMeeting } from "$lib/server/database";
import MovieSearch from '$lib/server/movie-search';
import { usernames } from '$lib/server/password';
import { fail } from '@sveltejs/kit';

export const load = async () => {
    const meeting = await getCurrentMeeting();
    return {
        meeting,
        usernames,
    }
};


export const actions = {
    default: async ({request}) => {
        const data = await request.formData();
        const date = data.get('date');
        const host = data.get('host');
        const tmdbId = data.get('film');

        if (!date) return fail(400, {missingFilm: true});
        if (!host) return fail(400, {missingHost: true});
        if (!tmdbId) return fail(400, {missingFilm: true});

        const film = await MovieSearch.tmdbGetMovie(parseInt(tmdbId as string, 10));
        // set next film
        await addFilm(film.imdb_id, film.original_title, film.release_date.substring(0, 4), "https://image.tmdb.org/t/p/w500" + film.poster_path, film.overview);
        await createMeeting(film.imdb_id, new Date(date as string), host as string);
    },
} satisfies Actions;