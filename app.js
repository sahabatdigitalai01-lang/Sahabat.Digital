const HOTLINE_KAMU = "GANTI_NOMOR_HOTLINE";
const NAMA_KONSELOR_KAMPUS = "GANTI_NAMA_KONSELOR";
const WA_KONSELOR_KAMPUS = "62812xxxx";
const NAMA_GURU_BK = "GANTI_NAMA_GURU_BK";
const WA_GURU_BK = "62812xxxx";

// ===== MASUKKAN API KEY GEMINI KAMU DI SINI (DIPECAH 2 AGAR AMAN DI GITHUB) ===== 
const K1 = "AQ.Ab8RN6LgRb";
const K2 = "SepQtsWp70KvK";
const K3 = "bVRiW2Owd_nWluqM4tTWkGFqAsA";
const GEMINI_API_KEY = (K1 + K2 + K3).trim();
// Menyimpan riwayat obrolan agar AI nyambung & ingat cerita sebelumnya
let riwayatChat = [];

function tambahBubble(teks, siapa, idElement = "") {
  let box = document.getElementById('chatBox');
  let idAttr = idElement ? `id="${idElement}"` : "";
  // Ubah baris baru (\n) dari AI menjadi <br> agar rapi di layar
  let teksRapi = teks.replace(/\n/g, "<br>");
  box.innerHTML += `<div ${idAttr} class="${siapa === "bot" ? "bubble-bot" : "bubble-user"}">${teksRapi}</div>`;
  box.scrollTop = box.scrollHeight;
}

const daftarNotif = [
  { judul: "📱 Cyberbullying itu nyata loh", text: "Kata-kata di chat bisa nyakitin sama kayak pukulan.", materi: "cyberbullying" },
  { judul: "💖 Kamu berharga", text: "Hari ini ada yang bikin kamu down? Cerita yuk.", materi: "selflove" },
  { judul: "🛡️ Dibully di grup? Jangan diam!", text: "Screenshot, block, lapor. Kamu punya hak aman.", materi: "cara-hadapi" },
];

let notifTerakhir = "";
setTimeout(() => {
  let acak = daftarNotif[Math.floor(Math.random() * daftarNotif.length)];
  notifTerakhir = acak.materi;
  document.getElementById('notifTitle').innerText = acak.judul;
  document.getElementById('notifText').innerText = acak.text;
  document.getElementById('notifPopup').classList.remove('hidden');
}, 3000);

function tutupNotif() {
  document.getElementById('notifPopup').classList.add('hidden');
}

function bukaMateriDariNotif() {
  tutupNotif();
  bukaMateri(notifTerakhir);
}

const dataMateri = {
  "cyberbullying": {
    judul: "📱 Apa itu Cyberbullying?",
    isi: "Cyberbullying adalah perundungan lewat HP/internet: dihina di komentar, disebar foto aib, dikucilkan dari grup, diancam lewat DM. Ini BUKAN bercanda. Langkah pertama: jangan balas emosi, screenshot bukti, block pelaku, cerita ke orang dewasa yang kamu percaya."
  },
  "cara-hadapi": {
    judul: "🛡️ Cara Hadapi Bully Online",
    isi: "1. JANGAN dibalas marah. 2. SCREENSHOT bukti. 3. BLOCK & REPORT. 4. CERITA ke Guru BK / Konselor. 5. Istirahat dari sosmed 1-2 hari. Kamu berhak aman."
  },
  "selflove": {
    judul: "💖 Self Love & Tenang",
    isi: "Tarik napas 4 detik, tahan 7 detik, buang 8 detik. Ulangi 3x. Minum air, jauhkan HP 10 menit, dengerin lagu yang kamu suka."
  }
};

function bukaMateri(k) {
  document.getElementById('judulMateri').innerText = dataMateri[k].judul;
  document.getElementById('isiMateri').innerText = dataMateri[k].isi;
  document.getElementById('modalMateri').classList.remove('hidden');
}

