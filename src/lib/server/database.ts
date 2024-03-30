import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const addFilm = async (imdbId: string, title: string, year: string, poster: string, plot: string, director: string) => {
    return await prisma.film.upsert({ 
        where: { imdbId },
        create: { imdbId, title, year, poster, plot, director },
        update: { title, year, poster, plot, director },
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
        where: { date: { gte: new Date() }, hidden: false }
    })
    if (meeting !== null) {
        return meeting
    }

    // if there is no next meeting, get the last meeting
    return await prisma.meeting.findFirst({
        orderBy: { date: 'desc' },
        include: { film: true, scores: true },
        where: { hidden: false },
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


export const getScores = async (meetingId: number) => {
    return await prisma.score.findMany({
        where: { meetingId },
        orderBy: { clubber: 'desc' }
    })
}


export const getNumberOfScoresSubmitted = async (meetingId: number) => {
    const aggregation =  await prisma.score.aggregate({
        _count: { 
            id: true
        },
        where: { meetingId }
    })

    return aggregation._count.id
}


export const getShownScores = async (id: number) => {
    const meeting = await prisma.meeting.findUnique({
        where: { id, showScore: true },
        include: {
            scores: true
        }
    })

    if (!meeting) return []

    return meeting.scores
}


export const setShowScore = async (id: number) => {
    return await prisma.meeting.update({
        where: { id },
        data: { showScore: true }
    })
}