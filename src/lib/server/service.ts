import MovieSearch from './movie-search';
import { addFilm } from './database';

export async function findAndAddFilm(tmdbId: FormDataEntryValue) {
    const film = await MovieSearch.tmdbGetMovie(parseInt(tmdbId as string, 10));
    if (!film.imdb_id) {
        // if the film doesn't have an imdb id, fallback to tmdb id
        film.imdb_id = "tmdb_" + tmdbId;
    }
    const credits = await MovieSearch.tmdbGetMovieCredits(parseInt(tmdbId as string, 10));
    const directors = credits.crew.filter((cm) => cm.job === 'Director').map(cm => cm.original_name).join(', ');
    // set next film
    await addFilm(film.imdb_id, film.title, film.original_title, film.release_date.substring(0, 4), "https://image.tmdb.org/t/p/w500" + film.poster_path, film.overview, directors, film.budget);
    return film;
}