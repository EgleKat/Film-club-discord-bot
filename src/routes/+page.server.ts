import type { Actions } from './$types';
import { addFilm, createMeeting, getCurrentMeeting } from "$lib/server/database";
import omdb from '$lib/server/omdb';
import type { OmdbFilmWithPlot } from '$lib/types';
import { usernames } from '$lib/server/password';

export const load = async () => {
    const meeting = await getCurrentMeeting();
    return {
        meeting,
        usernames,
    }
};


export const actions = {
    default: async ({request}) => {
        // set next film
        const data = await request.formData();
        const date = data.get('date') as string;
        const host = data.get('host') as string;
        const imdbID = data.get('film') as string;
        const film = await omdb.query<OmdbFilmWithPlot>(`i=${imdbID}&type=movie&plot=short`);
        await addFilm(imdbID, film.title, film.year, film.poster, film.Plot);
        await createMeeting(imdbID, new Date(date), host);
    },
} satisfies Actions;