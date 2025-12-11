import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { createMeeting, createScore, getCurrentMeeting, getCurrentTheme, getNumberOfScoresSubmitted, getShownScores, getUserProfile, getUserProfiles, getVisibleUserProfiles, getFilmComment, updateFilmComment, getSubmittedScoreUsers } from "$lib/server/database"
import { findAndAddFilm } from '$lib/server/service'
import type { Score } from '@prisma/client';

export const load = async ({locals, url}) => {
    const meeting = await getCurrentMeeting()
    const theme = await getCurrentTheme()
    let scores: Score[] = []
    let numberOfSubmittedScores: number = 0
    let hostProfileImageUrl: string | null = null
    let scoreUserProfiles: Record<string, string | null> = {}
    let submittedUsers: string[] = []
    let submittedUserProfiles: Record<string, string | null> = {}
    let userFilmComment: { recommendFriend: boolean, watchAgain: boolean } | null = null
    const currentUserUsername = locals.user.username;
    if (meeting) {
        scores = await getShownScores(meeting.id)
        numberOfSubmittedScores = await getNumberOfScoresSubmitted(meeting.id)
        submittedUsers = await getSubmittedScoreUsers(meeting.id)
        const hostProfile = await getUserProfile(meeting.host)
        hostProfileImageUrl = hostProfile?.imageUrl ?? null

        // Fetch user profiles for all users who submitted scores
        if (scores.length > 0) {
            const scoreUsernames = scores.map(s => s.clubber)
            const profiles = await getUserProfiles(scoreUsernames)
            scoreUserProfiles = profiles.reduce((acc, profile) => {
                acc[profile.username] = profile.imageUrl
                return acc
            }, {} as Record<string, string | null>)
        }

        // Fetch profiles for submitted users (even when scores not revealed)
        if (submittedUsers.length > 0) {
            const profiles = await getUserProfiles(submittedUsers)
            submittedUserProfiles = profiles.reduce((acc, profile) => {
                acc[profile.username] = profile.imageUrl
                return acc
            }, {} as Record<string, string | null>)
        }

        const comment = await getFilmComment(meeting.id, currentUserUsername)
        if (comment) {
            userFilmComment = {
                recommendFriend: comment.recommendFriend,
                watchAgain: comment.watchAgain
            }
        }
    }

    // Get base URL for calendar subscription
    const baseUrl = `${url.protocol}//${url.host}`

    const userProfiles = await getVisibleUserProfiles()

    return {
        currentUserUsername,
        meeting,
        theme,
        userProfiles,
        scores,
        numberOfSubmittedScores,
        hostProfileImageUrl,
        scoreUserProfiles,
        submittedUsers,
        submittedUserProfiles,
        baseUrl,
        userFilmComment
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
    },
    comment: async ({request, locals}) => {
        const data = await request.formData()
        const recommendFriend = data.get('recommendFriend') === 'true'
        const watchAgain = data.get('watchAgain') === 'true'
        const meeting = await getCurrentMeeting()

        if (meeting) {
            await updateFilmComment(meeting.id, locals.user.username, recommendFriend, watchAgain)
        }
    }
} satisfies Actions


