import * as db from '$lib/server/database'

export async function load({ params }) {
	
    console.log("test")
	// API request to get films here
    const films = await db.getFilms()

	return {films}
}

export const actions = {
    get: async (event) => {
        return await db.getFilms()
    },
    create: async ({ request }) => {
        const data = await request.formData()
        const title = data.get('title')
        const description = data.get('description')

        if (!title) {
            return { success: false, message: "No title specified"}
        } 
        if (title instanceof File) {
            return { success: false, message: "Title has incorrect file type"}
        }
        if (description instanceof File) {
            return { 
                success: false, 
                message: "Description has incorrect file type"
            }
        }

        const film = await db.createFilm(title, description)

        return { success: true, film }
    }
}
