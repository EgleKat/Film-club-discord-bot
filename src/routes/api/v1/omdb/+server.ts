import MovieSearch from "$lib/server/movie-search";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
    const query = await MovieSearch.queryOmdb(event.url.searchParams.toString());
    return json(query);
}