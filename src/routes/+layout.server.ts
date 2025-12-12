import type { Actions } from './$types';
import MovieSearch from '$lib/server/movie-search';
import { fail } from '@sveltejs/kit';
import { addFilm, createMeeting, createScore, getCurrentMeeting, getNumberOfScoresSubmitted, getShownScores, getUserProfile, getProfileImageUrl } from "$lib/server/database"
import { usernames } from '$lib/server/password'
import type { Score } from '@prisma/client';

export const load = async ({locals, url}) => {
    const username = locals.user.username;
    const userProfile = await getUserProfile(username);

    // Get base URL for calendar subscription
    const baseUrl = `${url.protocol}//${url.host}`

    return {
        username,
        profileImageUrl: getProfileImageUrl(userProfile),
        baseUrl
    }
}
