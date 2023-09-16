import { verifyBasicAuth, getUserData } from "$lib/server/password"
import type { Handle, HandleServerError } from "@sveltejs/kit"

export const handle: Handle = async ({ event, resolve }) => {
    const auth = getUserData(event.request.headers)
    if (!auth || !verifyBasicAuth(auth.username, auth.password)) {
        console.log("unauthorized")
        return new Response("Not authorized", {
            status: 401,
            headers: {
                "WWW-Authenticate": 'Basic realm="User Visible Realm", charset="UTF-8"',
            },
        })
    }


    event.locals.user = {
        username: auth.username
    }
    return resolve(event)
}

export const handleError: HandleServerError = ({ error, event }) => {
	return {
		message: JSON.stringify(error),
		code: (error as any)?.code,
	};
};