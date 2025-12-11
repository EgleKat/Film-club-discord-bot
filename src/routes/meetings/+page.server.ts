import { toggleHiddenMeeting, getAllMeetings, getFilmCommentsForMeetings, getUserProfiles, getProfileImageUrl } from '$lib/server/database.js'
import type { Actions } from '@sveltejs/kit'

export const load = async ({locals}) => {
    const meetings = await getAllMeetings()
    const meetingIds = meetings.map(m => m.id)
    const comments = await getFilmCommentsForMeetings(meetingIds)

    // Get unique usernames from comments
    const commentUsernames = [...new Set(comments.map(c => c.clubber))]
    const userProfiles = await getUserProfiles(commentUsernames)

    // Create a map of username to profile image
    const userProfileMap: Record<string, string | null> = {}
    for (const profile of userProfiles) {
        userProfileMap[profile.username] = getProfileImageUrl(profile)
    }

    // Group comments by meetingId
    const commentsByMeeting: Record<number, { clubber: string, recommendFriend: boolean, watchAgain: boolean }[]> = {}
    for (const comment of comments) {
        if (!commentsByMeeting[comment.meetingId]) {
            commentsByMeeting[comment.meetingId] = []
        }
        commentsByMeeting[comment.meetingId].push({
            clubber: comment.clubber,
            recommendFriend: comment.recommendFriend,
            watchAgain: comment.watchAgain
        })
    }

    return {
        meetings,
        commentsByMeeting,
        userProfileMap,
    }
}
export const actions = {
    toggleHidden: async ({request}) => {
        const data = await request.formData();
        const meetingId = data.get('id');
        await toggleHiddenMeeting(parseInt(meetingId as string, 10));
    },
} satisfies Actions