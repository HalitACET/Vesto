# CLAUDE.md — Vesto Web

> Önce kök dizindeki `../CLAUDE.md`'yi oku (ürün hedefi, repo düzeni, veri sözleşmesi, doğrulama komutları, güncel faz durumu). Next.js sürüm uyarısı için `AGENTS.md`'ye bak.
> Bu dosya, Vesto web tarafının (admin/stilist paneli) kalıcı bağlamını içerir.

---

## 🎯 Web Tarafının Amacı

Web tarafı **son kullanıcı için değil**, üç farklı role hizmet eder:

1. **Admin** — Platform yönetimi, kullanıcı kontrolü, AI etiket onayı, içerik moderasyonu, global istatistikler
2. **Verified Stylist** — Müşterilerin dolaplarına bakma, profesyonel kombin önerme, danışmanlık
3. **Authenticated User** — Kendi gardırobuna geniş ekran erişim (mobile alternatifi)

**Felsefe:** Geniş ekran üretkenlik aracı. Mobil "tüketim ve yaratım", web "yönetim ve profesyonel iş".

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| **Framework** | Next.js 16.2 (App Router) + React 19.2 |
| **Dil** | TypeScript 5 (strict mode) |
| **UI Library** | Shadcn/ui + base-ui/react |
| **Styling** | Tailwind CSS v4 |
| **State** | React + Server Actions |
| **Drag & Drop** | @dnd-kit/core, @dnd-kit/sortable |
| **Animation** | framer-motion |
| **Icons** | lucide-react |
| **Charts** | recharts 3 |
| **Backend** | Firebase Admin SDK 13 (server) + Firebase JS SDK 12 (auth) |
| **i18n** | next-intl 4 (Türkçe default + İngilizce) |
| **E2E Test** | Playwright |
| **Hosting** | Vercel (planlanan) |

---

## 📁 Klasör Yapısı

```
/web
├── messages/                       # i18n çeviri dosyaları
│   ├── tr.json                     # Türkçe (default)
│   └── en.json                     # İngilizce
├── src/
│   ├── app/
│   │   ├── [locale]/               # Locale-prefixed routes
│   │   │   ├── (auth)/             # Login, register
│   │   │   ├── admin/              # Admin paneli
│   │   │   │   └── page.tsx        # Users, AI Validation, Forum Moderation tabs
│   │   │   ├── dashboard/          # Stilist/kullanıcı paneli
│   │   │   │   ├── canvas/         # Kombin editörü (Stylist Canvas)
│   │   │   │   ├── clients/[id]/   # Stilistin müşterileri
│   │   │   │   ├── community/      # Forum feed
│   │   │   │   ├── outfits/        # Hava bazlı öneriler
│   │   │   │   └── wardrobe/       # Gardırop
│   │   │   └── page.tsx            # Landing
│   │   ├── actions/                # Server Actions
│   │   │   ├── adminActions.ts     # AI tag approve/reject/correct
│   │   │   └── outfitActions.ts    # createOutfit, updateOutfit
│   │   └── api/
│   │       └── auth/session/       # Token-based session management
│   ├── components/
│   │   ├── ui/                     # Shadcn components (14 adet)
│   │   └── layout/                 # DashboardLayout, Sidebar, Navbar
│   ├── lib/firebase/
│   │   ├── admin.ts                # Admin SDK init (env variables)
│   │   ├── auth.ts                 # Client auth helpers
│   │   ├── firestore.ts
│   │   ├── serverAuth.ts           # getServerSession, requireRole
│   │   └── storage.ts
│   ├── hooks/                      # useAuth, useWardrobe, useWeather
│   ├── services/                   # userService, wardrobeService, outfitService
│   ├── types/index.ts              # Tüm TypeScript tipleri
│   ├── i18n/                       # next-intl config
│   │   ├── routing.ts
│   │   ├── request.ts
│   │   └── navigation.ts
│   └── middleware.ts               # Auth + locale handling
├── .env.local                      # ❌ ASLA git'e gitmemeli
├── .env.local.example              # Public template
└── package.json
```

---

## 🎨 Tasarım Sistemi

