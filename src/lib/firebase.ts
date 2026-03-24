// Barrel export — tüm Firebase modüllerini tek noktadan dışa aktar
export { auth, db, storage, default as app } from "./firebase/config";
export * from "./firebase/auth";
export * from "./firebase/firestore";
export * from "./firebase/storage";
