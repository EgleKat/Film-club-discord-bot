import { env } from '$env/dynamic/private'
import { building } from '$app/environment'
import type { Handle, RequestEvent } from '@sveltejs/kit'
import { createSession, getValidSession, getVisibleUsernames, getUserProfile } from './database'

const password = env.FILM_CLUB_PASSWORD
if (!building && !password || password === "") {
    throw new Error("FILM_CLUB_PASSWORD should be set to a password")
}
// Usernames from environment variable (legacy support)
export const envUsernames = env.FILM_CLUB_USERNAMES?.split(",") ?? []

/**
 * Check if a username is valid (exists in env var or database and is not hidden)
 */
export const isValidUsername = async (username: string): Promise<boolean> => {
    // First check env var (for backward compatibility)
    if (envUsernames.includes(username)) {
        return true
    }
    // Then check database
    const profile = await getUserProfile(username)
    return profile !== null && !profile.hidden
}

async function successfulLogin(event: RequestEvent, resolve: any, username: string, shouldCreateSession: boolean) {
    event.locals.user = { username }
    if (shouldCreateSession) {
        const session = await createSession(username)
        event.cookies.set("sessionId", session.id, {
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
            // Svelte sets these automatically but does clever stuff to make it work on localhost too:
            // httpOnly: true,
            // secure: true,
        });
    }
    return resolve(event)
}

// Public paths that don't require authentication
const publicPaths = [
    '/api/v1/calendar/feed.ics'
]

export const authenticate: Handle = async ({ event, resolve }) => {
    // Allow public paths without authentication
    if (publicPaths.some(path => event.url.pathname === path)) {
        event.locals.user = { username: 'anonymous' }
        return resolve(event)
    }

    const sessionId = event.cookies.get("sessionId")
    const authHeader = event.request.headers.get("Authorization")
    // either login with basic auth, or if the user logged in within the last year, a session ID cookie
    if (sessionId) {
        console.log("Got session id", sessionId)
        const session = await getValidSession(sessionId)
        if (session) {
            console.log("Found session for user", session.clubber)
            return await successfulLogin(event, resolve, session.clubber, false)
        }
    }
    if (authHeader) {
        const [authType, authValue] = authHeader.split(" ")
        if (authType === "Basic") {
            const [ username, passwordAttempt ] = atob(authValue).split(":")
            if (passwordAttempt === password && await isValidUsername(username)) {
                return await successfulLogin(event, resolve, username, true)
            }
        }
    }
    console.log("unauthorized")
    return new Response("Not authorized", {
        status: 401,
        headers: {
            "WWW-Authenticate": 'Basic realm="User Visible Realm", charset="UTF-8"',
        },
    })

    
}
