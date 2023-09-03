import { verifyBasicAuth } from "$lib/password";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
    if (!verifyBasicAuth(event.request.headers)) {
        return new Response("Not authorized", {
            status: 401,
            headers: {
                "WWW-Authenticate": 'Basic realm="User Visible Realm", charset="UTF-8"',
            },
        });
    }

    return resolve(event);
};
