import { getMeetingsForCalendar } from "$lib/server/database"
import { generateICalFeed } from "$lib/server/calendar"
import type { RequestHandler } from "@sveltejs/kit"

export const GET: RequestHandler = async (event) => {
    const meetings = await getMeetingsForCalendar()

    // Get the domain from the request URL
    const url = event.url
    const domain = url.hostname

    // Generate the iCal feed
    const icalContent = generateICalFeed(
        meetings,
        "Film Club",
        domain
    )

    // Return with proper content type for iCal
    return new Response(icalContent, {
        headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": "inline; filename=\"film-club-calendar.ics\"",
            // Allow caching for 1 hour
            "Cache-Control": "public, max-age=3600"
        }
    })
}
