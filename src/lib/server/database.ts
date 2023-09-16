import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const addFilm = async (imdbId: string, title: string, year: string, poster: string, plot: string) => {
    return await prisma.film.upsert({ 
        where: { imdbId },
        create: { imdbId, title, year, poster, plot },
        update: { title, year, poster, plot },
    })
}
export const createMeeting = async (filmId: string, date: Date, host: string) => {
    return await prisma.meeting.upsert({
        where: { date },
        create: { filmId, date, host },
        update: { filmId, host, hidden: false },
    })
}

export const getCurrentMeeting = async () => {
    // get the next meeting
    const meeting = await prisma.meeting.findFirst({
        orderBy: { date: 'asc' },
        include: { film: true, scores: true },
        where: { date: { gte: new Date() } }
    })
    if (meeting !== null) {
        return meeting
    }

    // if there is no next meeting, get the last meeting
    return await prisma.meeting.findFirst({
        orderBy: { date: 'desc' },
        include: { film: true, scores: true },
    })
}

export const getAllMeetings = async () => {
    return await prisma.meeting.findMany({
        orderBy: { date: 'asc' },
        include: { film: true, scores: true },
    })
}

export const toggleHiddenMeeting = async (meetingId: number) => {
    const meeting = await prisma.meeting.findUniqueOrThrow({
        where: { id: meetingId },
    })
    return await prisma.meeting.update({
        where: { id: meetingId },
        data: { hidden: !meeting.hidden },
    })
}

export const createScore = async (meetingId: number, clubber: string, score: string) => {
    return await prisma.score.upsert({
        where: { 
            userMeetingScoreIdentifier: { meetingId, clubber }
        },
        update: { score },
        create: { meetingId, clubber, score }
    })
}