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
export interface CrewMember {
    adult :boolean,
    gender : number,
    id : number,
    known_for_department :string,
    name :string,
    original_name :string,
    popularity :number,
    profile_path :string,
    credit_id :string,
    department :string,
    job :string,
}
export interface TmdbFilmWithExtras extends TmdbFilm {
    imdb_id: string,
}
export interface TmdbFilmCredits {
    crew: CrewMember[],
}

export type Meeting = {
    film: {
        imdbId: string
        title: string
        year: number
        poster: string
        plot: string,
        director: string
    }
    id: number
    date: Date
    filmId: string
    host: string
    scores: Score[]
    showScore: boolean
    hidden: boolean
}

export type Score = {
    clubber: string
    score: string
    meetingId: number
}
