# 💬 Sahabat Digital

> Platform konseling online berbasis AI untuk Siswa SMA & Mahasiswa  
> Dibuat sebagai Tugas UTS — Full-Stack & AI Web App

---

## 📋 Daftar Isi

1. [Fitur Utama](#fitur-utama)
2. [Cara Mendapatkan Gemini API Key Gratis](#cara-mendapatkan-gemini-api-key-gratis)
3. [Cara Install & Menjalankan](#cara-install--menjalankan)
4. [Cara Mengganti Nomor Hotline, Guru BK & Konselor](#cara-mengganti-nomor-kontak)
5. [Cara Mengetes Fitur](#cara-mengetes-fitur)
6. [Struktur File](#struktur-file)

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|---|---|
| 🤖 **AI Chatbot** | Dijawab oleh Google Gemini AI (`gemini-2.5-flash`) — empatik, hangat, kontekstual |
| 🚨 **Deteksi Bahaya** | AI Contextual + keyword safety net; otomatis muncul kartu darurat (Guru BK / Konselor) |
| 🔔 **Notifikasi Harian** | Web Push via VAPID — terkirim meski browser ditutup, klik → buka materi edukasi |
| 📊 **Admin Panel** | Dashboard pantauan + balas konseli di `admin.html` (password: `sahabatdigital`) |
| 📱 **Responsif** | Desain sage green `#4d7c6f` bersih & rapi di HP maupun laptop |

---

## 🔑 Cara Mendapatkan Gemini API Key Gratis

API Gemini disediakan oleh Google secara **100% GRATIS (1.500 chat/hari)** tanpa perlu kartu kredit / pembayaran apapun:

1. Buka link ini di browser: **[https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)**
2. Login menggunakan akun **Google / Gmail biasa** Anda.
3. Klik tombol biru **"Create API Key"** (atau *"Get API Key"*).
4. Pilih project default Google Cloud (atau klik create), lalu salin kuncinya yang berawalan `AIzaSy...`.
5. Buka file **`.env`** di VS Code, lalu tempelkan kuncinya:
   ```env
   GEMINI_API_KEY=AIzaSy...kunci_kamu_di_sini
   ```
6. Simpan file (`Ctrl + S`).

---

## ⚙️ Cara Install & Menjalankan

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18 atau lebih baru
- Visual Studio Code

### Langkah-langkah

```bash
# 1. Buka folder project di terminal VS Code (Ctrl + `)

# 2. Install dependency (jika baru pertama kali)
npm install

# 3. Jalankan server
npm start

# 4. Buka browser:
#    http://localhost:3000          → halaman konseling utama
#    http://localhost:3000/admin.html → panel pantauan & live admin
```

---

## 📞 Cara Mengganti Nomor Kontak

Buka file **`server.js`**, cari baris 25–32:

```js
// ============================================================
//  KONFIGURASI KONTAK — GANTI SESUAI KEBUTUHAN CLIENT
// ============================================================
const KONTAK = {
  HOTLINE_DARURAT:       "119 ext 8",          // ← ganti nomor hotline
  NAMA_GURU_BK:          "Bu Sari Rahayu",      // ← ganti nama guru BK
  WA_GURU_BK:            "6281234567890",        // ← ganti nomor WA guru BK (format: 62xxx)
  NAMA_KONSELOR_KAMPUS:  "Pak Budi Santoso",     // ← ganti nama konselor kampus
  WA_KONSELOR_KAMPUS:    "6289876543210",        // ← ganti nomor WA konselor kampus (format: 62xxx)
};
```

Ganti nilainya sesuai kebutuhan, lalu simpan file dan restart server.

> **Format nomor WA:** Tanpa tanda `+`, tanpa `-`, tanpa spasi. Contoh: `6281234567890`

---

## 🧪 Cara Mengetes Fitur

### 1. Tes AI Chatbot Konseling
- Buka `http://localhost:3000`
- Ketik curhatan kamu, contoh: *"Halo, aku lagi pusing banget sama skripsi dan tugas akhir"*
- AI Gemini akan merespons dengan bahasa yang empatik, santai, dan penuh dukungan
- Muncul indikator *"Sahabat Digital sedang mengetik..."* saat AI berpikir

### 2. Tes Deteksi Bahaya & Pengalihan Konselor
- Pilih peran kamu di dropdown header (Siswa SMA / Mahasiswa)
- Ketik kalimat yang menunjukkan bahaya, misalnya: *"aku pengen mati aja"* atau *"mau lukai diri"*
- Sistem langsung mendeteksi kondisi serius:
  - Balasan ramah & menenangkan dari AI
  - Diikuti **Kartu Eskalasi Darurat** dengan tombol langsung ke WhatsApp Guru BK (untuk Siswa) atau Konselor Kampus (untuk Mahasiswa) + Hotline Darurat
  - Tercatat di database admin dengan label **BERBAHAYA** (merah)

### 3. Tes Notifikasi Harian & Deep-link Materi
- Klik tombol **"Aktifkan Notifikasi"** pada bar pengingat
- Pilih **"Allow" / "Izinkan"** pada pop-up izin browser
- Setelah aktif, klik tombol **"🧪 Test"** (atau klik tombol status notifikasi)
- Notifikasi sistem akan langsung muncul di layar:
  - Ketika diklik, browser akan langsung membuka modal materi terkait (`cyberbullying`, `fomo`, atau `keamanan-data`)
- Notifikasi juga dijadwalkan otomatis setiap hari pukul **09:00 WIB** via cron job

### 4. Tes Admin Panel
- Buka `http://localhost:3000/admin.html`
- Masukkan password: **`sahabatdigital`**
- Kamu bisa memantau semua obrolan secara live, menahan AI, membalas chat konseli langsung sebagai konselor manusia, atau mengunduh riwayat ke file CSV

---

## 📁 Struktur File

```
Client 2029/
├── server.js            # Backend Express (Google Gemini AI, Web Push, Cron)
├── konseling_fallback.js # Modul konseling cerdas lokal (keamanan jika offline)
├── index.html           # Frontend utama konseling
├── admin.html           # Panel admin pemantauan & live chat
├── app.js               # Logika interaksi frontend & integrasi backend
├── style.css            # Styling tema sage green, responsif mobile & desktop
├── sw.js                # Service Worker Web Push & klik notifikasi
├── manifest.json        # PWA Web App Manifest
├── package.json         # Daftar dependencies
├── .env                 # File API key & VAPID
├── .env.example         # Template konfigurasi environment
└── README.md            # Dokumentasi lengkap proyek
```

---

*Sahabat Digital — Teman Curhat & Literasi Digital Siswa & Mahasiswa*