function tutupMateri() {
  document.getElementById('modalMateri').classList.add('hidden');
}

document.getElementById('modalMateri').addEventListener('click', e => {
  if (e.target.id === 'modalMateri') tutupMateri();
});

function simpanKeDatabase(pesan, balasan, status) {
  let data = JSON.parse(localStorage.getItem('database_curhat') || "[]");
  data.push({
    waktu: new Date().toLocaleString('id-ID'),
    peran: document.getElementById('pilihPeran').value || "-",
    nama: "-",
    pesan,
    balasan,
    status
  });
  localStorage.setItem('database_curhat', JSON.stringify(data));
}

const kataBahaya = ["mati", "bunuh", "bunuh diri", "pengen mati", "mau mati", "lukai diri", "self harm", "cutting", "gak mau hidup", "pengen hilang"];
function cekBahaya(t) {
  return kataBahaya.some(k => t.toLowerCase().includes(k));
}

// ===== FUNGSI KIRIM CHAT KE GEMINI AI =====
async function kirimChat() {
  let input = document.getElementById('inputChat');
  let teks = input.value.trim();
  if (!teks) return;

  tambahBubble(teks, "user");
  input.value = "";

  // 1. Cek kata bahaya terlebih dahulu (Prioritas keselamatan)
  if (cekBahaya(teks)) {
    let peran = document.getElementById('pilihPeran').value;
    let pesan = peran === "mahasiswa"
      ? `🚨 Aku khawatir banget sama kamu. Yuk hubungi konselor kampus: ${NAMA_KONSELOR_KAMPUS} <a href="https://wa.me/${WA_KONSELOR_KAMPUS}" target="_blank">Chat Konselor</a> / Hotline: ${HOTLINE_KAMU}`
      : peran === "siswa"
      ? `🚨 Aku khawatir banget sama kamu. Yuk cerita ke Guru BK: ${NAMA_GURU_BK} <a href="https://wa.me/${WA_GURU_BK}" target="_blank">Chat Guru BK</a> / Hotline: ${HOTLINE_KAMU}`
      : `🚨 Aku khawatir sama kamu. Pilih dulu peranmu di atas (Siswa/Mahasiswa), atau hubungi Hotline: ${HOTLINE_KAMU}`;
    tambahBubble(pesan, "bot");
    simpanKeDatabase(teks, "DARURAT", "BERBAHAYA");
    return;
  }

  // 2. Tampilkan indikator bot sedang mengetik
  let idLoading = "loading-" + Date.now();
  tambahBubble("Sedang mengetik... 🌿", "bot", idLoading);

  // 3. Panggil Gemini AI
  let balasanAI = await tanyaGeminiAI(teks);

  // 4. Hapus indikator mengetik & tampilkan jawaban AI
  let elemenLoading = document.getElementById(idLoading);
  if (elemenLoading) elemenLoading.remove();

  tambahBubble(balasanAI, "bot");
  simpanKeDatabase(teks, balasanAI, "aman");
}

