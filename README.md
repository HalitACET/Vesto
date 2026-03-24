# Vesto AI — Akıllı Gardırop & Moda Yönetim Platformu

> Kullanıcıların fiziksel gardıroplarını dijitalleştiren, yapay zeka ile kıyafet analizi yapan ve hava durumuna göre otomatik kombin öneren lüks moda platformu.

---

## 🛠 Teknik Stack

| Katman | Teknoloji |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| **UI** | Shadcn/ui, Framer Motion, Lucide React |
| **Backend** | Firebase (Auth, Firestore, Cloud Storage) |
| **AI** | Google Vision API (renk & kategori tespiti) |
| **Canvas** | @dnd-kit (sürükle-bırak kombin editörü) |
| **Hava Durumu** | OpenWeather API |

---

## 🚀 Kurulum

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. .env.local dosyasını oluştur
cp .env.local.example .env.local
# → Firebase ve API bilgilerini doldur

# 3. Geliştirme sunucusunu başlat
npm run dev
```

Uygulama: [http://localhost:3000](http://localhost:3000)

---

## 🗂 Proje Yapısı

```
src/
├── app/                     # Next.js App Router sayfaları
│   ├── page.tsx             # Landing page
│   ├── (auth)/              # Login & Register
│   ├── dashboard/           # Wardrobe, Outfits, Canvas, Community
│   └── admin/               # Admin panel
├── components/
│   ├── layout/              # Navbar, Sidebar, DashboardLayout
│   └── ui/                  # Shadcn bileşenleri
├── hooks/                   # useAuth, useWardrobe, useWeather
├── lib/firebase/            # config, auth, firestore, storage
└── types/                   # TypeScript tip tanımları
firestore.rules              # Güvenlik kuralları (user/stylist/admin)
```

---

## 🌐 Web Development Roadmap (Next.js & Admin Portal)

Vesto AI web paneli, stilistlerin kullanıcı gardıroplarını yönettiği ve sistem verilerinin analiz edildiği ana kontrol merkezidir.

| Hafta | Faz | İş Paketi Adı | Web Odaklı Detaylar |
| :---: | :--- | :--- | :--- |
| **1** | 🏗️ Planlama | **Mimari Kurulum** | Next.js projesinin oluşturulması ve Firebase Admin SDK yapılandırması. |
| **2** | 🎨 Tasarım | **Dashboard UI** | Geniş ekran Stilist Paneli wireframe ve Shadcn/ui bileşen tasarımı. |
| **3** | 🔐 Altyapı | **Auth & RBAC** | Stilist/Admin giriş ekranları ve Role-based (RBAC) yetki kontrolü. |
| **4** | 📊 Veri | **Kullanıcı Yönetimi** | Kayıtlı kullanıcı listesi ve detaylı profil izleme ekranları. |
| **5** | 👗 Veri | **Gardırop Modülü** | Kullanıcı envanterlerinin admin tarafında gelişmiş filtrelenmesi. |
| **6** | 🧠 AI Takibi | **Analiz Monitörü** | AI etiketlerinin (Vision API) manuel onay ve düzenleme arayüzü. |
| **7** | 🖱️ İnteraktif | **Canvas Altyapısı** | Sürükle-bırak (dnd-kit) kütüphanesinin teknik entegrasyonu. |
| **8** | 👔 İnteraktif | **Kombin Editörü** | Kullanıcı dolabındaki parçalarla profesyonel kombin oluşturma arayüzü. |
| **9** | 💬 Sosyal | **Moderasyon** | Forum gönderilerinin yönetimi, içerik onayı ve yanıt sistemi. |
| **10** | 📈 Analiz | **Global İstatistikler** | Renk ve kategori trendlerini içeren "Büyük Veri" grafikleri. |
| **11** | 📄 Analiz | **Kullanıcı Raporları** | Bireysel stil karnesi oluşturma ve PDF rapor çıktısı alma. |
| **12** | 🚀 Optimizasyon | **Performans & SEO** | SSR (Server Side Rendering) ayarları ve dashboard yükleme hızı. |
| **13** | 🧪 Kalite | **E2E Testing** | Playwright/Cypress ile tüm kritik web akışlarının otomatik testi. |
| **14** | 🏁 Final | **Deployment** | Vercel/Firebase Hosting yayını ve teknik dökümantasyon finali. |

---

## 🔐 Ortam Değişkenleri

`.env.local.example` dosyasını kopyalayarak doldurun:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_GOOGLE_VISION_API_KEY=
NEXT_PUBLIC_OPENWEATHER_API_KEY=
```
