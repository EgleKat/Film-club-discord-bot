import { env } from "$env/dynamic/private"

async function query<T>(params: string): Promise<T> {
    if (env.OMDB_API_KEY === undefined) throw new Error("OMDB_API_KEY is not defined")
    const result = fetch(`https://www.omdbapi.com/?apikey=${env.OMDB_API_KEY}&${params}`)
    return (await result).json()
}

export default {query}