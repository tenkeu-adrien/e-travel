import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./config";

export async function uploadFile(path: string, file: Blob | Uint8Array | ArrayBuffer) {
  if (!storage) throw new Error("Firebase Storage non configuré");
  const storageRef = ref(storage, path);
  const snap = await uploadBytes(storageRef, file);
  return getDownloadURL(snap.ref);
}

export async function uploadAgencyLogo(agencyId: string, file: Blob) {
  return uploadFile(`agencies/${agencyId}/logo.png`, file);
}
