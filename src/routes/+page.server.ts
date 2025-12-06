import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { createMeeting, createScore, getCurrentMeeting, getCurrentTheme, getNumberOfScoresSubmitted, getShownScores } from "$lib/server/database"
import { usernames } from '$lib/server/password'
import { findAndAddFilm } from '$lib/server/service'
import type { Score } from '@prisma/client';

export const load = async ({locals}) => {
    const meeting = await getCurrentMeeting()
    const theme = await getCurrentTheme()
    let scores: Score[] = []
    let numberOfSubmittedScores: number = 0
    const currentUserUsername = locals.user.username;
    if (meeting) {
        scores = await getShownScores(meeting.id)
        numberOfSubmittedScores = await getNumberOfScoresSubmitted(meeting.id)
    }


    return {
        currentUserUsername,
        meeting,
        theme,
        usernames,
        scores,
        numberOfSubmittedScores
    }
}


export const actions = {
    meeting: async ({request}) => {
        const data = await request.formData();
        const date = data.get('date');
        const host = data.get('host');
        const tmdbId = data.get('film');

        if (!date) return fail(400, {error: "Missing date"});
        if (!host) return fail(400, {error: "Missing host"});
        if (!tmdbId) return fail(400, {error: "Missing film"});

        const film = await findAndAddFilm(tmdbId);
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


