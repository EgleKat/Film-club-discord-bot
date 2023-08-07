import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const getFilms = async () => await prisma.film.findMany()

export const createFilm = async (title: string, description?: string | null) => {
    return await prisma.film.create({ 
        data: { title, description }
    })
}