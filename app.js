/**
 * ============================================================
 *  SAHABAT DIGITAL — Frontend App (app.js)
 *  Versi: 2.0 (AI-powered via Gemini backend)
 * ============================================================
 *
 *  KONFIGURASI KONTAK — diambil dari backend (/api/config)
 *  Untuk mengganti nomor, edit bagian KONTAK di server.js
 * ============================================================
 */

"use strict";

// ── State global ──────────────────────────────────────────
let kontak = {
  HOTLINE_DARURAT: "119 ext 8",
  NAMA_GURU_BK: "Guru BK",
  WA_GURU_BK: "62800000000",
  NAMA_KONSELOR_KAMPUS: "Konselor Kampus",
  WA_KONSELOR_KAMPUS: "62800000000",
};

let namaUser        = "";
let chatKe          = 0;
let isTyping        = false;
let isWaitingAI     = false;
let conversationHistory = []; // riwayat percakapan untuk konteks AI

const balasanSudahTampil = new Set();
const KUNCI_NOTIF_HARIAN = "sahabat_digital_notif_harian_v2";
const SATU_HARI_MS       = 24 * 60 * 60 * 1000;

// ── Kata bahaya (fallback lokal, cepat) ──────────────────
const kataBahaya = [
  "mati", "bunuh", "bunuh diri", "pengen mati", "mau mati", "ingin mati",
  "lukai diri", "self harm", "self-harm", "cutting", "menyakiti diri",
  "gak mau hidup", "tidak mau hidup", "pengen hilang", "ingin hilang",
  "ingin mengakhiri", "mau mengakhiri hidup",
];

function cekBahayaLokal(teks) {
  const t = teks.toLowerCase();
  return kataBahaya.some((k) => t.includes(k));
}

// ═══════════════════════════════════════════════════════════
//  UTILITAS DOM
// ═══════════════════════════════════════════════════════════

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function tambahBubble(teks, siapa, allowHtml = false) {
  const box = document.getElementById("chatBox");
  if (!box) return null;
  const div = document.createElement("div");
  div.className = siapa === "user" ? "bubble-user" : "bubble-bot";
  div.innerHTML = allowHtml ? teks : escapeHTML(teks);
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  return div;
}

// ── Typing Indicator ─────────────────────────────────────
let typingEl = null;

function tampilkanTyping() {
  hapusTyping();
  const box = document.getElementById("chatBox");
  if (!box) return;
  typingEl = document.createElement("div");
  typingEl.className = "bubble-bot typing-indicator";
  typingEl.setAttribute("aria-label", "Sahabat Digital sedang mengetik");
  typingEl.innerHTML = `
    <span class="typing-dots">
      <span></span><span></span><span></span>
    </span>
    <small>Sahabat Digital sedang mengetik...</small>
  `;
  box.appendChild(typingEl);
  box.scrollTop = box.scrollHeight;
}

function hapusTyping() {
  if (typingEl) {
    typingEl.remove();
    typingEl = null;
  }
}

// ═══════════════════════════════════════════════════════════
//  DATABASE CURHAT (localStorage — compat dengan admin.html)
// ═══════════════════════════════════════════════════════════

function simpanKeDatabase(pesan, balasan, status, pengirimInternal = "AI", tahanAI = false, aiBerpikirSampai = 0) {
  const data = JSON.parse(localStorage.getItem("database_curhat") || "[]");
  const idUnik = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  data.push({
    id: idUnik,
    waktu: new Date().toLocaleString("id-ID"),
    peran: document.getElementById("pilihPeran").value || "-",
    nama: namaUser || "Anonim",
    pesan,
    balasan,
    pengirimBalasan: pengirimInternal,
    tahanAI,
    aiBerpikirSampai,
    balasanAdminTimestamp: 0,
    status,
  });
  localStorage.setItem("database_curhat", JSON.stringify(data));
  return idUnik;
}

function updateItemDatabase(idUnik, patchObj) {
  const data = JSON.parse(localStorage.getItem("database_curhat") || "[]");
  const idx = data.findIndex((item) => item.id === idUnik);
  if (idx === -1) return null;
  data[idx] = { ...data[idx], ...patchObj };
  localStorage.setItem("database_curhat", JSON.stringify(data));
  return data[idx];
}

