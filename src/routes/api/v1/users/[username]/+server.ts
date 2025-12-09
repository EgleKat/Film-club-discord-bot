import { toggleUserHidden, getUserProfile, setUserProfileImage } from "$lib/server/database";
import { envUsernames } from "$lib/server/password";
import { json, type RequestHandler } from "@sveltejs/kit";

export const PATCH: RequestHandler = async (event) => {
    const username = event.params.username;

    if (!username) {
        return json({ error: 'Username is required' }, { status: 400 });
    }

    const body = await event.request.json();
    const action = body.action as string;

    if (action === 'toggle-hidden') {
        // Check if user is in env var - if so, ensure they have a DB profile first
        if (envUsernames.includes(username)) {
            const existingProfile = await getUserProfile(username);
            if (!existingProfile) {
                // Create profile for env user before toggling
                await setUserProfileImage(username, null);
            }
        }

        try {
            const user = await toggleUserHidden(username);
            return json({ success: true, user });
        } catch (error) {
            return json({ error: `User ${username} not found` }, { status: 404 });
        }
    }

    return json({ error: 'Invalid action' }, { status: 400 });
}
