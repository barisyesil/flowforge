# FlowForge

Çok adımlı (wizard) form tasarımı ve süreç (BPM) yönetimi uygulaması.
Kullanıcılar form tasarlar, bu formlar üzerinden süreç başlatır ve süreçlerin
durumunu bir **state machine** üzerinden takip eder.

> TechYouth School 2. Dönem Projesi — uçtan uca (full-stack) gerçekleştirim.

## Mimari

Monorepo:

```
flowforge/
├── frontend/   # Next.js + TypeScript + Zustand + Tailwind/shadcn
└── backend/    # .NET 8 Web API + EF Core + State Machine (Stateless) + Swagger
```

| Katman | Teknolojiler |
|--------|--------------|
| Frontend | Next.js (App Router), TypeScript, Zustand, Tailwind CSS, shadcn/ui |
| Backend | .NET 8, EF Core, SQLite, REST, Swagger/OpenAPI |
| Süreç | State Machine yaklaşımı (Beklemede → Devam Ediyor → Tamamlandı / Reddedildi) |

## Uygulama Akışı

1. Kullanıcı login olur (kullanıcı + rol bilgisi global state'e alınır).
2. Sabit layout açılır: Header + Sol Menü + İçerik alanı.
3. Kullanıcı:
   - **Form Tasarla** — doldurulacak formun alanlarını (input/select/checkbox) tanımlar.
   - **Formu Başlat** — tasarlanan forma veri girip bir süreç başlatır.
   - **Detay** — sürecin durumunu, tarihlerini ve form verilerini (JSON) görüntüler.

## Kurulum

> Detaylı kurulum adımları geliştirme ilerledikçe doldurulacaktır.

### Gereksinimler
- Node.js 20+
- .NET 8 SDK

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
dotnet run
```

## Varsayılan Kullanıcılar / Roller

Login ekranında bu hesaplara tıklayarak alanları otomatik doldurabilirsiniz.

| Kullanıcı Adı | Şifre | Rol |
|---------------|-------|-----|
| `admin` | `admin123` | Admin |
| `onayci` | `onayci123` | Onaycı |
| `kullanici` | `kullanici123` | Kullanıcı |

> Şu an kimlik doğrulama, frontend'deki mock kullanıcılara karşı yapılır; backend
> authentication bağlandığında gerçek doğrulamaya geçilecektir.