function apakahItemDitahanAdmin(idUnik) {
  const data = JSON.parse(localStorage.getItem("database_curhat") || "[]");
  const item = data.find((d) => d.id === idUnik);
  if (!item) return false;
  if (item.tahanAI === true) return true;
  if (item.pengirimBalasan === "Admin" && item.balasan && item.balasan !== "-") return true;
  return false;
}

// ═══════════════════════════════════════════════════════════
//  KARTU ESKALASI DARURAT
// ═══════════════════════════════════════════════════════════

function buatKartuEskalasi(peran) {
  const hotline = escapeHTML(kontak.HOTLINE_DARURAT);

  if (peran === "mahasiswa") {
    const nama = escapeHTML(kontak.NAMA_KONSELOR_KAMPUS);
    const wa   = encodeURIComponent(kontak.WA_KONSELOR_KAMPUS);
    return `
      <div class="kartu-eskalasi">
        <div class="eskalasi-header">🆘 Bantuan Tersedia Untukmu</div>
        <p class="eskalasi-pesan">Kamu tidak sendirian. Ada orang yang peduli dan siap membantu.</p>
        <div class="eskalasi-tombol-grup">
          <a href="https://wa.me/${wa}" target="_blank" rel="noopener noreferrer" class="btn-eskalasi btn-wa">
            💬 Chat ${nama}
          </a>
          <a href="tel:${hotline.replace(/\s/g,"")}" class="btn-eskalasi btn-hotline">
            📞 Hotline ${hotline}
          </a>
        </div>
      </div>`;
  }

  if (peran === "siswa") {
    const nama = escapeHTML(kontak.NAMA_GURU_BK);
    const wa   = encodeURIComponent(kontak.WA_GURU_BK);
    return `
      <div class="kartu-eskalasi">
        <div class="eskalasi-header">🆘 Bantuan Tersedia Untukmu</div>
        <p class="eskalasi-pesan">Kamu tidak sendirian. Ada orang yang peduli dan siap membantu.</p>
        <div class="eskalasi-tombol-grup">
          <a href="https://wa.me/${wa}" target="_blank" rel="noopener noreferrer" class="btn-eskalasi btn-wa">
            💬 Chat ${nama} (Guru BK)
          </a>
          <a href="tel:${hotline.replace(/\s/g,"")}" class="btn-eskalasi btn-hotline">
            📞 Hotline ${hotline}
          </a>
        </div>
      </div>`;
  }

  // Belum pilih peran
  return `
    <div class="kartu-eskalasi">
      <div class="eskalasi-header">🆘 Bantuan Tersedia Untukmu</div>
      <p class="eskalasi-pesan">Kamu tidak sendirian 💚 Hubungi bantuan sekarang:</p>
      <a href="tel:${hotline.replace(/\s/g,"")}" class="btn-eskalasi btn-hotline">
        📞 Hotline Darurat: ${hotline}
      </a>
      <p class="eskalasi-pilih-peran">Biar aku bisa kasih kontak yang tepat, ceritain kamu:</p>
      <div class="eskalasi-tombol-grup">
        <button type="button" class="btn-eskalasi btn-peran" onclick="pilihPeranDariChat('siswa')">
          🏫 Saya Siswa SMA
        </button>
        <button type="button" class="btn-eskalasi btn-peran" onclick="pilihPeranDariChat('mahasiswa')">
          🎓 Saya Mahasiswa
        </button>
      </div>
    </div>`;
}

function pilihPeranDariChat(peran) {
  const selectEl = document.getElementById("pilihPeran");
  if (selectEl) selectEl.value = peran;

  // Hapus semua kartu eskalasi lama dan ganti dengan yang baru
  const chatBox = document.getElementById("chatBox");
  const kartuLama = chatBox ? chatBox.querySelectorAll(".kartu-eskalasi-wrapper") : [];
  kartuLama.forEach((el) => el.remove());

  tambahBubble(buatKartuEskalasi(peran), "bot", true);
}

// ═══════════════════════════════════════════════════════════
//  CHAT UTAMA — KIRIM PESAN + PANGGIL AI
// ═══════════════════════════════════════════════════════════

