import { Film, PrismaClient, WatchListEntry } from "@prisma/client"

const prisma = new PrismaClient()

export const addFilm = async (imdbId: string, title: string, originalTitle: string, year: string, poster: string, plot: string, director: string, budget: number) => {
    return await prisma.film.upsert({ 
        where: { imdbId },
        create: { imdbId, title, originalTitle, year, poster, plot, director, budget },
        update: { title, originalTitle, year, poster, plot, director, budget },
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

// excludes expired sessions
export const getValidSession = async (sessionId: string) => {
    // remove expired sessions
    await prisma.session.deleteMany({
        where: {
            expiryTime: { lte: new Date() },
        }
    })
    return await prisma.session.findUnique({
        where: { 
            expiryTime: { gt: new Date() },
            id: sessionId,
        }
    })
}

export const createSession = async (clubber: string) => {
    const now = new Date();
    const inOneYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    return await prisma.session.create({
        data: {
            clubber,
            expiryTime: inOneYear,
        },
    })
}

interface MergedWatchListEntry {
    id: number | null,
    film: Film,
    hidden: boolean,
    dateWatched: Date | null,
    scores: { clubber: string, score: string | null }[]
    isMeeting: boolean,
}

/**
 * @returns Watched & unwatched watch records of films
 */
export const getWatchList = async (clubber: string) => {
    const myWatchlist = await prisma.watchListEntry.findMany({
        where: { clubber },
        orderBy: { dateWatched: "desc" },
        include: { film: true }
    })
    // console.log(myWatchlist)

    const watchListFilms = myWatchlist.map(w => w.filmId)
    const otherWatchListEntriesWithMyFilms = await prisma.watchListEntry.findMany({
        where: { NOT: { clubber }, filmId: { in: watchListFilms } },
    })
    const meetingsIwasIn = await prisma.meeting.findMany({
        where: { scores: { some: { clubber } }, hidden: false },
        include: { scores: true, film: true }
    });
    const meetingsWithMyFilmsIWasNotIn = await prisma.meeting.findMany({
        where: { filmId: { in: watchListFilms }, hidden: false, NOT: { scores: { some: { clubber } } } },
        include: { scores: true }
    })
    let filmToScores: MergedWatchListEntry[] = meetingsIwasIn.map(meeting => ({
        id: null,
        film: meeting.film,
        hidden: false,
        dateWatched: meeting.date,
        scores: meeting.scores.map(score => ({
            clubber: score.clubber,
            score: score.score,
        })),
        isMeeting: true,
    }))
    filmToScores = filmToScores.concat(myWatchlist.map(watchListEntry => ({
        id: watchListEntry.id,
        film: watchListEntry.film,
        hidden: watchListEntry.hidden,
        dateWatched: watchListEntry.dateWatched,
        scores: [
            { clubber: watchListEntry.clubber, score: watchListEntry.score }
        ].concat(
            meetingsWithMyFilmsIWasNotIn.filter(
                meeting => meeting.filmId === watchListEntry.filmId
            ).flatMap(
                meeting => meeting.scores.map(score => ({clubber: score.clubber, score: score.score}))
            )
        ).concat(
            otherWatchListEntriesWithMyFilms.filter(
                otherWatchListEntry => otherWatchListEntry.filmId === watchListEntry.filmId
            ).map(
                watchListEntry => ({clubber: watchListEntry.clubber, score: watchListEntry.score})
            )
        ),
        isMeeting: false,
    })))
    return filmToScores;
}
export const addToWatchList = async (filmId: string, clubber: string, dateWatched?: Date, score?: string) => {
    return await prisma.watchListEntry.create({
        data: {
            filmId,
            dateWatched,
            clubber,
            score
        }
    })
}
export const watchAndReview = async (watchListEntryId: number, dateWatched: Date, score: string) => {
    return await prisma.watchListEntry.update({
        where: {  id: watchListEntryId },
        data: { dateWatched, score },
    })
}
export const toggleHiddenWatchListEntry = async (watchlistEntryId: number) => {
    const watchlistEntry = await prisma.watchListEntry.findUniqueOrThrow({
        where: { id: watchlistEntryId },
    })
    return await prisma.watchListEntry.update({
        where: { id: watchlistEntryId },
        data: { hidden: !watchlistEntry.hidden },
    })
}