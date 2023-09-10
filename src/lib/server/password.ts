import { env } from '$env/dynamic/private';

const password = env.FILM_CLUB_PASSWORD;
if (!password || password === "") {
    throw new Error("FILM_CLUB_PASSWORD should be set to a password");
}
export const usernames = env.FILM_CLUB_USERNAMES?.split(",") ?? [];
if (usernames.length === 0) {
    throw new Error("FILM_CLUB_USERNAMES should be set to a comma-separated list of usernames");
}

export function verifyBasicAuth(headers: Headers): boolean {
    const authHeader = headers.get("Authorization");
    if (!authHeader) return false;
    const [authType, authValue] = authHeader.split(" ");
    if (authType !== "Basic") return false;
    const [username, passwordAttempt] = atob(authValue).split(":");
    return passwordAttempt === password && usernames.includes(username);
}