async function kirimChat() {
  const input  = document.getElementById("inputChat");
  const btnKirim = document.getElementById("btnKirim");
  const teks   = input ? input.value.trim() : "";
  if (!teks || isWaitingAI) return;

  // Tampilkan bubble user
  tambahBubble(teks, "user", false);
  if (input)   input.value = "";
  if (btnKirim) { btnKirim.disabled = true; btnKirim.textContent = "..."; }
  isWaitingAI = true;
  chatKe++;

  // Simpan ke history percakapan
  conversationHistory.push({ role: "user", text: teks });

  // Simpan sementara ke database (status: sedang menyiapkan)
  const idChat = simpanKeDatabase(teks, "-", "sedang menyiapkan balasan", "AI", false, Date.now() + 15000);

  // Cek bahaya lokal dulu (cepat)
  const adaBahayaLokal = cekBahayaLokal(teks);

  // Tampilkan typing indicator
  tampilkanTyping();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: teks,
        history: conversationHistory.slice(-10),
        peran: document.getElementById("pilihPeran").value || "",
      }),
    });

    hapusTyping();

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const reply      = data.reply || "Aku di sini kok, cerita aja lebih lanjut 💚";
    const isDangerous = data.is_dangerous || adaBahayaLokal || data.risk_level === "high";

    // Cek apakah admin sudah tahan/balas
    if (apakahItemDitahanAdmin(idChat)) {
      updateItemDatabase(idChat, { aiBerpikirSampai: 0 });
      isWaitingAI = false;
      if (btnKirim) { btnKirim.disabled = false; btnKirim.textContent = "Kirim"; }
      return;
    }

    // Ambil nama dari respons AI jika user baru perkenalan diri
    ekstrakNamaUser(teks, reply);

    // Tambahkan respons AI ke history
    conversationHistory.push({ role: "model", text: reply });

    if (isDangerous) {
      // Situasi berbahaya: tampilkan respons empatik + kartu eskalasi
      const peran = document.getElementById("pilihPeran").value || "";
      tambahBubble(reply, "bot", false);
      const kartuHtml = buatKartuEskalasi(peran);
      tambahBubble(kartuHtml, "bot", true);

      updateItemDatabase(idChat, {
        balasan: reply,
        pengirimBalasan: "AI",
        aiBerpikirSampai: 0,
        status: "BERBAHAYA",
        tahanAI: false,
      });
    } else {
      // Situasi normal
      tambahBubble(reply, "bot", false);
      updateItemDatabase(idChat, {
        balasan: reply,
        pengirimBalasan: "AI",
        aiBerpikirSampai: 0,
        status: "aman",
        tahanAI: false,
      });
    }

  } catch (err) {
    hapusTyping();
    console.error("Chat error:", err);

    const pesanError = adaBahayaLokal
      ? "⚠️ Aku sangat khawatir sama kamu. Tolong hubungi bantuan sekarang ya 💚"
      : "Maaf, Sahabat Digital lagi gangguan koneksi. Coba lagi sebentar ya 🙏";

    tambahBubble(pesanError, "bot", false);

    if (adaBahayaLokal) {
      const peran = document.getElementById("pilihPeran").value || "";
      tambahBubble(buatKartuEskalasi(peran), "bot", true);
      updateItemDatabase(idChat, { balasan: pesanError, status: "BERBAHAYA", aiBerpikirSampai: 0 });
    } else {
      updateItemDatabase(idChat, { balasan: pesanError, status: "error", aiBerpikirSampai: 0 });
    }

  } finally {
    isWaitingAI = false;
    if (btnKirim) { btnKirim.disabled = false; btnKirim.textContent = "Kirim"; }
    resetTimerDiem();
  }
}

// Coba ambil nama dari pesan user
function ekstrakNamaUser(teks, _reply) {
  if (namaUser) return;
  const t = teks.toLowerCase();
  if (t.includes("namaku") || t.includes("nama ku") || t.includes("panggil aku") || t.includes("nama aku")) {
    const match = teks.match(/(?:namaku|nama ku|panggil aku|nama aku)\s+([A-Za-z]+)/i);
    if (match && match[1] && match[1].length >= 2) {
      namaUser = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
    }
  }
}

