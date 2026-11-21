/**
 * ============================================================
 *  SAHABAT DIGITAL — Server Backend (Node.js + Express)
 *  AI Engine: Google Gemini AI (gemini-2.5-flash)
 *  Jalankan: npm install  lalu  npm start
 *  Buka di browser: http://localhost:3000
 * ============================================================
 */

require("dotenv").config();

const express = require("express");
const cors    = require("cors");
const path    = require("path");
const fs      = require("fs");
const webPush = require("web-push");
const cron    = require("node-cron");
const { buatBalasanKonselingLokal } = require("./konseling_fallback");

const app  = express();
const PORT = process.env.PORT || 3000;

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
// ============================================================

// ── Google Gemini API Keys Pool (Multi-Key Load Balancing) ──
const geminiKeysPool = [];
[
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY,
  ...(process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(",") : [])
].forEach(k => {
  if (k && k.trim() && !geminiKeysPool.includes(k.trim()) && k.trim() !== "GANTI_DENGAN_API_KEY_KAMU") {
    geminiKeysPool.push(k.trim());
  }
});

let keyIndex = 0;
function getNextGeminiKey() {
  if (geminiKeysPool.length === 0) return "";
  const key = geminiKeysPool[keyIndex % geminiKeysPool.length];
  keyIndex = (keyIndex + 1) % geminiKeysPool.length;
  return key;
}

if (geminiKeysPool.length > 0) {
  console.log(`✅ Google Gemini AI siap (${geminiKeysPool.length} API Keys aktif — Total Kuota: ${geminiKeysPool.length * 1500} chat/hari)`);
} else {
  console.log("ℹ️  GEMINI_API_KEY belum diisi di .env — Berjalan dalam Mode Konseling Cerdas Lokal");
}

// ── File penyimpanan subscriptions push notif ──────────────
const SUBSCRIPTIONS_FILE = path.join(__dirname, "subscriptions.json");

function bacaSubscriptions() {
  if (!fs.existsSync(SUBSCRIPTIONS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(SUBSCRIPTIONS_FILE, "utf8")); }
  catch { return []; }
}

function simpanSubscriptions(list) {
  fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(list, null, 2), "utf8");
}

// ── Setup VAPID keys ───────────────────────────────────────
let vapidReady = false;
(function setupVapid() {
  let pub  = process.env.VAPID_PUBLIC_KEY  || "";
  let priv = process.env.VAPID_PRIVATE_KEY || "";

  if (!pub || !priv) {
    console.log("⚙️  VAPID keys kosong → generate otomatis...");
    const keys = webPush.generateVAPIDKeys();
    pub  = keys.publicKey;
    priv = keys.privateKey;

    const envPath = path.join(__dirname, ".env");
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, "utf8");
      envContent = envContent
        .replace(/^VAPID_PUBLIC_KEY=.*/m,  `VAPID_PUBLIC_KEY=${pub}`)
        .replace(/^VAPID_PRIVATE_KEY=.*/m, `VAPID_PRIVATE_KEY=${priv}`);
      fs.writeFileSync(envPath, envContent, "utf8");
      console.log("✅ VAPID keys tersimpan ke .env");
    }
  }

  try {
    webPush.setVapidDetails(
      process.env.VAPID_EMAIL || "mailto:admin@sahabatdigital.id",
      pub,
      priv
    );
    fs.writeFileSync(
      path.join(__dirname, "vapid-public.json"),
      JSON.stringify({ publicKey: pub }),
      "utf8"
    );
    vapidReady = true;
    console.log("✅ VAPID push notification siap");
  } catch (e) {
    console.error("❌ VAPID setup error:", e.message);
  }
})();

// ── Middleware ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ============================================================
//  SYSTEM PROMPT — Karakter AI "Sahabat Digital"
// ============================================================
const SYSTEM_PROMPT = `Kamu adalah "Sahabat Digital", teman curhat AI konseling online yang empatik, hangat, dan suportif untuk siswa SMA dan mahasiswa Indonesia.

CARA KAMU BERBICARA:
- Gunakan bahasa Indonesia yang hangat, santai, dan mudah dipahami remaja
- Jangan kaku, formal, atau terkesan seperti dokter/psikolog medis
- Gunakan kata "kamu" bukan "Anda"
- Boleh pakai kata santai yang wajar (sih, dong, aja, ya, loh, nih)
- JANGAN gunakan kata "saya" — pakai "aku" saat merujuk dirimu sendiri

PRINSIP UTAMA:
- Dengarkan dengan penuh empati sebelum memberi saran
- Validasi perasaan user, jangan menghakimi
- Ajukan pertanyaan terbuka untuk menggali cerita lebih dalam
- JANGAN memberikan diagnosis medis atau psikologis klinis apa pun
- Dorong user untuk bercerita dengan aman dan nyaman
- Jika kondisi berat, dorong untuk mencari bantuan profesional (Guru BK / Konselor)

DETEKSI BAHAYA:
Perhatikan tanda-tanda kondisi kritis: indikasi self-harm (melukai diri), bunuh diri, depresi berat, kekerasan, atau ancaman bahaya fisik.

FORMAT RESPONS — WAJIB berikan dalam JSON murni yang valid:
{
  "reply": "balasan empatik kamu dalam bahasa Indonesia yang hangat",
  "is_dangerous": false,
  "risk_level": "low",
  "reason": "penjelasan singkat penilaianmu"
}

Nilai risk_level: "low" (aman), "medium" (perlu perhatian), "high" (berbahaya/darurat).
Jika is_dangerous true atau risk_level "high", tetap berikan balasan empatik & menenangkan di "reply", tapi tandai is_dangerous=true.`;

