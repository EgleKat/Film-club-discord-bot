import { getAllUserProfiles, createUserProfile, getUserProfile, setUserProfileImage } from "$lib/server/database";
import { envUsernames } from "$lib/server/password";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () => {
    // Get users from database
    const dbUsers = await getAllUserProfiles();

    // Get usernames from env var that might not be in database yet
    const dbUsernames = new Set(dbUsers.map(u => u.username));
    const envOnlyUsers = envUsernames.filter(username => !dbUsernames.has(username));

    // Combine: env-only users with null imageUrl and hidden=false, plus all DB users
    const allUsers = [
        ...envOnlyUsers.map(username => ({
            username,
            imageUrl: null,
            hidden: false,
            updatedAt: null
        })),
        ...dbUsers.map(u => ({
            username: u.username,
            imageUrl: u.imageUrl,
            hidden: u.hidden,
            updatedAt: u.updatedAt
        }))
    ].sort((a, b) => a.username.localeCompare(b.username));

    return json({ users: allUsers });
}

export const POST: RequestHandler = async (event) => {
    const body = await event.request.json();
    const username = body.username as string;
    const imageUrl = body.imageUrl as string | null | undefined;

    if (!username || username.trim() === '') {
        return json({ error: 'Username is required' }, { status: 400 });
    }

    const trimmedUsername = username.trim().toLowerCase();

    // Check if user already exists in env var
    if (envUsernames.includes(trimmedUsername)) {
        // User exists in env, just ensure they have a profile in DB
        await setUserProfileImage(trimmedUsername, imageUrl ?? null);
        return json({ success: true, message: 'User profile updated' });
    }

    // Check if user already exists in database
    const existingUser = await getUserProfile(trimmedUsername);
    if (existingUser) {
        return json({ error: 'User already exists' }, { status: 400 });
    }

    // Create new user
    const newUser = await createUserProfile(trimmedUsername, imageUrl);

    return json({ success: true, user: newUser });
}