// ── Reset Obrolan ─────────────────────────────────────────
function resetObrolan() {
  if (!confirm("Reset obrolan? Percakapan saat ini akan dihapus dari chat (riwayat di database tetap tersimpan).")) return;
  conversationHistory = [];
  namaUser = "";
  chatKe = 0;
  isWaitingAI = false;
  hapusTyping();

  const chatBox = document.getElementById("chatBox");
  if (chatBox) chatBox.innerHTML = "";

  tambahBubble("Halo lagi! 💖 Aku Sahabat Digital, siap dengerin cerita kamu. Namamu siapa?", "bot", false);
}

// ═══════════════════════════════════════════════════════════
//  MATERI EDUKASI
// ═══════════════════════════════════════════════════════════

const dataMateri = {
  "cyberbullying": {
    judul: "📱 Cyberbullying",
    isi: "Cyberbullying adalah perundungan lewat HP/internet: komentar menghina, penyebaran foto/chat tanpa izin, pengucilan di grup, atau ancaman lewat DM.\n\nLangkah menghadapinya:\n• Jangan balas dengan emosi\n• Screenshot dan simpan bukti\n• Blokir & laporkan akun pelaku ke platform\n• Cerita ke guru BK, konselor, atau orang dewasa yang kamu percaya\n• Kamu boleh minta bantuan — itu bukan tanda lemah, tapi tanda kamu berani!",
  },
  "fomo": {
    judul: "🌀 FOMO (Fear of Missing Out)",
    isi: "FOMO adalah rasa cemas atau takut tertinggal momen, tren, atau aktivitas orang lain yang kamu lihat di media sosial.\n\nLangkah mengatasinya:\n• Sadar bahwa media sosial hanya menampilkan cuplikan terbaik, bukan realita penuh\n• Batasi waktu scrolling media sosial (coba 1-2 jam/hari)\n• Fokus pada prioritas & kebutuhan dirimu sendiri\n• Jeda rehat dari layar secara rutin\n• Hargai pencapaian kecilmu sendiri — setiap orang punya ritmenya!",
  },
  "keamanan-data": {
    judul: "🔐 Keamanan Data Digital",
    isi: "Keamanan data digital melindungi informasi pribadi dan akunmu dari penyalahgunaan atau peretasan.\n\nLangkah aman:\n• Gunakan password yang kuat & berbeda untuk tiap akun\n• Aktifkan autentikasi dua langkah (2FA)\n• Jangan bagikan kode OTP, alamat, atau data sensitif sembarangan\n• Hati-hati terhadap tautan mencurigakan (phishing)\n• Periksa izin aplikasi di HP secara berkala\n• Privasi digitalmu adalah hakmu — lindungi dengan cermat!",
  },
};

function bukaMateri(k) {
  if (!dataMateri[k]) return;
  document.getElementById("judulMateri").innerText = dataMateri[k].judul;
  document.getElementById("isiMateri").innerText   = dataMateri[k].isi;
  document.getElementById("modalMateri").classList.remove("hidden");
  document.getElementById("modalMateri").focus();
}

function tutupMateri() {
  document.getElementById("modalMateri").classList.add("hidden");
}

document.getElementById("modalMateri").addEventListener("click", (e) => {
  if (e.target.id === "modalMateri") tutupMateri();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") tutupMateri();
});

// ── Deep-link: ?materi=slug ───────────────────────────────
const paramsMateri = new URLSearchParams(window.location.search).get("materi");
if (paramsMateri && dataMateri[paramsMateri]) {
  setTimeout(() => bukaMateri(paramsMateri), 400);
}

// ═══════════════════════════════════════════════════════════
//  NOTIF POPUP DALAM WEB
// ═══════════════════════════════════════════════════════════

const daftarSambutanWeb = [
  { judul: "💬 Selamat Datang di Sahabat Digital", text: "Hai! Sahabat Digital selalu ada buat dengerin cerita kamu. Tips anti cyberbullying: jangan balas emosi & simpan bukti perundungan.", materi: "cyberbullying" },
  { judul: "🌀 Sahabat Digital Menemani Kamu", text: "Lagi ngerasa tertinggal tren atau capek scrolling? Ingat, langkahmu punya ritme sendiri. Cerita aja bebas di sini.", materi: "fomo" },
  { judul: "🔐 Jaga Ruang Aman Digitalmu", text: "Kapan pun butuh teman cerita, aku di sini. Jangan lupa jaga password, 2FA, dan batasi info pribadi di media sosial ya.", materi: "keamanan-data" },
];

