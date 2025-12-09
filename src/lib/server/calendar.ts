/**
 * iCal Calendar Service
 * Generates .ics calendar feeds for film club meetings
 */

import type { Meeting, Film } from "@prisma/client"

interface MeetingWithFilm extends Meeting {
    film: Film
}

/**
 * Escape special characters in iCal text fields
 */
function escapeICalText(text: string): string {
    return text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n')
}

/**
 * Format a date to iCal DATE format (YYYYMMDD)
 */
function formatICalDate(date: Date): string {
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    return `${year}${month}${day}`
}

/**
 * Format a date to iCal DATETIME format (YYYYMMDDTHHMMSSZ)
 */
function formatICalDateTime(date: Date): string {
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    const hours = String(date.getUTCHours()).padStart(2, '0')
    const minutes = String(date.getUTCMinutes()).padStart(2, '0')
    const seconds = String(date.getUTCSeconds()).padStart(2, '0')
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}

/**
 * Generate a unique UID for a calendar event
 */
function generateEventUID(meeting: MeetingWithFilm, domain: string): string {
    return `film-club-meeting-${meeting.id}@${domain}`
}

/**
 * Generate an iCal event (VEVENT) for a meeting
 */
function generateEvent(meeting: MeetingWithFilm, domain: string): string {
    const film = meeting.film
    const filmTitle = film.title || film.originalTitle
    const filmYear = film.year

    // Event summary: Film name and year
    const summary = `Film Club: ${filmTitle} (${filmYear})`

    // Event description
    const descriptionParts = [
        `Hosted by: ${meeting.host}`,
        '',
        `Film: ${filmTitle} (${filmYear})`,
    ]

    if (film.director) {
        descriptionParts.push(`Director: ${film.director}`)
    }

    if (film.country) {
        descriptionParts.push(`Country: ${film.country}`)
    }

    if (film.runtime) {
        const hours = Math.floor(film.runtime / 60)
        const minutes = film.runtime % 60
        const runtimeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
        descriptionParts.push(`Runtime: ${runtimeStr}`)
    }

    if (film.plot) {
        descriptionParts.push('')
        descriptionParts.push(`Plot: ${film.plot}`)
    }

    const description = escapeICalText(descriptionParts.join('\n'))

    // Use meeting date as an all-day event
    const eventDate = formatICalDate(meeting.date)
    const nextDay = new Date(meeting.date)
    nextDay.setUTCDate(nextDay.getUTCDate() + 1)
    const nextDayStr = formatICalDate(nextDay)

    // Use current timestamp for DTSTAMP
    const now = new Date()
    const dtstamp = formatICalDateTime(now)

    // Use meeting date as LAST-MODIFIED (or current if meeting was just created)
    const lastModified = formatICalDateTime(meeting.date)

    const uid = generateEventUID(meeting, domain)

    const lines = [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART;VALUE=DATE:${eventDate}`,
        `DTEND;VALUE=DATE:${nextDayStr}`,
        `SUMMARY:${escapeICalText(summary)}`,
        `DESCRIPTION:${description}`,
        `ORGANIZER;CN=${escapeICalText(meeting.host)}:mailto:filmclub@${domain}`,
        `STATUS:CONFIRMED`,
        `TRANSP:TRANSPARENT`,
        'END:VEVENT'
    ]

    return lines.join('\r\n')
}

/**
 * Generate a complete iCal calendar with all meetings
 */
export function generateICalFeed(meetings: MeetingWithFilm[], calendarName: string, domain: string): string {
    const now = new Date()
    const dtstamp = formatICalDateTime(now)

    const calendarLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Film Club//Film Club Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:${escapeICalText(calendarName)}`,
        `X-WR-CALDESC:${escapeICalText('Film Club meeting schedule with film selections')}`,
        // Refresh interval: 1 hour
        'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
        'X-PUBLISHED-TTL:PT1H'
    ]

    // Add each meeting as an event
    for (const meeting of meetings) {
        calendarLines.push(generateEvent(meeting, domain))
    }

    calendarLines.push('END:VCALENDAR')

    // iCal format requires CRLF line endings
    return calendarLines.join('\r\n')
}

/**
 * Generate the calendar feed URL for a given base URL
 */
export function getCalendarFeedUrl(baseUrl: string): string {
    return `${baseUrl}/api/v1/calendar/feed.ics`
}