**Felsefe:** Lüks moda dergisi estetiği (Vogue/Harper's Bazaar).

**Renk paleti:**
- Siyah / beyaz / krem (warm white)
- Aksent: altın tonu (sparingly)
- Hiçbir parlak renk (mavi, kırmızı, yeşil) yok

**Tipografi:**
- Başlıklar: Cormorant Garamond (serif)
- Body: Inter (sans-serif)

**Whitespace:** Agresif (16-24-32px padding standart)

**Component Library:** Shadcn/ui (14 component kurulu: avatar, badge, button, card, dialog, dropdown-menu, input, label, separator, sheet, skeleton, table, tabs, tooltip)

---

## 🔐 Auth & Security

**Auth Flow:**
1. Login → Firebase Client SDK ile email/password
2. Client'tan ID token al → POST `/api/auth/session`
3. Server: token doğrula (Admin SDK) → Firestore'dan role çek → HTTP-only cookie set et
4. Middleware her request'te cookie'yi parse eder, role-based route protection yapar

**Kritik güvenlik kararları:**
- Admin SDK private key **env variable'larda** (`FIREBASE_ADMIN_*`) — JSON dosyası YOK
- Cookie **HTTP-only** (XSS koruması)
- Cookie'deki role bilgisine **güvenilmez** — her request'te Firestore'dan gerçek role çekilir
- Tüm mutation'lar Server Actions üzerinden — client direkt Firestore'a yazmaz
- `requireRole('admin')`, `requireRole('verified_stylist')` helper'ları ile yetki kontrolü

**Route Protection:**
```
/admin/*                    → role === 'admin'
/dashboard/clients/*        → role === 'verified_stylist' veya 'admin'
/dashboard/*                → herhangi authenticated kullanıcı
/(auth)/*                   → unauthenticated (login varsa /dashboard'a redirect)
```

---

## 🌍 i18n (Internationalization)

- **Kütüphane:** `next-intl`
- **Default:** Türkçe (`/tr/...`)
- **Yedek:** İngilizce (`/en/...`)
- **Strateji:** URL prefix
- **Translation files:** `/web/messages/tr.json`, `/web/messages/en.json`

**Translation key namespace'leri:**
- `common` — Ortak metinler (Kaydet, İptal, Sil, vs.)
- `auth` — Login/Register
- `sidebar` — Navigation
- `dashboard`, `wardrobe`, `canvas`, `community`, `admin`, `settings` — Sayfa-bazlı
- `errors`, `toasts` — Mesajlar

**Kural:** Hiçbir component'te hard-coded UI metni olmamalı. Her metin `t('namespace.key')` üzerinden gelecek.

---

## 📊 Şemada Web'in Yazdığı Field'lar

Mobil tarafıyla koordineli — bu field'lar mobil tarafında **nullable** olarak tanımlanmalı:

**`wardrobeItems` koleksiyonunda:**
```typescript
adminReview: {
  status: 'pending' | 'approved' | 'rejected' | 'corrected';
  reviewedBy: string;
  reviewedAt: Timestamp;
  corrections: { color?, material?, pattern?, category? } | null;
  notes: string | null;
} | null;
```

**`outfits` koleksiyonunda (stylist recommendation):**
```typescript
recommendedBy: string | null;          // Stilist UID
status: 'draft' | 'pending_acceptance' | 'accepted' | 'rejected';
acceptedAt: Timestamp | null;
```

---

## ⚖️ Mimari Prensipler

1. **TypeScript strict** — `any` yasak
2. **Server Actions over API routes** — Mutation'lar için Server Actions tercih edilir
3. **Server Components default** — Client Components sadece etkileşim gerektiğinde
4. **Admin SDK only on server** — Client'a admin yetkisi sızdırmamak
5. **Firestore writes through Server Actions** — Doğrudan client write yok
6. **Type-safe routing** — next-intl `Link`, `useRouter` hooklarını kullan
7. **Defense-in-depth security** — Hem Server Actions hem Firestore Rules ile çift kontrol

---

## 🚫 Yapma Listesi

- ❌ Hard-coded UI metni yazma — her metin `messages/{locale}.json` üzerinden gelmeli
- ❌ `NEXT_PUBLIC_FIREBASE_ADMIN_*` env variable'ı oluşturma — Admin SDK key'leri **server-only** olmalı
- ❌ Service account JSON dosyasını projeye koyma — env variables üzerinden
- ❌ Client tarafından Firestore'a doğrudan yazma — Server Actions kullan
- ❌ `any` tipi kullanma — explicit tip
- ❌ Cookie'deki role bilgisine güvenme — Firestore'dan gerçek role çek
- ❌ Material Design veya generic UI patterns — lüks moda dergisi tonunu koru
- ❌ Parlak renk ekleme (mavi, kırmızı, yeşil) — siyah/beyaz/krem palet
- ❌ Mobile'ı bozacak schema değişikliği — yeni field'lar nullable olmalı
- ❌ Server-only kodu Client Component'e import etme — runtime hata verir

---

## 🔧 Bilinen Tech Debt

Lansman öncesi öncelikli konular için kök `../CLAUDE.md` → "Güncel durum" bölümüne bak. Web'e özgü diğer borçlar:

1. **Middleware proxy deprecation** — Next.js 16 convention warning'i (`src/middleware.ts`)
2. **Pagination** — Admin users sayfasında tüm kullanıcılar tek seferde çekiliyor
3. **Prettier** — Kurulu değil, kod format'ı manuel
4. **Mannequin SVG asset'leri** — şu an çöp adam stili placeholder; hedef profesyonel moda dergisi tonu
