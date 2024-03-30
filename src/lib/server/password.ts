import { env } from '$env/dynamic/private'
import { building } from '$app/environment'
import type { Handle, RequestEvent } from '@sveltejs/kit'
import { createSession, getValidSession } from './database'

const password = env.FILM_CLUB_PASSWORD
if (!building && !password || password === "") {
    throw new Error("FILM_CLUB_PASSWORD should be set to a password")
}
export const usernames = env.FILM_CLUB_USERNAMES?.split(",") ?? []
if (!building && usernames.length === 0) {
    throw new Error("FILM_CLUB_USERNAMES should be set to a comma-separated list of usernames")
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

export const authenticate: Handle = async ({ event, resolve }) => {
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
            if (passwordAttempt === password && usernames.includes(username)) {
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
