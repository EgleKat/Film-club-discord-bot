import MovieSearch from "$lib/server/movie-search";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
    const response = await MovieSearch.tmdbSearch(event.url.searchParams.toString());
    return json(response);
}