let notifTerakhir = "";
let timerTutupNotifMini = null;

function tampilkanPopupDalamWeb(judul, teks, materi = "cyberbullying", durasiMs = 9000) {
  const popup   = document.getElementById("notifPopup");
  const titleEl = document.getElementById("notifTitle");
  const textEl  = document.getElementById("notifText");
  if (!popup || !titleEl || !textEl) return;

  notifTerakhir = materi;
  titleEl.innerText = judul;
  textEl.innerText  = teks;
  popup.classList.remove("hidden");

  if (timerTutupNotifMini) clearTimeout(timerTutupNotifMini);
  if (durasiMs > 0) {
    timerTutupNotifMini = setTimeout(() => tutupNotif(), durasiMs);
  }
}

function tampilkanPopupSambutanMasukWeb() {
  const sambutan = daftarSambutanWeb[Math.floor(Math.random() * daftarSambutanWeb.length)];
  tampilkanPopupDalamWeb(sambutan.judul, sambutan.text, sambutan.materi, 9000);
}

function tutupNotif() {
  if (timerTutupNotifMini) { clearTimeout(timerTutupNotifMini); timerTutupNotifMini = null; }
  const popup = document.getElementById("notifPopup");
  if (popup) popup.classList.add("hidden");
}

function bukaMateriDariNotif() {
  tutupNotif();
  if (notifTerakhir) bukaMateri(notifTerakhir);
}

// ═══════════════════════════════════════════════════════════
//  WEB PUSH NOTIFICATION
// ═══════════════════════════════════════════════════════════

const daftarPengingatBerkala = [
  { judul: "💬 Sahabat Digital • Teman Cerita Kamu", isi: "Kapan pun kamu butuh teman cerita, Sahabat Digital selalu ada buatmu. Tips anti cyberbullying: jangan balas emosi & simpan bukti.", materi: "cyberbullying" },
  { judul: "🌀 Sahabat Digital • Jangan Terjebak FOMO", isi: "Tiap orang punya prosesnya sendiri. Yuk rehat sejenak dari scrolling berlebihan & cerita kalau lagi merasa tertinggal.", materi: "fomo" },
  { judul: "🔐 Sahabat Digital • Keamanan Data Digital", isi: "Pakai password kuat, aktifkan 2FA, dan jangan bagikan info pribadi sembarangan. Sahabat Digital siap nemenin kamu cerita kapan saja.", materi: "keamanan-data" },
];

function sudahKirimNotifHariIni() {
  const terakhir = Number(localStorage.getItem(KUNCI_NOTIF_HARIAN) || "0");
  if (!terakhir) return false;
  return Date.now() - terakhir < SATU_HARI_MS;
}

function tandaiNotifHariIniTerkirim() {
  localStorage.setItem(KUNCI_NOTIF_HARIAN, String(Date.now()));
}

// Konversi base64 ke Uint8Array (untuk VAPID)
function base64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output  = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output;
}

async function daftarPushSubscription() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;

  try {
    const reg = await navigator.serviceWorker.ready;

    // Ambil VAPID public key dari backend
    const resp = await fetch("/api/vapid-public-key");
    if (!resp.ok) return false;
    const { publicKey } = await resp.json();
    if (!publicKey) return false;

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(publicKey),
    });

    // Kirim subscription ke backend
    await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });

    console.log("✅ Push subscription berhasil");
    return true;
  } catch (err) {
    console.warn("Push subscription gagal:", err);
    return false;
  }
}

function tampilkanNotifSistemLangsung(judul, isi, materiKlik) {
  if (!("Notification" in window) || Notification.permission !== "granted") return false;
  try {
    const notif = new Notification(judul, {
      body: isi,
      icon: "https://cdn-icons-png.flaticon.com/512/2343/2343697.png",
      tag: "sahabat-digital-harian-" + Date.now(),
    });
    notif.onclick = function () {
      window.focus();
      if (materiKlik) bukaMateri(materiKlik);
      notif.close();
    };
    return true;
  } catch { return false; }
}

