# FlowForge

Çok adımlı (wizard) form tasarımı ve **iş akışı (BPM) yönetimi** uygulaması.
Admin formlar ve çok adımlı süreçler (workflow) tasarlar; kullanıcılar bu süreçleri
başlatır, her adımda atanan rol/kişiye **görev** düşer, süreç koşullu dallanmayla
adımlar arasında ilerler.

> TechYouth School 2. Dönem Projesi — genişletilebilir, okunabilir frontend mimarisi.

## Mimari

Monorepo:

```
flowforge/
├── frontend/   # Next.js + TypeScript + Zustand + Tailwind/shadcn (mock API)
└── backend/    # .NET 8 Web API (planlı — şu an mock API ile çalışıyor)
```

| Katman | Teknolojiler |
|--------|--------------|
| Frontend | Next.js (App Router), TypeScript, **Zustand**, Tailwind CSS, shadcn/ui (Base UI), dnd-kit, next-themes |
| Mock API | localStorage tabanlı, gecikmeli (gerçek backend varmış gibi) servis katmanı |
| Süreç motoru | Workflow tabanlı: adım + form + atanan (rol/kullanıcı) + koşullu geçişler |

Veri akışı: **Roller → Formlar → Workflow (adımlar)** tasarlanır; bir workflow'dan
**süreç** başlatılır; her aktif adım atanan kişiye **görev** üretir; aksiyon (koşula
göre) sonraki adıma ya da bitişe (Tamamlandı/Reddedildi) yönlendirir.

## Uygulama Akışı

1. Kullanıcı login olur (kullanıcı + rol global state'e alınır).
2. Sabit layout açılır: Header + Sol Menü + İçerik.
3. **Admin** tasarlar:
   - **Roller** — şirket rolleri (Yönetici, İK, Muhasebe…) tanımlanır.
   - **Form Tasarımı** — alanlar (input/select/checkbox…), tip bazlı + bağımlı validasyon, koşullu mantık.
   - **Süreç Tasarımı** — çok adımlı workflow; her adıma form bağlanır, rol/kullanıcı atanır, geçişler (aksiyon + koşul + hedef) tanımlanır. Adımlar sürükle-bırak sıralanır.
   - **Kullanıcılar** — kullanıcı ekleme/düzenleme, rol atama.
4. Herkes **Süreçler / İşlerim**:
   - **Yeni Süreç Başlat** — bir workflow seçilir, ilk adım doldurulur.
   - **İşlerim** — kendine atanmış görevleri görür, adım formunu doldurup aksiyon seçer.
   - **Detay** — stepper (adım ilerlemesi), süreç durumu/ID/tarih, **per-adım JSON verisi** ve süreç geçmişi.

## Özellikler

- Çok adımlı **wizard form** tasarımcısı (custom component, dnd sıralama)
- Tip bazlı + **bağımlı validasyon** + koşullu görünürlük (kural motoru)
- **Workflow tasarımcısı** + dinamik yürütme + **koşullu dallanma**
- **Görev (task)** üretimi ve İşlerim gelen kutusu
- **Dinamik rol** yönetimi + rol bazlı menü/ekran/aksiyon koruması
- **i18n** (Türkçe / English), **dark / light** tema, responsive
- Profil yönetimi, oturum (logout)

## Kurulum

### Gereksinimler
- Node.js 20+

### Frontend
```bash
cd frontend
npm install
npm run dev
```
→ http://localhost:3000

## Varsayılan Kullanıcılar / Roller

Login ekranında bu hesaplara tıklayarak alanları otomatik doldurabilirsiniz.

| Kullanıcı Adı | Şifre | Rol |
|---------------|-------|-----|
| `admin` | `admin123` | Admin (her şeyi yönetir) |
| `onayci` | `onayci123` | Onaycı |
| `kullanici` | `kullanici123` | Kullanıcı |
| `yonetici` | `yonetici123` | Yönetici |
| `muhasebe` | `muhasebe123` | Muhasebe |
| `calisan` | `calisan123` | Çalışan |

Roller dinamiktir; admin **Roller** ekranından yeni roller ekleyip kullanıcılara atayabilir.

> Kimlik doğrulama ve tüm veriler şu an frontend'deki mock API (localStorage) üzerinden
> yürütülür; planlanan .NET 8 backend bağlandığında bu katman gerçek servislerle değişecektir.

## Örnek Senaryo (deneyin)

1. `admin` ile gir → **Roller**'de "Muhasebe" zaten var → **Form Tasarımı**'nda "Harcama Talebi" formu yap (örn. *tutar* sayı alanı).
2. **Süreç Tasarımı**'nda 2-3 adımlı workflow kur: Adım 1 (form: Harcama Talebi, atanan: Çalışan) → "Onayla" geçişinde *tutar > 1000 ise* Adım 2 (Muhasebe) *değilse* Bitiş. Kaydet.
3. `calisan` ile gir → **Yeni Süreç Başlat** → formu doldur → süreç ilerler.
4. `muhasebe` ile gir → **İşlerim**'de görevi gör → işle. Detayda stepper ve geçmiş.
