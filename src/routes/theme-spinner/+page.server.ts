import type { Actions } from './$types';
import { getCurrentTheme, setCurrentTheme } from "$lib/server/database"

export const load = async () => {
    const theme = await getCurrentTheme()
    return { theme }
}

export const actions = {
    setTheme: async ({ request }) => {
        const data = await request.formData();
        const themeName = data.get('theme') as string;
        const endDate = data.get('endDate') as string;

        if (!themeName || !endDate) {
            return { error: "Missing theme or end date" };
        }

        await setCurrentTheme(themeName, new Date(endDate));
        return { success: true };
    }
} satisfies Actions;
