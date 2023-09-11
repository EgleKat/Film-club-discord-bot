export interface OmdbFilm {
    Title: string,
    Year: string,
    imdbID: string,
    Poster: string,
}

export interface OmdbFilmWithPlot extends OmdbFilm {
    Plot: string,
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
}

export type Score = {
    clubber: string
    score: string
    meetingId: number
}
