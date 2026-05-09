# CLAUDE.md — Vesto AI Web

> Bu dosya, Vesto AI projesinin web tarafının (admin/stilist paneli) kalıcı bağlamını içerir.
> Önce kök dizindeki `/CLAUDE.md`'yi okuduğunu varsay — bu dosya web-spesifik detaylar içerir.

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
| **Framework** | Next.js 16 (App Router) |
| **Dil** | TypeScript (strict mode) |
| **UI Library** | Shadcn/ui + base-ui/react |
| **Styling** | Tailwind CSS v4 |
| **State** | React + Server Actions |
| **Drag & Drop** | @dnd-kit/core, @dnd-kit/sortable |
| **Animation** | framer-motion |
| **Icons** | lucide-react |
| **Backend** | Firebase Admin SDK (server) + Client SDK (auth) |
| **i18n** | next-intl (Türkçe default + İngilizce) |
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

## 📅 Yol Haritası

| Hafta | İş Paketi | Durum |
|---|---|---|
| 1 | Mimari Kurulum (Next.js + Firebase Admin) | ✅ |
| 2 | Dashboard UI (Shadcn + lüks tema) | ✅ |
| 3 | Auth & RBAC (token-based, HTTP-only cookies) | ✅ |
| 4 | Kullanıcı Yönetimi | ✅ |
| 5 | Gardırop Modülü | ✅ |
| 6 | AI Analiz Monitörü (server actions, real Firestore writes) | ✅ |
| 7 | Canvas Altyapısı (dnd-kit) | ✅ |
| 8 | Kombin Editörü (Save outfit functional) | ✅ |
| 9 | Sosyal Moderasyon | ⏳ |
| 10 | Global İstatistikler | ⏳ |
| 11 | Kullanıcı Raporları (PDF) | ⏳ |
| 12 | Performans & SEO | ⏳ |
| 13 | E2E Testing (Playwright) | ⏳ |
| 14 | Deployment (Vercel) | ⏳ |

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

Hafta 9'a geçmeden önce kapatılması planlanan:

1. **Middleware proxy deprecation** — Next.js 16 convention warning'i
2. **Pagination** — Admin users sayfasında tüm kullanıcılar tek seferde çekiliyor
3. **Prettier** — Kurulu değil, kod format'ı manuel
4. **Test verisi eksikliği** — AI Validation ve Save Outfit fonksiyonel test edilemedi (mobile veri üretmedi)
