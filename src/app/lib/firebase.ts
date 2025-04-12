// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

/**
 * Upload a file to Firebase Storage
 * @param file File to upload
 * @param path Storage path for the file
 * @returns URL of the uploaded file
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  try {
    // Create a storage reference
    const storageRef = ref(storage, path);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // Get the download URL
    const url = await getDownloadURL(snapshot.ref);

    return url;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Failed to upload file");
  }
}

export { storage };
