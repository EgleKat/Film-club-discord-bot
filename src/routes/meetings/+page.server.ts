import { toggleHiddenMeeting, getAllMeetings } from '$lib/server/database.js'
import type { Actions } from '@sveltejs/kit'

export const load = async ({locals}) => {
    const meetings = await getAllMeetings()
    return {
        meetings,
    }
}
export const actions = {
    toggleHidden: async ({request}) => {
        const data = await request.formData();
        const meetingId = data.get('id');
        await toggleHiddenMeeting(parseInt(meetingId as string, 10));
    },
} satisfies Actions