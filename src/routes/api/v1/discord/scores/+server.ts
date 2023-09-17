import { getCurrentMeeting, getScores, setShowScore } from "$lib/server/database";
import { postScores } from "$lib/server/discord";
import type { Score } from "@prisma/client";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async (event) => {
    // const query = await MovieSearch.queryOmdb(event.url.searchParams.toString());
    // const query = await getScores(event.)
    const meeting = await getCurrentMeeting()
    let scores: Score[] = []

    if (!meeting) {
        console.error("[CRIT] Current meeting not found")
        throw new Error("[CRIT] Current meeting not found")
    }

    scores = await getScores(meeting.id)
    postScores(meeting.film, scores)
    setShowScore(meeting.id)

    return json({scores})
}