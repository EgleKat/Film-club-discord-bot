export function getTitleWithOriginalTitle(film: { title: string | null; originalTitle: string; }): string {
    if(film.title !== null && film.title !== film.originalTitle){
        return `${film.originalTitle} (${film.title})`;
    } 
    return film.originalTitle;
}