/**
 * Seed Script — Vesto AI
 * Firestore'a örnek kullanıcı ve stilist verisi ekler.
 *
 * Çalıştırmak için:
 *   npx tsx scripts/seedUsers.ts
 *
 * Gereklilik:
 *   npm install -D tsx
 *   .env.local dosyasında Firebase bilgileri dolu olmalı
 */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { join } from "path";

// Service account JSON dosyasını oku
const serviceAccountPath = join(process.cwd(), "vesto-ai-a7ad6-firebase-adminsdk-fbsvc-5c7904ea0c.json");
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
    });
}

const db = getFirestore();
db.settings({
    ignoreUndefinedProperties: true,
    preferRest: true,
});

// ── Stilistler ────────────────────────────────────────────────────────────────
const STYLISTS = [
    {
        uid: "stylist_001",
        email: "sophie.laurent@vesto.ai",
        displayName: "Sophie Laurent",
        role: "stylist",
        status: "active",
        bio: "Lüks moda ve minimalist estetik uzmanı.",
        location: "Paris, France",
        wardrobeCount: 94,
        outfitCount: 47,
        followersCount: 1240,
        followingCount: 83,
        lastActive: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 dk önce
        createdAt: new Date("2025-01-15").toISOString(),
    },
    {
        uid: "stylist_002",
        email: "elena.volkov@vesto.ai",
        displayName: "Elena Volkov",
        role: "stylist",
        status: "active",
        bio: "Avant-garde ve sokak modası küratörü.",
        location: "Milan, Italy",
        wardrobeCount: 112,
        outfitCount: 83,
        followersCount: 2100,
        followingCount: 145,
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 saat önce
        createdAt: new Date("2025-02-03").toISOString(),
    },
];

// ── Kullanıcılar ──────────────────────────────────────────────────────────────
const USERS = [
    {
        uid: "user_001",
        email: "marcus.chen@example.com",
        displayName: "Marcus Chen",
        role: "user",
        status: "active",
        location: "İstanbul, Türkiye",
        assignedStylistId: "stylist_001",
        wardrobeCount: 34,
        outfitCount: 12,
        followersCount: 45,
        followingCount: 120,
        stylePreferences: ["casual", "business"],
        lastActive: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        createdAt: new Date("2025-03-01").toISOString(),
    },
    {
        uid: "user_002",
        email: "amara.osei@example.com",
        displayName: "Amara Osei",
        role: "user",
        status: "active",
        location: "Ankara, Türkiye",
        assignedStylistId: "stylist_001",
        wardrobeCount: 67,
        outfitCount: 28,
        followersCount: 210,
        followingCount: 88,
        stylePreferences: ["formal", "evening"],
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        createdAt: new Date("2025-03-10").toISOString(),
    },
    {
        uid: "user_003",
        email: "james.park@example.com",
        displayName: "James Park",
        role: "user",
        status: "active",
        location: "İzmir, Türkiye",
        assignedStylistId: "stylist_001",
        wardrobeCount: 21,
        outfitCount: 5,
        followersCount: 12,
        followingCount: 34,
        stylePreferences: ["sporty", "casual"],
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        createdAt: new Date("2025-03-18").toISOString(),
    },
    {
        uid: "user_004",
        email: "lina.martinez@example.com",
        displayName: "Lina Martinez",
        role: "user",
        status: "active",
        location: "Bursa, Türkiye",
        assignedStylistId: "stylist_002",
        wardrobeCount: 89,
        outfitCount: 41,
        followersCount: 330,
        followingCount: 60,
        stylePreferences: ["formal", "business"],
        lastActive: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        createdAt: new Date("2025-02-20").toISOString(),
    },
    {
        uid: "user_005",
        email: "kenji.nakamura@example.com",
        displayName: "Kenji Nakamura",
        role: "user",
        status: "active",
        location: "İstanbul, Türkiye",
        assignedStylistId: "stylist_002",
        wardrobeCount: 55,
        outfitCount: 19,
        followersCount: 88,
        followingCount: 200,
        stylePreferences: ["casual", "sporty"],
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        createdAt: new Date("2025-02-28").toISOString(),
    },
    {
        uid: "user_006",
        email: "chloe.dubois@example.com",
        displayName: "Chloe Dubois",
        role: "user",
        status: "suspended",
        location: "Ankara, Türkiye",
        assignedStylistId: "stylist_002",
        wardrobeCount: 14,
        outfitCount: 3,
        followersCount: 7,
        followingCount: 15,
        stylePreferences: ["evening"],
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        createdAt: new Date("2025-03-05").toISOString(),
    },
    {
        uid: "user_007",
        email: "ali.yilmaz@example.com",
        displayName: "Ali Yılmaz",
        role: "user",
        status: "active",
        location: "İstanbul, Türkiye",
        wardrobeCount: 42,
        outfitCount: 17,
        followersCount: 95,
        followingCount: 110,
        stylePreferences: ["casual", "business"],
        lastActive: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        createdAt: new Date("2025-03-22").toISOString(),
    },
    {
        uid: "user_008",
        email: "fatma.kaya@example.com",
        displayName: "Fatma Kaya",
        role: "user",
        status: "active",
        location: "İzmir, Türkiye",
        wardrobeCount: 78,
        outfitCount: 33,
        followersCount: 450,
        followingCount: 72,
        stylePreferences: ["formal", "evening", "casual"],
        lastActive: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        createdAt: new Date("2025-01-30").toISOString(),
    },
    // Admin
    {
        uid: "admin_001",
        email: "admin@vesto.ai",
        displayName: "Vesto Admin",
        role: "admin",
        status: "active",
        location: "İstanbul, Türkiye",
        wardrobeCount: 0,
        outfitCount: 0,
        followersCount: 0,
        followingCount: 0,
        lastActive: new Date().toISOString(),
        createdAt: new Date("2025-01-01").toISOString(),
    },
];

async function seed() {
    console.log("🌱 Seed başlıyor...\n");

    const allUsers = [...STYLISTS, ...USERS];

    for (const user of allUsers) {
        await db.collection("users").doc(user.uid).set(user);
        console.log(`✅ ${user.role.toUpperCase().padEnd(7)} → ${user.displayName}`);
    }

    console.log(`\n✨ Toplam ${allUsers.length} kullanıcı eklendi.`);
}

seed().catch((err) => {
    console.error("❌ Seed hatası:", err);
    process.exit(1);
});
