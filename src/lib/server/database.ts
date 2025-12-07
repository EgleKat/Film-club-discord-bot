import { PrismaClient } from "@prisma/client"
import type { Film, WatchListEntry } from "@prisma/client"

const prisma = new PrismaClient()

export const addFilm = async (
    imdbId: string,
    title: string,
    originalTitle: string,
    year: string,
    poster: string,
    plot: string,
    director: string,
    budget: number,
    runtime?: number | null,
    originalLanguage?: string | null,
    revenue?: bigint | null,
    tmdbVoteAverage?: number | null,
    genres?: string | null
) => {
    return await prisma.film.upsert({
        where: { imdbId },
        create: {
            imdbId,
            title,
            originalTitle,
            year,
            poster,
            plot,
            director,
            budget,
            runtime,
            originalLanguage,
            revenue,
            tmdbVoteAverage,
            genres
        },
        update: {
            title,
            originalTitle,
            year,
            poster,
            plot,
            director,
            budget,
            runtime,
            originalLanguage,
            revenue,
            tmdbVoteAverage,
            genres
        },
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

export const getCurrentTheme = async () => {
    return await prisma.theme.findFirst({
        orderBy: { createdAt: 'desc' },
    })
}

export const setCurrentTheme = async (name: string, endDate: Date) => {
    return await prisma.theme.create({
        data: { name, endDate },
    })
}

// ============ WRAPPED STATISTICS ============

export interface WrappedAward {
    title: string
    emoji: string
    winnerName: string
    winnerType: 'film' | 'clubber'
    film?: {
        title: string
        originalTitle: string
        year: string
        poster: string
        imdbId: string
    }
    statValue: string
    statLabel: string
    description: string
}

/**
 * Get all meetings with scores for the current year (excluding hidden)
 */
export const getWrappedMeetings = async (year: number) => {
    const startOfYear = new Date(year, 0, 1)
    const endOfYear = new Date(year + 1, 0, 1)

    return await prisma.meeting.findMany({
        where: {
            hidden: false,
            date: {
                gte: startOfYear,
                lt: endOfYear
            }
        },
        include: {
            film: true,
            scores: true
        },
        orderBy: { date: 'asc' }
    })
}

/**
 * Best Film Award - Film with highest average score
 */
export const getBestFilmAward = async (year: number): Promise<WrappedAward | null> => {
    const meetings = await getWrappedMeetings(year)

    if (meetings.length === 0) return null

    let bestFilm: typeof meetings[0] | null = null
    let bestAverage = -1

    for (const meeting of meetings) {
        if (meeting.scores.length === 0) continue

        const numericScores = meeting.scores
            .map(s => parseFloat(s.score))
            .filter(s => !isNaN(s))

        if (numericScores.length === 0) continue

        const average = numericScores.reduce((a, b) => a + b, 0) / numericScores.length

        if (average > bestAverage) {
            bestAverage = average
            bestFilm = meeting
        }
    }

    if (!bestFilm) return null

    return {
        title: "Best Film of the Year",
        emoji: "🏆",
        winnerName: bestFilm.film.title || bestFilm.film.originalTitle,
        winnerType: 'film',
        film: {
            title: bestFilm.film.title || bestFilm.film.originalTitle,
            originalTitle: bestFilm.film.originalTitle,
            year: bestFilm.film.year,
            poster: bestFilm.film.poster,
            imdbId: bestFilm.film.imdbId
        },
        statValue: bestAverage.toFixed(1),
        statLabel: "average score",
        description: `With an impressive average score of ${bestAverage.toFixed(1)}, this film captured the hearts of the club!`
    }
}

/**
 * Clubber's Favourite Film Award - Highest rated film by each clubber
 */
export const getClubberFavouriteAwards = async (year: number): Promise<WrappedAward[]> => {
    const meetings = await getWrappedMeetings(year)

    // Group scores by clubber
    const clubberScores: Map<string, Array<{ score: number, meeting: typeof meetings[0] }>> = new Map()

    for (const meeting of meetings) {
        for (const score of meeting.scores) {
            const numericScore = parseFloat(score.score)
            if (isNaN(numericScore)) continue

            if (!clubberScores.has(score.clubber)) {
                clubberScores.set(score.clubber, [])
            }
            clubberScores.get(score.clubber)!.push({ score: numericScore, meeting })
        }
    }

    const awards: WrappedAward[] = []

    for (const [clubber, scores] of clubberScores) {
        if (scores.length === 0) continue

        // Find highest score(s)
        const maxScore = Math.max(...scores.map(s => s.score))
        const favourites = scores.filter(s => s.score === maxScore)

        // Pick the first one if there are ties
        const favourite = favourites[0]

        awards.push({
            title: `${clubber}'s Favourite Film`,
            emoji: "❤️",
            winnerName: favourite.meeting.film.title || favourite.meeting.film.originalTitle,
            winnerType: 'film',
            film: {
                title: favourite.meeting.film.title || favourite.meeting.film.originalTitle,
                originalTitle: favourite.meeting.film.originalTitle,
                year: favourite.meeting.film.year,
                poster: favourite.meeting.film.poster,
                imdbId: favourite.meeting.film.imdbId
            },
            statValue: maxScore.toString(),
            statLabel: `${clubber}'s score`,
            description: `${clubber} gave this film their highest score of ${maxScore}!`
        })
    }

    return awards
}

/**
 * Best Host Award - Host whose films got highest average scores
 */
export const getBestHostAward = async (year: number): Promise<WrappedAward | null> => {
    const meetings = await getWrappedMeetings(year)

    // Group meetings by host
    const hostStats: Map<string, { totalScore: number, count: number, meetings: typeof meetings }> = new Map()

    for (const meeting of meetings) {
        if (meeting.scores.length === 0) continue

        const numericScores = meeting.scores
            .map(s => parseFloat(s.score))
            .filter(s => !isNaN(s))

        if (numericScores.length === 0) continue

        const average = numericScores.reduce((a, b) => a + b, 0) / numericScores.length

        if (!hostStats.has(meeting.host)) {
            hostStats.set(meeting.host, { totalScore: 0, count: 0, meetings: [] })
        }

        const stats = hostStats.get(meeting.host)!
        stats.totalScore += average
        stats.count += 1
        stats.meetings.push(meeting)
    }

    let bestHost: string | null = null
    let bestAverage = -1

    for (const [host, stats] of hostStats) {
        const average = stats.totalScore / stats.count
        if (average > bestAverage) {
            bestAverage = average
            bestHost = host
        }
    }

    if (!bestHost) return null

    const hostMeetings = hostStats.get(bestHost)!.meetings
    // Pick the best film they hosted
    let bestFilm = hostMeetings[0]
    let bestFilmScore = -1

    for (const meeting of hostMeetings) {
        const avg = meeting.scores
            .map(s => parseFloat(s.score))
            .filter(s => !isNaN(s))
            .reduce((a, b, _, arr) => a + b / arr.length, 0)

        if (avg > bestFilmScore) {
            bestFilmScore = avg
            bestFilm = meeting
        }
    }

    return {
        title: "Best Host",
        emoji: "🎬",
        winnerName: bestHost,
        winnerType: 'clubber',
        film: {
            title: bestFilm.film.title || bestFilm.film.originalTitle,
            originalTitle: bestFilm.film.originalTitle,
            year: bestFilm.film.year,
            poster: bestFilm.film.poster,
            imdbId: bestFilm.film.imdbId
        },
        statValue: bestAverage.toFixed(1),
        statLabel: "average score for their picks",
        description: `${bestHost}'s film picks averaged an impressive ${bestAverage.toFixed(1)}! Shown: their highest-rated pick.`
    }
}

/**
 * Most Controversial Film Award - Film with highest score variance
 */
export const getMostControversialFilmAward = async (year: number): Promise<WrappedAward | null> => {
    const meetings = await getWrappedMeetings(year)

    let mostControversial: typeof meetings[0] | null = null
    let highestVariance = -1

    for (const meeting of meetings) {
        const numericScores = meeting.scores
            .map(s => parseFloat(s.score))
            .filter(s => !isNaN(s))

        if (numericScores.length < 2) continue

        const mean = numericScores.reduce((a, b) => a + b, 0) / numericScores.length
        const variance = numericScores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / numericScores.length
        const stdDev = Math.sqrt(variance)

        if (stdDev > highestVariance) {
            highestVariance = stdDev
            mostControversial = meeting
        }
    }

    if (!mostControversial) return null

    const scores = mostControversial.scores
        .map(s => parseFloat(s.score))
        .filter(s => !isNaN(s))
    const minScore = Math.min(...scores)
    const maxScore = Math.max(...scores)

    return {
        title: "Most Controversial Film",
        emoji: "⚖️",
        winnerName: mostControversial.film.title || mostControversial.film.originalTitle,
        winnerType: 'film',
        film: {
            title: mostControversial.film.title || mostControversial.film.originalTitle,
            originalTitle: mostControversial.film.originalTitle,
            year: mostControversial.film.year,
            poster: mostControversial.film.poster,
            imdbId: mostControversial.film.imdbId
        },
        statValue: `${minScore} - ${maxScore}`,
        statLabel: "score range",
        description: `This film divided the club! Scores ranged from ${minScore} to ${maxScore}.`
    }
}

/**
 * Harshest Critic Award - Clubber with lowest average scores
 */
export const getHarshestCriticAward = async (year: number): Promise<WrappedAward | null> => {
    const meetings = await getWrappedMeetings(year)

    const clubberTotals: Map<string, { total: number, count: number, lowestMeeting: typeof meetings[0] | null, lowestScore: number }> = new Map()

    for (const meeting of meetings) {
        for (const score of meeting.scores) {
            const numericScore = parseFloat(score.score)
            if (isNaN(numericScore)) continue

            if (!clubberTotals.has(score.clubber)) {
                clubberTotals.set(score.clubber, { total: 0, count: 0, lowestMeeting: null, lowestScore: Infinity })
            }

            const stats = clubberTotals.get(score.clubber)!
            stats.total += numericScore
            stats.count += 1

            if (numericScore < stats.lowestScore) {
                stats.lowestScore = numericScore
                stats.lowestMeeting = meeting
            }
        }
    }

    let harshestCritic: string | null = null
    let lowestAverage = Infinity

    for (const [clubber, stats] of clubberTotals) {
        if (stats.count < 3) continue // Need at least 3 scores

        const average = stats.total / stats.count
        if (average < lowestAverage) {
            lowestAverage = average
            harshestCritic = clubber
        }
    }

    if (!harshestCritic) return null

    const stats = clubberTotals.get(harshestCritic)!
    const lowestFilm = stats.lowestMeeting!

    return {
        title: "Harshest Critic",
        emoji: "😈",
        winnerName: harshestCritic,
        winnerType: 'clubber',
        film: {
            title: lowestFilm.film.title || lowestFilm.film.originalTitle,
            originalTitle: lowestFilm.film.originalTitle,
            year: lowestFilm.film.year,
            poster: lowestFilm.film.poster,
            imdbId: lowestFilm.film.imdbId
        },
        statValue: lowestAverage.toFixed(1),
        statLabel: "average score given",
        description: `${harshestCritic} doesn't give out high scores easily! Their average was ${lowestAverage.toFixed(1)}. Shown: the film they rated lowest.`
    }
}

/**
 * Most Generous Scorer Award - Clubber with highest average scores
 */
export const getMostGenerousScorerAward = async (year: number): Promise<WrappedAward | null> => {
    const meetings = await getWrappedMeetings(year)

    const clubberTotals: Map<string, { total: number, count: number, highestMeeting: typeof meetings[0] | null, highestScore: number }> = new Map()

    for (const meeting of meetings) {
        for (const score of meeting.scores) {
            const numericScore = parseFloat(score.score)
            if (isNaN(numericScore)) continue

            if (!clubberTotals.has(score.clubber)) {
                clubberTotals.set(score.clubber, { total: 0, count: 0, highestMeeting: null, highestScore: -Infinity })
            }

            const stats = clubberTotals.get(score.clubber)!
            stats.total += numericScore
            stats.count += 1

            if (numericScore > stats.highestScore) {
                stats.highestScore = numericScore
                stats.highestMeeting = meeting
            }
        }
    }

    let mostGenerous: string | null = null
    let highestAverage = -Infinity

    for (const [clubber, stats] of clubberTotals) {
        if (stats.count < 3) continue // Need at least 3 scores

        const average = stats.total / stats.count
        if (average > highestAverage) {
            highestAverage = average
            mostGenerous = clubber
        }
    }

    if (!mostGenerous) return null

    const stats = clubberTotals.get(mostGenerous)!
    const highestFilm = stats.highestMeeting!

    return {
        title: "Most Generous Scorer",
        emoji: "💖",
        winnerName: mostGenerous,
        winnerType: 'clubber',
        film: {
            title: highestFilm.film.title || highestFilm.film.originalTitle,
            originalTitle: highestFilm.film.originalTitle,
            year: highestFilm.film.year,
            poster: highestFilm.film.poster,
            imdbId: highestFilm.film.imdbId
        },
        statValue: highestAverage.toFixed(1),
        statLabel: "average score given",
        description: `${mostGenerous} spreads the love! Their average score was ${highestAverage.toFixed(1)}. Shown: the film they rated highest.`
    }
}

/**
 * Best Taste Award - Clubber whose scores most closely match the group average
 */
export const getBestTasteAward = async (year: number): Promise<WrappedAward | null> => {
    const meetings = await getWrappedMeetings(year)

    // Calculate group average for each meeting
    const meetingAverages: Map<number, number> = new Map()

    for (const meeting of meetings) {
        const numericScores = meeting.scores
            .map(s => parseFloat(s.score))
            .filter(s => !isNaN(s))

        if (numericScores.length === 0) continue

        const average = numericScores.reduce((a, b) => a + b, 0) / numericScores.length
        meetingAverages.set(meeting.id, average)
    }

    // Calculate each clubber's deviation from group average
    const clubberDeviations: Map<string, { totalDeviation: number, count: number, closestMeeting: typeof meetings[0] | null, closestDeviation: number }> = new Map()

    for (const meeting of meetings) {
        const groupAvg = meetingAverages.get(meeting.id)
        if (groupAvg === undefined) continue

        for (const score of meeting.scores) {
            const numericScore = parseFloat(score.score)
            if (isNaN(numericScore)) continue

            const deviation = Math.abs(numericScore - groupAvg)

            if (!clubberDeviations.has(score.clubber)) {
                clubberDeviations.set(score.clubber, { totalDeviation: 0, count: 0, closestMeeting: null, closestDeviation: Infinity })
            }

            const stats = clubberDeviations.get(score.clubber)!
            stats.totalDeviation += deviation
            stats.count += 1

            if (deviation < stats.closestDeviation) {
                stats.closestDeviation = deviation
                stats.closestMeeting = meeting
            }
        }
    }

    let bestTaste: string | null = null
    let lowestDeviation = Infinity

    for (const [clubber, stats] of clubberDeviations) {
        if (stats.count < 3) continue

        const avgDeviation = stats.totalDeviation / stats.count
        if (avgDeviation < lowestDeviation) {
            lowestDeviation = avgDeviation
            bestTaste = clubber
        }
    }

    if (!bestTaste) return null

    const stats = clubberDeviations.get(bestTaste)!
    const closestFilm = stats.closestMeeting!

    return {
        title: "Best Taste",
        emoji: "🎯",
        winnerName: bestTaste,
        winnerType: 'clubber',
        film: {
            title: closestFilm.film.title || closestFilm.film.originalTitle,
            originalTitle: closestFilm.film.originalTitle,
            year: closestFilm.film.year,
            poster: closestFilm.film.poster,
            imdbId: closestFilm.film.imdbId
        },
        statValue: lowestDeviation.toFixed(2),
        statLabel: "average deviation from group",
        description: `${bestTaste} is perfectly in sync with the group! Their scores averaged only ${lowestDeviation.toFixed(2)} points from the group average.`
    }
}

// ============ ADDITIONAL AWARDS (require new TMDB data) ============

/**
 * Genre Champion Award - Most popular genre based on highest scores
 */
export const getGenreChampionAward = async (year: number): Promise<WrappedAward | null> => {
    const meetings = await getWrappedMeetings(year)

    // Count scores by genre
    const genreStats: Map<string, { totalScore: number, count: number, bestMeeting: typeof meetings[0] | null, bestScore: number }> = new Map()

    for (const meeting of meetings) {
        if (!meeting.film.genres) continue

        let genres: string[]
        try {
            genres = JSON.parse(meeting.film.genres)
        } catch {
            continue
        }

        const numericScores = meeting.scores
            .map(s => parseFloat(s.score))
            .filter(s => !isNaN(s))

        if (numericScores.length === 0) continue

        const avgScore = numericScores.reduce((a, b) => a + b, 0) / numericScores.length

        for (const genre of genres) {
            if (!genreStats.has(genre)) {
                genreStats.set(genre, { totalScore: 0, count: 0, bestMeeting: null, bestScore: -1 })
            }

            const stats = genreStats.get(genre)!
            stats.totalScore += avgScore
            stats.count += 1

            if (avgScore > stats.bestScore) {
                stats.bestScore = avgScore
                stats.bestMeeting = meeting
            }
        }
    }

    // Find genre with highest average score (minimum 2 films)
    let bestGenre: string | null = null
    let bestAverage = -1

    for (const [genre, stats] of genreStats) {
        if (stats.count < 2) continue

        const average = stats.totalScore / stats.count
        if (average > bestAverage) {
            bestAverage = average
            bestGenre = genre
        }
    }

    if (!bestGenre) return null

    const stats = genreStats.get(bestGenre)!
    const bestFilm = stats.bestMeeting!

    return {
        title: "Genre Champion",
        emoji: "🎭",
        winnerName: bestGenre,
        winnerType: 'film', // Using film type for display purposes
        film: {
            title: bestFilm.film.title || bestFilm.film.originalTitle,
            originalTitle: bestFilm.film.originalTitle,
            year: bestFilm.film.year,
            poster: bestFilm.film.poster,
            imdbId: bestFilm.film.imdbId
        },
        statValue: bestAverage.toFixed(1),
        statLabel: "average score",
        description: `${bestGenre} films were the club's favourite genre this year! Shown: the highest-rated ${bestGenre} film.`
    }
}

/**
 * Marathon Runner Award - Host who picked the longest films
 */
export const getMarathonRunnerAward = async (year: number): Promise<WrappedAward | null> => {
    const meetings = await getWrappedMeetings(year)

    // Calculate average runtime by host
    const hostStats: Map<string, { totalRuntime: number, count: number, longestMeeting: typeof meetings[0] | null, longestRuntime: number }> = new Map()

    for (const meeting of meetings) {
        if (!meeting.film.runtime) continue

        if (!hostStats.has(meeting.host)) {
            hostStats.set(meeting.host, { totalRuntime: 0, count: 0, longestMeeting: null, longestRuntime: 0 })
        }

        const stats = hostStats.get(meeting.host)!
        stats.totalRuntime += meeting.film.runtime
        stats.count += 1

        if (meeting.film.runtime > stats.longestRuntime) {
            stats.longestRuntime = meeting.film.runtime
            stats.longestMeeting = meeting
        }
    }

    let marathonRunner: string | null = null
    let highestAvgRuntime = -1

    for (const [host, stats] of hostStats) {
        if (stats.count < 2) continue

        const avgRuntime = stats.totalRuntime / stats.count
        if (avgRuntime > highestAvgRuntime) {
            highestAvgRuntime = avgRuntime
            marathonRunner = host
        }
    }

    if (!marathonRunner) return null

    const stats = hostStats.get(marathonRunner)!
    const longestFilm = stats.longestMeeting!

    const hours = Math.floor(highestAvgRuntime / 60)
    const minutes = Math.round(highestAvgRuntime % 60)
    const runtimeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

    return {
        title: "Marathon Runner",
        emoji: "⏱️",
        winnerName: marathonRunner,
        winnerType: 'clubber',
        film: {
            title: longestFilm.film.title || longestFilm.film.originalTitle,
            originalTitle: longestFilm.film.originalTitle,
            year: longestFilm.film.year,
            poster: longestFilm.film.poster,
            imdbId: longestFilm.film.imdbId
        },
        statValue: runtimeStr,
        statLabel: "average film length",
        description: `${marathonRunner} likes their films long! Their picks averaged ${runtimeStr}. Shown: their longest pick.`
    }
}

/**
 * World Cinema Award - Host who picked the most non-English films
 */
export const getWorldCinemaAward = async (year: number): Promise<WrappedAward | null> => {
    const meetings = await getWrappedMeetings(year)

    // Count non-English films by host
    const hostStats: Map<string, { nonEnglishCount: number, totalCount: number, bestNonEnglish: typeof meetings[0] | null, bestScore: number }> = new Map()

    for (const meeting of meetings) {
        if (!meeting.film.originalLanguage) continue

        if (!hostStats.has(meeting.host)) {
            hostStats.set(meeting.host, { nonEnglishCount: 0, totalCount: 0, bestNonEnglish: null, bestScore: -1 })
        }

        const stats = hostStats.get(meeting.host)!
        stats.totalCount += 1

        if (meeting.film.originalLanguage !== 'en') {
            stats.nonEnglishCount += 1

            const numericScores = meeting.scores
                .map(s => parseFloat(s.score))
                .filter(s => !isNaN(s))

            if (numericScores.length > 0) {
                const avgScore = numericScores.reduce((a, b) => a + b, 0) / numericScores.length
                if (avgScore > stats.bestScore) {
                    stats.bestScore = avgScore
                    stats.bestNonEnglish = meeting
                }
            } else if (!stats.bestNonEnglish) {
                stats.bestNonEnglish = meeting
            }
        }
    }

    let worldCinemaChamp: string | null = null
    let highestCount = 0

    for (const [host, stats] of hostStats) {
        if (stats.nonEnglishCount > highestCount) {
            highestCount = stats.nonEnglishCount
            worldCinemaChamp = host
        }
    }

    if (!worldCinemaChamp || highestCount === 0) return null

    const stats = hostStats.get(worldCinemaChamp)!
    const bestFilm = stats.bestNonEnglish!

    // Get language name
    const languageNames: Record<string, string> = {
        'ja': 'Japanese', 'ko': 'Korean', 'fr': 'French', 'es': 'Spanish',
        'de': 'German', 'it': 'Italian', 'zh': 'Chinese', 'hi': 'Hindi',
        'pt': 'Portuguese', 'ru': 'Russian', 'ar': 'Arabic', 'sv': 'Swedish',
        'da': 'Danish', 'no': 'Norwegian', 'fi': 'Finnish', 'pl': 'Polish'
    }
    const langCode = bestFilm.film.originalLanguage || ''
    const langName = languageNames[langCode] || langCode.toUpperCase()

    return {
        title: "World Cinema",
        emoji: "🌍",
        winnerName: worldCinemaChamp,
        winnerType: 'clubber',
        film: {
            title: bestFilm.film.title || bestFilm.film.originalTitle,
            originalTitle: bestFilm.film.originalTitle,
            year: bestFilm.film.year,
            poster: bestFilm.film.poster,
            imdbId: bestFilm.film.imdbId
        },
        statValue: `${highestCount}`,
        statLabel: "international films",
        description: `${worldCinemaChamp} brought global cinema to the club with ${highestCount} non-English films! Shown: their highest-rated pick (${langName}).`
    }
}

/**
 * Box Office Boss Award - Host whose films had the highest total revenue
 */
export const getBoxOfficeBossAward = async (year: number): Promise<WrappedAward | null> => {
    const meetings = await getWrappedMeetings(year)

    // Calculate total revenue by host
    const hostStats: Map<string, { totalRevenue: bigint, count: number, biggestHit: typeof meetings[0] | null, biggestRevenue: bigint }> = new Map()

    for (const meeting of meetings) {
        if (!meeting.film.revenue) continue

        if (!hostStats.has(meeting.host)) {
            hostStats.set(meeting.host, { totalRevenue: BigInt(0), count: 0, biggestHit: null, biggestRevenue: BigInt(0) })
        }

        const stats = hostStats.get(meeting.host)!
        stats.totalRevenue += meeting.film.revenue
        stats.count += 1

        if (meeting.film.revenue > stats.biggestRevenue) {
            stats.biggestRevenue = meeting.film.revenue
            stats.biggestHit = meeting
        }
    }

    let boxOfficeBoss: string | null = null
    let highestRevenue = BigInt(0)

    for (const [host, stats] of hostStats) {
        if (stats.count < 2) continue

        if (stats.totalRevenue > highestRevenue) {
            highestRevenue = stats.totalRevenue
            boxOfficeBoss = host
        }
    }

    if (!boxOfficeBoss) return null

    const stats = hostStats.get(boxOfficeBoss)!
    const biggestHit = stats.biggestHit!

    // Format revenue
    const formatRevenue = (rev: bigint) => {
        const num = Number(rev)
        if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`
        if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(0)}M`
        return `$${num.toLocaleString()}`
    }

    return {
        title: "Box Office Boss",
        emoji: "💰",
        winnerName: boxOfficeBoss,
        winnerType: 'clubber',
        film: {
            title: biggestHit.film.title || biggestHit.film.originalTitle,
            originalTitle: biggestHit.film.originalTitle,
            year: biggestHit.film.year,
            poster: biggestHit.film.poster,
            imdbId: biggestHit.film.imdbId
        },
        statValue: formatRevenue(highestRevenue),
        statLabel: "total box office",
        description: `${boxOfficeBoss}'s picks brought in ${formatRevenue(highestRevenue)} at the box office! Shown: their biggest hit.`
    }
}

/**
 * Hidden Gem Hunter Award - Clubber who rated films highest relative to TMDB rating
 */
export const getHiddenGemHunterAward = async (year: number): Promise<WrappedAward | null> => {
    const meetings = await getWrappedMeetings(year)

    // Calculate each clubber's "gem finding" ability
    const clubberStats: Map<string, { totalDiff: number, count: number, biggestGem: typeof meetings[0] | null, biggestDiff: number }> = new Map()

    for (const meeting of meetings) {
        if (!meeting.film.tmdbVoteAverage) continue

        for (const score of meeting.scores) {
            const numericScore = parseFloat(score.score)
            if (isNaN(numericScore)) continue

            // Calculate how much higher the clubber rated vs TMDB (normalized to 10 scale)
            const diff = numericScore - meeting.film.tmdbVoteAverage

            if (!clubberStats.has(score.clubber)) {
                clubberStats.set(score.clubber, { totalDiff: 0, count: 0, biggestGem: null, biggestDiff: -Infinity })
            }

            const stats = clubberStats.get(score.clubber)!
            stats.totalDiff += diff
            stats.count += 1

            // Track the film where they found the biggest "gem" (most underrated by public)
            if (diff > stats.biggestDiff) {
                stats.biggestDiff = diff
                stats.biggestGem = meeting
            }
        }
    }

    let gemHunter: string | null = null
    let highestAvgDiff = -Infinity

    for (const [clubber, stats] of clubberStats) {
        if (stats.count < 3) continue

        const avgDiff = stats.totalDiff / stats.count
        if (avgDiff > highestAvgDiff) {
            highestAvgDiff = avgDiff
            gemHunter = clubber
        }
    }

    if (!gemHunter || highestAvgDiff <= 0) return null

    const stats = clubberStats.get(gemHunter)!
    const biggestGem = stats.biggestGem!

    return {
        title: "Hidden Gem Hunter",
        emoji: "💎",
        winnerName: gemHunter,
        winnerType: 'clubber',
        film: {
            title: biggestGem.film.title || biggestGem.film.originalTitle,
            originalTitle: biggestGem.film.originalTitle,
            year: biggestGem.film.year,
            poster: biggestGem.film.poster,
            imdbId: biggestGem.film.imdbId
        },
        statValue: `+${highestAvgDiff.toFixed(1)}`,
        statLabel: "vs TMDB ratings",
        description: `${gemHunter} finds the hidden gems! On average, they rated films ${highestAvgDiff.toFixed(1)} points higher than the public. Shown: their biggest discovery.`
    }
}

/**
 * Get all wrapped awards for a year
 */
export const getAllWrappedAwards = async (year: number): Promise<WrappedAward[]> => {
    const awards: WrappedAward[] = []

    // Get all awards in parallel
    const [
        bestHost,
        controversial,
        harshest,
        generous,
        bestTaste,
        // Additional awards using new TMDB data
        genreChampion,
        marathonRunner,
        worldCinema,
        boxOfficeBoss,
        hiddenGemHunter,
        // These go last as requested
        bestFilm,
        clubberFavourites
    ] = await Promise.all([
        getBestHostAward(year),
        getMostControversialFilmAward(year),
        getHarshestCriticAward(year),
        getMostGenerousScorerAward(year),
        getBestTasteAward(year),
        // Additional awards
        getGenreChampionAward(year),
        getMarathonRunnerAward(year),
        getWorldCinemaAward(year),
        getBoxOfficeBossAward(year),
        getHiddenGemHunterAward(year),
        // These go last
        getBestFilmAward(year),
        getClubberFavouriteAwards(year)
    ])

    // Add awards in order (best film and favourites last as requested)
    if (bestHost) awards.push(bestHost)
    if (controversial) awards.push(controversial)
    if (harshest) awards.push(harshest)
    if (generous) awards.push(generous)
    if (bestTaste) awards.push(bestTaste)
    // Additional awards
    if (genreChampion) awards.push(genreChampion)
    if (marathonRunner) awards.push(marathonRunner)
    if (worldCinema) awards.push(worldCinema)
    if (boxOfficeBoss) awards.push(boxOfficeBoss)
    if (hiddenGemHunter) awards.push(hiddenGemHunter)
    // These go last as requested
    if (bestFilm) awards.push(bestFilm)
    awards.push(...clubberFavourites)

    return awards
}

// ============ TMDB DATA REFRESH ============

/**
 * Get all films in the database
 */
export const getAllFilms = async () => {
    return await prisma.film.findMany()
}

/**
 * Update a film's additional TMDB metadata
 */
export const updateFilmTmdbData = async (
    imdbId: string,
    data: {
        runtime?: number | null,
        originalLanguage?: string | null,
        revenue?: bigint | null,
        tmdbVoteAverage?: number | null,
        genres?: string | null
    }
) => {
    return await prisma.film.update({
        where: { imdbId },
        data
    })
}
