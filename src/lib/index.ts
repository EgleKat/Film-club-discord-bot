export function getTitleWithOriginalTitle(film: { title: string | null; originalTitle: string; }): string {
    if(film.title === film.originalTitle) return film.originalTitle;
    else if(film.title !== null) return `${film.originalTitle} (${film.title})`;
    else return film.originalTitle;
}