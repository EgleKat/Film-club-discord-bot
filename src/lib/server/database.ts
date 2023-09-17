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
        update: { filmId, host },
    })
}

export const getCurrentMeeting = async () => {
    return await prisma.meeting.findFirst({
        orderBy: { date: 'desc' },
        include: { film: true },
    })
}


export const createScore = async (meetingId: number, clubber: string, score: string) => {
    return prisma.score.upsert({
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


export const getShownScores = async (id: number) => {
    const meeting = await prisma.meeting.findUnique({
        where: { id, showScore: true },
        include: {
            score: true
        }
    })

    if (!meeting) return []

    return meeting.score
}


export const setShowScore = async (id: number) => {
    return await prisma.meeting.update({
        where: { id },
        data: { showScore: true }
    })
}