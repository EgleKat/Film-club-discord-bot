import { authenticate } from "$lib/server/password"
import type { Handle } from "@sveltejs/kit"

export const handle: Handle = authenticate;