import { db } from "../../src/lib/firebase/config";
import { collection, getDocs, writeBatch, query, where } from "firebase/firestore";

/**
 * Migration: Add profileSetupCompleted and isStylistModeActive fields to existing users.
 * To run: You need to set up a node environment that can access the web project's firebase config.
 * For manual execution via Firebase Console or a dedicated script runner.
 */
async function migrateUsers() {
    console.log("Starting migration...");
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    const batch = writeBatch(db);
    let count = 0;

    snapshot.forEach((doc) => {
        const data = doc.data();
        const updates: any = {};
        
        if (data.profileSetupCompleted === undefined) {
            updates.profileSetupCompleted = true; // Existing users are assumed to have completed it
        }
        if (data.isStylistModeActive === undefined) {
            updates.isStylistModeActive = false;
        }

        if (Object.keys(updates).length > 0) {
            batch.update(doc.ref, updates);
            count++;
        }
    });

    if (count > 0) {
        await batch.commit();
        console.log(`Migration completed. Updated ${count} users.`);
    } else {
        console.log("No users needed migration.");
    }
}

// export { migrateUsers };
console.log("Migration script ready. Call migrateUsers() in your environment.");
