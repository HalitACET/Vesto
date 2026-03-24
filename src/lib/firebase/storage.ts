import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./config";

/**
 * Upload an image file to Firebase Storage and return its public download URL.
 * @param file - The file to upload
 * @param path - Storage path, e.g. "wardrobe/{userId}/{filename}"
 */
export async function uploadImage(file: File, path: string): Promise<string> {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
}

/**
 * Upload a wardrobe item image for a specific user.
 */
export async function uploadWardrobeImage(
    userId: string,
    file: File
): Promise<string> {
    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `${Date.now()}.${ext}`;
    return uploadImage(file, `wardrobe/${userId}/${filename}`);
}
