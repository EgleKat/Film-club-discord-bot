import { Prisma, PrismaClient } from "@prisma/client"
import { update } from "lodash"

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
export type Meeting = {
    film: {
        imdbId: string;
        title: string;
        year: number;
        poster: string;
        plot: string;
    };
    id: number;
    date: Date;
    filmId: string;
    host: string;
}