import type { Film } from '@prisma/client';

export function getTitleWithOriginalTitle(film: Film): string {
    if(film.title && film.title !== film.originalTitle){
        return `${film.originalTitle} (${film.title}) (${film.year})`;
    } 
    return `${film.originalTitle} (${film.year})`;
}