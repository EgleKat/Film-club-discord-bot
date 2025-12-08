import { setUserProfileImage } from "$lib/server/database";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async (event) => {
    const username = event.locals.user.username;
    const body = await event.request.json();
    const imageUrl = body.imageUrl as string | null;

    await setUserProfileImage(username, imageUrl);

    return json({ success: true });
}
