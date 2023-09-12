import { env } from '$env/dynamic/private'
import { building } from '$app/environment'

const password = env.FILM_CLUB_PASSWORD
if (!building && !password || password === "") {
    throw new Error("FILM_CLUB_PASSWORD should be set to a password")
}
export const usernames = env.FILM_CLUB_USERNAMES?.split(",") ?? []
if (!building && usernames.length === 0) {
    throw new Error("FILM_CLUB_USERNAMES should be set to a comma-separated list of usernames")
}

export const getUserData = (headers: Headers) => {
    const authHeader = headers.get("Authorization")
    if (!authHeader) return false
    const [authType, authValue] = authHeader.split(" ")
    if (authType !== "Basic") return false
    const [ username, password ] = atob(authValue).split(":")
    return {username, password}
}

export function verifyBasicAuth(username: string, passwordAttempt: string): boolean {
    return passwordAttempt === password && usernames.includes(username)
}