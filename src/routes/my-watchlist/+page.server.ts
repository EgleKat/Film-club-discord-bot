import { addFilm, addToWatchList, getWatchList, toggleHiddenWatchListEntry, watchAndReview } from '$lib/server/database.js'
import { findAndAddFilm } from '$lib/server/service.js';
import { fail, type Actions } from '@sveltejs/kit'
import { isInteger } from 'lodash';
import { parse } from 'path';

export const load = async ({locals}) => {
    const currentUserUsername = locals.user.username;
    return {
        watchlist: getWatchList(currentUserUsername),
        currentUserUsername,
    }
}
export const actions = {
    toggleHidden: async ({request}) => {
        const data = await request.formData();
        const watchlistId = data.get('id');
        await toggleHiddenWatchListEntry(parseInt(watchlistId as string, 10));
    },
    addFilm: async ({request, locals}) => {
        const data = await request.formData();
        const tmdbId = data.get('film');
        const dateWatched = data.get('dateWatched');
        const score = data.get('score');
        if (!tmdbId) return fail(400, {error: "Missing film"});
        const film = await findAndAddFilm(tmdbId);
        await addToWatchList(film.imdb_id, locals.user.username, dateWatched != null ? new Date(dateWatched as string) : undefined, score as string ?? undefined);
    },
    submitScore: async ({request}) => {
        const data = await request.formData();
        const watchlistEntryId = data.get('id');
        const score = data.get('score');
        const dateWatched = data.get('dateWatched');
        await watchAndReview(parseInt(watchlistEntryId as string, 10), new Date(dateWatched as string), score as string);
    }
} satisfies Actions