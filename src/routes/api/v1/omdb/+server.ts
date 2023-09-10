import { env } from "$env/dynamic/private";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
    if (env.OMDB_API_KEY === undefined) throw new Error("OMDB_API_KEY is not defined");
    const query = await fetch(`https://www.omdbapi.com/?apikey=${env.OMDB_API_KEY}&${event.url.searchParams.toString()}`);
    return json(await query.json());
}