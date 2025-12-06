export function getTitleWithOriginalTitle(film: { title?: string | null, originalTitle: string, year?: string }): string {
    if(film.title !== null && film.title !== undefined && film.title !== film.originalTitle){
        return `${film.originalTitle} (${film.title})${film.year ? ` (${film.year})` : ''}`;
    }
    return `${film.originalTitle}${film.year ? ` (${film.year})` : ''}`;
}