function kirimNotifLuarSekaliSehari(judul, isi, materiKlik, paksaManual = false) {
  if (!("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;
  if (!paksaManual && sudahKirimNotifHariIni()) return false;

  const tampil = tampilkanNotifSistemLangsung(judul, isi, materiKlik);
  if (tampil) tandaiNotifHariIniTerkirim();
  return tampil;
}

// Kirim notif test via backend (untuk presentasi)
async function kirimNotifTest() {
  const daftarMateri = ["cyberbullying", "fomo", "keamanan-data"];
  const materi = daftarMateri[Math.floor(Math.random() * daftarMateri.length)];
  try {
    const resp = await fetch("/api/send-test-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materi }),
    });
    const data = await resp.json();
    alert(`✅ Notifikasi test terkirim!\nMateri: ${materi}\n${data.pesan || ""}`);
  } catch {
    // Fallback: notif langsung via browser
    const pilihan = daftarPengingatBerkala[Math.floor(Math.random() * daftarPengingatBerkala.length)];
    kirimNotifLuarSekaliSehari(pilihan.judul, pilihan.isi, pilihan.materi, true);
    tampilkanPopupDalamWeb(pilihan.judul, pilihan.isi, pilihan.materi, 9000);
  }
}

// ── Status pengingat bar ──────────────────────────────────
function perbaruiStatusPengingat() {
  const titleEl = document.getElementById("statusPengingatTitle");
  const textEl  = document.getElementById("statusPengingatText");
  const btnEl   = document.getElementById("btnAktifkanPengingat");
  const btnTest = document.getElementById("btnTestNotif");
  if (!titleEl || !textEl || !btnEl) return;

  if (!("Notification" in window)) {
    titleEl.innerText = "🔔 Notifikasi Tidak Tersedia";
    textEl.innerText  = "Browser ini tidak mendukung notifikasi.";
    btnEl.disabled    = true;
    btnEl.innerText   = "Tidak Tersedia";
    btnEl.classList.remove("aktif");
    return;
  }

  btnEl.disabled = false;

  if (Notification.permission === "granted") {
    titleEl.innerText = "✅ Notifikasi Aktif";
    textEl.innerText  = "Kamu akan menerima pengingat harian dari Sahabat Digital.";
    btnEl.innerText   = "🔔 Aktif — Klik untuk Test";
    btnEl.classList.add("aktif");
    if (btnTest) btnTest.classList.remove("hidden");
  } else if (Notification.permission === "denied") {
    titleEl.innerText = "🔕 Notifikasi Diblokir";
    textEl.innerText  = "Izinkan notifikasi di pengaturan browser untuk menerima pengingat.";
    btnEl.innerText   = "Dibuka di Pengaturan Browser";
    btnEl.classList.remove("aktif");
    if (btnTest) btnTest.classList.add("hidden");
  } else {
    titleEl.innerText = "🔔 Aktifkan Notifikasi";
    textEl.innerText  = "Aktifkan notifikasi untuk menerima pengingat harian literasi digital.";
    btnEl.innerText   = "Aktifkan Notifikasi";
    btnEl.classList.remove("aktif");
    if (btnTest) btnTest.classList.add("hidden");
  }
}

async function aktifkanPengingatManual() {
  if (!("Notification" in window)) { perbaruiStatusPengingat(); return; }

  if (Notification.permission === "denied") { perbaruiStatusPengingat(); return; }

  if (Notification.permission === "granted") {
    // Sudah aktif: tampilkan test notif
    const pilihan = daftarPengingatBerkala[Math.floor(Math.random() * daftarPengingatBerkala.length)];
    tampilkanPopupDalamWeb(pilihan.judul, pilihan.isi, pilihan.materi, 9000);
    kirimNotifLuarSekaliSehari(pilihan.judul, pilihan.isi, pilihan.materi, true);
    perbaruiStatusPengingat();
    return;
  }

  const izin = await Notification.requestPermission();
  perbaruiStatusPengingat();

  if (izin === "granted") {
    // Daftarkan push subscription ke backend
    await daftarPushSubscription();

    const pilihan = daftarPengingatBerkala[Math.floor(Math.random() * daftarPengingatBerkala.length)];
    tampilkanPopupDalamWeb(pilihan.judul, pilihan.isi, pilihan.materi, 9000);
    kirimNotifLuarSekaliSehari(pilihan.judul, pilihan.isi, pilihan.materi, true);
  }
}

// ═══════════════════════════════════════════════════════════
//  POLLING BALASAN ADMIN (cek localStorage setiap 1 detik)
// ═══════════════════════════════════════════════════════════

setInterval(() => {
  const data = JSON.parse(localStorage.getItem("database_curhat") || "[]");
  data.forEach((item) => {
    if (
      item.pengirimBalasan === "Admin" &&
      item.balasan && item.balasan !== "-" &&
      item.balasanAdminTimestamp
    ) {
      const kunci = `${item.id || ""}::${item.balasanAdminTimestamp}`;
      if (!balasanSudahTampil.has(kunci)) {
        balasanSudahTampil.add(kunci);
        const html = `<div style="font-size:11px;color:#157347;font-weight:600;margin-bottom:4px;">👤 Pesan dari Konselor:</div>${escapeHTML(item.balasan)}`;
        tambahBubble(html, "bot", true);
      }
    }
  });
}, 1000);

// ═══════════════════════════════════════════════════════════
//  TIMER DIEM (pengingat jika user tidak aktif 2 menit)
// ═══════════════════════════════════════════════════════════

let timerDiem;
function resetTimerDiem() {
  clearTimeout(timerDiem);
  timerDiem = setTimeout(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const pilihan = daftarPengingatBerkala[Math.floor(Math.random() * daftarPengingatBerkala.length)];
    kirimNotifLuarSekaliSehari(
      "💖 Masih di sini kok",
      "Kamu tadi cerita, gimana sekarang? Udah agak lega?",
      pilihan.materi,
      false
    );
  }, 2 * 60 * 1000);
}

