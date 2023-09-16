export interface OmdbFilm {
    Title: string,
    Year: string,
    imdbID: string,
    Poster: string,
}

export interface OmdbFilmWithPlot extends OmdbFilm {
    Plot: string,
}

export interface TmdbFilm {
    original_title: string,
    release_date: string,
    id: number,
    poster_path: string,
    overview: string,
}

export interface TmdbFilmWithExtras extends TmdbFilm {
    imdb_id: string,
}

export type Meeting = {
    film: {
        imdbId: string
        title: string
        year: number
        poster: string
        plot: string
    }
    id: number
    date: Date
    filmId: string
    host: string
    scores: Score[]
    hidden: boolean
}

export type Score = {
    clubber: string
    score: string
    meetingId: number
}
