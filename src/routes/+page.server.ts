import type { Actions } from './$types'
import { addFilm, createMeeting, createScore, getCurrentMeeting, getScores } from "$lib/server/database"
import omdb from '$lib/server/omdb'
import type { OmdbFilmWithPlot } from '$lib/types'
import { usernames } from '$lib/server/password'
import type { Score } from '@prisma/client'

export const load = async ({locals}) => {
    const meeting = await getCurrentMeeting()
    let scores: Score[] = []

    if (meeting) {
        scores = await getScores(meeting.id)
    }

    return {
        meeting,
        usernames,
        scores
    }
}


export const actions = {
    searchFilm: async ({request}) => {
        // set next film
        const data = await request.formData()
        const date = data.get('date') as string
        const host = data.get('host') as string
        const imdbID = data.get('film') as string
        const film = await omdb.query<OmdbFilmWithPlot>(`i=${imdbID}&type=movie&plot=short`)
        await addFilm(imdbID, film.Title, film.Year, film.Poster, film.Plot)
        console.log(date)
        await createMeeting(imdbID, new Date(date), host)
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