// ═══════════════════════════════════════════════════════════
//  SERVICE WORKER + INISIALISASI
// ═══════════════════════════════════════════════════════════

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });

  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "BUKA_MATERI" && event.data.materi) {
      bukaMateri(event.data.materi);
    }
  });
}

// ── Auto-minta izin notif setelah 5 detik (pertama kali) ──
if ("Notification" in window && Notification.permission === "default") {
  setTimeout(() => {
    Notification.requestPermission().then(async (izin) => {
      perbaruiStatusPengingat();
      if (izin === "granted") {
        await daftarPushSubscription();
        kirimNotifLuarSekaliSehari(
          "💬 Sahabat Digital aktif!",
          "Nanti kalo kamu butuh cerita atau rehat, aku bakal ngingetin kamu 1 hari sekali ya.",
          "cyberbullying",
          true
        );
      }
    });
  }, 5000);
}

// ── Visibilitychange: kirim notif saat tab ditinggalkan ──
document.addEventListener("visibilitychange", () => {
  if (document.hidden && "Notification" in window && Notification.permission === "granted") {
    const pilihan = daftarPengingatBerkala[Math.floor(Math.random() * daftarPengingatBerkala.length)];
    kirimNotifLuarSekaliSehari(pilihan.judul, pilihan.isi, pilihan.materi, false);
  }
});

// ── Load: ambil config kontak dari backend, tampilkan sambutan ──
window.addEventListener("load", async () => {
  perbaruiStatusPengingat();

  // Ambil konfigurasi kontak dari backend
  try {
    const resp = await fetch("/api/config");
    if (resp.ok) {
      const cfg = await resp.json();
      Object.assign(kontak, cfg);
    }
  } catch {
    // Gunakan default lokal jika backend tidak tersedia
  }

  setTimeout(() => tampilkanPopupSambutanMasukWeb(), 1200);

  if ("Notification" in window && Notification.permission === "granted") {
    const pilihan = daftarPengingatBerkala[Math.floor(Math.random() * daftarPengingatBerkala.length)];
    kirimNotifLuarSekaliSehari(pilihan.judul, pilihan.isi, pilihan.materi, false);
  }
});

// ── Pesan sambutan awal ───────────────────────────────────
tambahBubble(
  "Hai! Aku Sahabat Digital 💖 Kenalan dulu yuk, namamu siapa? Cerita aja bebas, apa aja boleh, aku dengerin.",
  "bot",
  false
);