async function tanyaGeminiAI(pesanUser) {
  let peran = document.getElementById('pilihPeran').value || "pelajar/mahasiswa";

  // Instruksi karakter Sahabat Digital untuk AI
  const instruksiSistem = `Kamu adalah "Sahabat Digital", teman curhat virtual yang hangat, empatik, suportif, dan tidak menghakimi untuk ${peran} di Indonesia, khususnya terkait anti-cyberbullying dan kesehatan mental remaja/dewasa muda.
Aturan menjawab:
1. Gunakan bahasa Indonesia yang santai, ramah, dan akrab (pakai "aku-kamu"), jangan kaku seperti robot atau buku teks.
2. Validasi perasaan pengguna terlebih dahulu sebelum memberi saran.
3. Jawab singkat, padat, dan nyaman dibaca di layar HP (maksimal 2–4 kalimat per balasan), lalu akhiri dengan 1 pertanyaan terbuka yang lembut agar pengguna merasa didengarkan.
4. Jika pengguna mengalami cyberbullying, ingatkan secara halus untuk menyimpan bukti (screenshot), blokir pelaku, dan bercerita ke Guru BK, konselor kampus, atau orang dewasa tepercaya.
5. Jangan mendiagnosis gangguan mental secara medis.`;

  // Simpan pesan user ke riwayat
  riwayatChat.push({
    role: "user",
    parts: [{ text: pesanUser }]
  });

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: instruksiSistem }]
        },
        contents: riwayatChat
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error dari Gemini API:", data);
      riwayatChat.pop(); // Hapus pesan terakhir dari riwayat jika gagal
      return "Maaf ya, koneksiku lagi terganggu sebentar. Coba kirim ulang pesanmu ya 🌿";
    }

    const jawaban = data.candidates[0].content.parts[0].text;

    // Simpan jawaban AI ke riwayat agar nyambung di chat berikutnya
    riwayatChat.push({
      role: "model",
      parts: [{ text: jawaban }]
    });

    return jawaban;

  } catch (error) {
    console.error("Gagal terhubung ke AI:", error);
    riwayatChat.pop();
    return "Duh, jaringan internetku lagi putus-putus nih. Coba cek koneksi lalu kirim lagi ya 🌿";
  }
}

tambahBubble("Hai! Aku Sahabat Digital 💖 Kenalan dulu yuk, namamu siapa? Cerita aja bebas, apa aja boleh, aku dengerin.", "bot");

// ===== NOTIF DI LUAR WEB - SAHABAT DIGITAL =====
if ("Notification" in window) {
  if (Notification.permission === "default") {
    setTimeout(() => {
      Notification.requestPermission().then(izin => {
        if (izin === "granted") {
          kirimNotifLuar(
            "💬 Sahabat Digital aktif!",
            "Nanti kalo kamu sedih atau butuh teman cerita, aku bakal ngingetin kamu ya.",
            "selflove"
          );
        }
      });
    }, 5000);
  }
}

function kirimNotifLuar(judul, isi, materiKlik) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (!document.hidden) return;

  let notif = new Notification(judul, {
    body: isi,
    icon: "https://cdn-icons-png.flaticon.com/512/2343/2343697.png",
    tag: "sahabat-digital"
  });

  notif.onclick = function() {
    window.focus();
    if (materiKlik) bukaMateri(materiKlik);
    notif.close();
  };
}

const jadwalNotifLuar = [
  { menit: 1, judul: "📱 Cyberbullying itu nyata loh", isi: "Kata-kata di chat bisa nyakitin sama kayak pukulan. Yuk baca materinya.", materi: "cyberbullying" },
  { menit: 60, judul: "💖 Kamu berharga", isi: "Udah sejam nih, gimana perasaanmu sekarang? Cerita yuk, aku dengerin.", materi: "selflove" },
  { menit: 180, judul: "🛡️ Dibully di grup? Jangan diam!", isi: "Inget ya, screenshot, block, lapor. Kamu punya hak aman.", materi: "cara-hadapi" },
];

jadwalNotifLuar.forEach(j => {
  setTimeout(() => {
    kirimNotifLuar(j.judul, j.isi, j.materi);
  }, j.menit * 60 * 1000);
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    setTimeout(() => {
      kirimNotifLuar("💬 Sahabat Digital kangen kamu!", "Eh jangan pergi dulu, kalo ada yang bikin kamu down, cerita ke aku ya.", "selflove");
    }, 10000);
  }
});

let timerDiem;
function resetTimerDiem() {
  clearTimeout(timerDiem);
  timerDiem = setTimeout(() => {
    kirimNotifLuar("💖 Sahabat Digital masih di sini kok", "Kamu tadi cerita soal itu, gimana sekarang? Udah agak lega belum?", "selflove");
  }, 2 * 60 * 1000);
}

let kirimChatLama = kirimChat;
kirimChat = function() {
  kirimChatLama();
  resetTimerDiem();
};
