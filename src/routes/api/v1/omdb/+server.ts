import omdb from "$lib/server/omdb"
import { json, type RequestHandler } from "@sveltejs/kit"

export const GET: RequestHandler = async (event) => {
    const query = await omdb.query(event.url.searchParams.toString())
    return json(query)
}