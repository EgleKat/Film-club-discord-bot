import { getUploadedFile } from "$lib/server/database";
import { error, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params }) => {
    const { id } = params;

    if (!id) {
        throw error(400, 'File ID is required');
    }

    const file = await getUploadedFile(id);

    if (!file) {
        throw error(404, 'File not found');
    }

    return new Response(file.data, {
        headers: {
            'Content-Type': file.mimeType,
            'Content-Length': file.size.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable'
        }
    });
}
