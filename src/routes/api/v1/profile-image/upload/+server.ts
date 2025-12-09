import { uploadFile, setUserProfileUploadedImage } from "$lib/server/database";
import { json, type RequestHandler } from "@sveltejs/kit";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const POST: RequestHandler = async (event) => {
    const username = event.locals.user.username;

    const formData = await event.request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
        return json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return json({ error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
        return json({ error: 'File too large. Maximum size is 5MB' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadedFile = await uploadFile(
        file.name,
        file.type,
        buffer,
        file.size
    );

    await setUserProfileUploadedImage(username, uploadedFile.id);

    return json({
        success: true,
        fileId: uploadedFile.id,
        fileUrl: `/api/v1/files/${uploadedFile.id}`
    });
}