// ── Daftar kata bahaya (Safety Net Tambahan) ──────────────
const KATA_BAHAYA = [
  "mati", "bunuh", "bunuh diri", "pengen mati", "mau mati", "ingin mati",
  "lukai diri", "self harm", "self-harm", "cutting", "menyakiti diri",
  "gak mau hidup", "tidak mau hidup", "pengen hilang", "ingin hilang",
  "ingin mengakhiri", "mau mengakhiri hidup", "bunuh aja", "matiin aku",
];

function cekKataBahaya(teks) {
  const t = (teks || "").toLowerCase();
  return KATA_BAHAYA.some((k) => t.includes(k));
}

// ============================================================
//  FUNGSI PANGGIL GOOGLE GEMINI REST API (MULTI-KEY SUPPORT)
// ============================================================
async function panggilGeminiSingleKey(message, history, apiKey, model = "gemini-3.5-flash-lite") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const contents = [];
  for (const h of history.slice(-8)) {
    if (h.role && h.text) {
      contents.push({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.text }]
      });
    }
  }
  contents.push({
    role: "user",
    parts: [{ text: message }]
  });

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents,
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0.85,
        max_output_tokens: 600
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini [${model}] ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Respons kosong dari Gemini");
  return text;
}

// Panggil Gemini dengan rotasi key dan fallback model
async function panggilGemini(message, history) {
  if (geminiKeysPool.length === 0) return null;

  const daftarModel = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash"];

  for (const model of daftarModel) {
    // Coba semua key yang ada di pool untuk model ini
    for (let i = 0; i < geminiKeysPool.length; i++) {
      const apiKey = getNextGeminiKey();
      try {
        const text = await panggilGeminiSingleKey(message, history, apiKey, model);
        if (text) return text;
      } catch (err) {
        console.warn(`⚠️ Gemini [${model}] pada key ...${apiKey.slice(-6)} gagal:`, err.message);
      }
    }
  }
  return null;
}

// ============================================================
//  ENDPOINT: GET /api/config
// ============================================================
app.get("/api/config", (req, res) => {
  res.json({ ...KONTAK });
});

// ============================================================
//  ENDPOINT: POST /api/chat
//  Body: { message: string, history: Array, peran: string }
// ============================================================
app.post("/api/chat", async (req, res) => {
  const { message, history = [], peran = "" } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Pesan tidak boleh kosong" });
  }

  const adaKataBahaya = cekKataBahaya(message);
  let rawText = null;

  // 1. Panggil Gemini AI dengan multi-key pool
  if (geminiKeysPool.length > 0) {
    try {
      rawText = await panggilGemini(message, history);
    } catch (err) {
      console.warn("⚠️ Seluruh key Gemini di pool gagal:", err.message);
    }
  }

  // 2. Jika offline / seluruh key limit, gunakan Modul Konseling Cerdas Internal
  if (!rawText) {
    const dataLokal = buatBalasanKonselingLokal(message, peran);
    if (adaKataBahaya) {
      dataLokal.is_dangerous = true;
      dataLokal.risk_level = "high";
    }
    return res.json(dataLokal);
  }

  try {
    let parsed = null;
    try {
      parsed = JSON.parse(rawText.trim());
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch { parsed = null; }
      }
    }

    if (!parsed || typeof parsed.reply !== "string") {
      parsed = {
        reply: rawText || "Aku di sini kok, cerita aja lebih lanjut 💚",
        is_dangerous: adaKataBahaya,
        risk_level: adaKataBahaya ? "high" : "low",
        reason: "respons teks biasa dari AI",
      };
    }

    // Safety net: pastikan kata bahaya selalu memicu kartu eskalasi
    if (adaKataBahaya && !parsed.is_dangerous) {
      parsed.is_dangerous = true;
      if (parsed.risk_level === "low") parsed.risk_level = "high";
      parsed.reason = (parsed.reason || "") + " [keyword bahaya terdeteksi]";
    }

    return res.json(parsed);

  } catch (err) {
    const fallbackData = buatBalasanKonselingLokal(message, peran);
    if (adaKataBahaya) {
      fallbackData.is_dangerous = true;
      fallbackData.risk_level = "high";
    }
    return res.json(fallbackData);
  }
});

