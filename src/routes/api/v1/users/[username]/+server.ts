import { toggleUserHidden, getUserProfile, setUserProfileImage, setUserPassword, resetUserPassword } from "$lib/server/database";
import { envUsernames, isValidPassword } from "$lib/server/password";
import { json, type RequestHandler } from "@sveltejs/kit";

export const PATCH: RequestHandler = async (event) => {
    const username = event.params.username;
    const currentUser = event.locals.user?.username;

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

    if (action === 'change-password') {
        // Users can only change their own password
        if (username !== currentUser) {
            return json({ error: 'You can only change your own password' }, { status: 403 });
        }

        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return json({ error: 'Current password and new password are required' }, { status: 400 });
        }

        if (newPassword.length < 4) {
            return json({ error: 'Password must be at least 4 characters' }, { status: 400 });
        }

        // Verify current password
        const isValid = await isValidPassword(username, currentPassword);
        if (!isValid) {
            return json({ error: 'Current password is incorrect' }, { status: 401 });
        }

        try {
            await setUserPassword(username, newPassword);
            return json({ success: true, message: 'Password changed successfully' });
        } catch (error) {
            return json({ error: 'Failed to change password' }, { status: 500 });
        }
    }

    if (action === 'reset-password') {
        // Reset password to use global password
        // Check if user is in env var - if so, ensure they have a DB profile first
        if (envUsernames.includes(username)) {
            const existingProfile = await getUserProfile(username);
            if (!existingProfile) {
                await setUserProfileImage(username, null);
            }
        }

        try {
            await resetUserPassword(username);
            return json({ success: true, message: 'Password reset to default' });
        } catch (error) {
            return json({ error: 'Failed to reset password' }, { status: 500 });
        }
    }

    return json({ error: 'Invalid action' }, { status: 400 });
}
