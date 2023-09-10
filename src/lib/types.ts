// please change all of these whenever and however
// as the data may not make sense when shaped this way
// in the future
export interface Score {
    clubber: string,
    // you're probably thinking scores should be a number
    // except that sometimes the clubber wants to put something like
    // 2 (8) to indicate that by some metrics they score 8 and some 2
    // so we make this a free text field
    score: string,
}

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
        imdbId: string;
        title: string;
        year: number;
        poster: string;
        plot: string;
    };
    id: number;
    date: Date;
    filmId: string;
    host: string;
}