// ============================================================
//  ENDPOINT: GET /api/vapid-public-key
// ============================================================
app.get("/api/vapid-public-key", (req, res) => {
  const keyFile = path.join(__dirname, "vapid-public.json");
  if (!fs.existsSync(keyFile)) {
    return res.status(503).json({ error: "VAPID belum siap" });
  }
  const { publicKey } = JSON.parse(fs.readFileSync(keyFile, "utf8"));
  res.json({ publicKey });
});

// ============================================================
//  ENDPOINT: POST /api/subscribe
// ============================================================
app.post("/api/subscribe", (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: "Subscription tidak valid" });
  }

  const list = bacaSubscriptions();
  const sudahAda = list.some((s) => s.endpoint === subscription.endpoint);
  if (!sudahAda) {
    list.push(subscription);
    simpanSubscriptions(list);
    console.log(`✅ Subscription push baru tersimpan (total: ${list.length})`);
  }

  res.json({ success: true });
});

// ============================================================
//  ENDPOINT: POST /api/send-test-notification
// ============================================================
app.post("/api/send-test-notification", async (req, res) => {
  const { materi } = req.body;
  const daftarMateri = ["cyberbullying", "fomo", "keamanan-data"];
  const materiDipilih = daftarMateri.includes(materi)
    ? materi
    : daftarMateri[Math.floor(Math.random() * daftarMateri.length)];

  const payload = getDaftarNotif(materiDipilih);
  await kirimNotifikasiKeSemuaSubscriber(payload.judul, payload.isi, materiDipilih);
  res.json({ success: true, materi: materiDipilih, pesan: "Notifikasi test terkirim!" });
});

// ── Payload notifikasi materi ─────────────────────────────
const DATA_NOTIF = {
  cyberbullying: {
    judul: "💬 Sahabat Digital • Anti Cyberbullying",
    isi:   "Ingat: jangan balas emosi & simpan bukti perundungan. Sahabat Digital selalu ada buatmu 💚",
  },
  fomo: {
    judul: "🌀 Sahabat Digital • Jangan Terjebak FOMO",
    isi:   "Tiap orang punya prosesnya sendiri. Yuk rehat sejenak dari scrolling berlebihan 🌿",
  },
  "keamanan-data": {
    judul: "🔐 Sahabat Digital • Jaga Keamanan Data",
    isi:   "Pakai password kuat & aktifkan 2FA. Privasi digitalmu adalah hakmu 🔒",
  },
};

function getDaftarNotif(materi) {
  return DATA_NOTIF[materi] || DATA_NOTIF["cyberbullying"];
}

async function kirimNotifikasiKeSemuaSubscriber(judul, isi, materi) {
  if (!vapidReady) {
    console.warn("⚠️  VAPID belum siap, notifikasi dilewati");
    return;
  }
  const list = bacaSubscriptions();
  if (list.length === 0) { return; }

  const payload = JSON.stringify({ judul, isi, materi });
  const gagal = [];

  for (const sub of list) {
    try {
      await webPush.sendNotification(sub, payload);
    } catch (err) {
      gagal.push(sub.endpoint);
    }
  }

  if (gagal.length > 0) {
    const valid = list.filter((s) => !gagal.includes(s.endpoint));
    simpanSubscriptions(valid);
  }
  console.log(`📨 Notifikasi terkirim ke ${list.length - gagal.length} subscriber`);
}

// ── Cron: notifikasi harian pukul 09:00 WIB ───────────────
cron.schedule("0 9 * * *", async () => {
  console.log("⏰ Cron: mengirim notifikasi harian...");
  const daftarMateri = ["cyberbullying", "fomo", "keamanan-data"];
  const materi = daftarMateri[Math.floor(Math.random() * daftarMateri.length)];
  const payload = getDaftarNotif(materi);
  await kirimNotifikasiKeSemuaSubscriber(payload.judul, payload.isi, materi);
}, { timezone: "Asia/Jakarta" });

// ── Fallback route → index.html ───────────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ── Start server ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log("====================================================");
  console.log(`🚀 Sahabat Digital → http://localhost:${PORT}`);
  console.log(`📊 Admin panel   → http://localhost:${PORT}/admin.html`);
  console.log(`🤖 AI Engine     → Google Gemini Multi-Key Pool (${geminiKeysPool.length} Keys: ${geminiKeysPool.length * 1500} chat/hari)`);
  console.log("====================================================");
});
