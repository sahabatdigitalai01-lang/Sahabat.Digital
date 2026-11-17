const HOTLINE_KAMU = "GANTI_NOMOR_HOTLINE";
const NAMA_KONSELOR_KAMPUS = "GANTI_NAMA_KONSELOR";
const WA_KONSELOR_KAMPUS = "62812xxxx";
const NAMA_GURU_BK = "GANTI_NAMA_GURU_BK";
const WA_GURU_BK = "62812xxxx";

// ===== MEMORI PERCAKAPAN LOKAL (TANPA API KEY) =====
let namaUser = "";
let menungguNama = true; // Awal buka web, bot menyapa & menanyakan nama
let chatKe = 0;
let topikTerakhir = "";
let ceritaSebelumnya = "";
let tahapObrolan = 0; // 0: awal, 1: validasi & gali cerita, 2: dampak perasaan, 3: tawarkan pilihan dukungan
let riwayatBalasanBot = []; // Mencegah bot mengulang kalimat yang sama

function pilihAcakUnik(daftarPilihan) {
  let kandidat = daftarPilihan.filter(item => !riwayatBalasanBot.includes(item));
  if (kandidat.length === 0) kandidat = daftarPilihan;
  let terpilih = kandidat[Math.floor(Math.random() * kandidat.length)];

  riwayatBalasanBot.push(terpilih);
  if (riwayatBalasanBot.length > 6) riwayatBalasanBot.shift();
  return terpilih;
}

function tambahBubble(teks, siapa, idElement = "") {
  let box = document.getElementById('chatBox');
  let idAttr = idElement ? `id="${idElement}"` : "";
  box.innerHTML += `<div ${idAttr} class="${siapa === "bot" ? "bubble-bot" : "bubble-user"}">${teks}</div>`;
  box.scrollTop = box.scrollHeight;
}

// ===== POPUP NOTIFIKASI DALAM WEB =====
const daftarNotif = [
  { judul: "📱 Cyberbullying itu nyata loh", text: "Kata-kata di chat bisa nyakitin sama kayak pukulan.", materi: "cyberbullying" },
  { judul: "🌿 Kamu berharga", text: "Hari ini ada yang bikin kamu down? Cerita yuk.", materi: "selflove" },
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

// ===== MATERI EDUKASI =====
const dataMateri = {
  "cyberbullying": {
    judul: "📱 Apa itu Cyberbullying?",
    isi: "Cyberbullying adalah perundungan lewat HP/internet: dihina di komentar, disebar foto aib, dikucilkan dari grup, atau diancam lewat DM. Ini BUKAN bercanda. Langkah pertama: jangan balas dengan emosi, screenshot semua bukti, block pelaku, dan cerita ke orang dewasa atau konselor yang kamu percaya."
  },
  "cara-hadapi": {
    judul: "🛡️ Cara Hadapi Bully Online",
    isi: "1. JANGAN dibalas marah. 2. SCREENSHOT bukti chat/komentar. 3. BLOCK & REPORT akun pelaku. 4. CERITA ke Guru BK / Konselor Kampus. 5. Istirahat dari media sosial 1–2 hari. Kamu berhak merasa aman."
  },
  "selflove": {
    judul: "🌿 Self Love & Tenang",
    isi: "Tarik napas pelan 4 detik, tahan 7 detik, buang perlahan 8 detik. Ulangi 3 kali. Minum segelas air putih, jauhkan HP 10 menit, dan dengarkan lagu yang bikin pikiranmu rileks."
  }
};

function bukaMateri(k) {
  if (!dataMateri[k]) return;
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

// ===== DATABASE LOKAL UNTUK ADMIN.HTML =====
function simpanKeDatabase(pesan, balasan, status) {
  let data = JSON.parse(localStorage.getItem('database_curhat') || "[]");
  data.push({
    waktu: new Date().toLocaleString('id-ID'),
    peran: document.getElementById('pilihPeran').value || "-",
    nama: namaUser || "-",
    pesan,
    balasan,
    status
  });
  localStorage.setItem('database_curhat', JSON.stringify(data));
}

// ===== DETEKSI KATA DARURAT =====
const kataBahaya = ["mati", "bunuh", "bunuh diri", "pengen mati", "mau mati", "lukai diri", "self harm", "cutting", "gak mau hidup", "pengen hilang", "akhiri hidup"];
function cekBahaya(t) {
  return kataBahaya.some(k => t.toLowerCase().includes(k));
}

// ===== KIRIM CHAT =====
function kirimChat() {
  let input = document.getElementById('inputChat');
  let teks = input.value.trim();
  if (!teks) return;

  tambahBubble(teks, "user");
  input.value = "";
  chatKe++;

  // 1. Cek kondisi darurat terlebih dahulu
  if (cekBahaya(teks)) {
    let peran = document.getElementById('pilihPeran').value;
    let sapa = namaUser ? `${namaUser}, aku` : "Aku";
    let pesan = peran === "mahasiswa"
      ? `🚨 ${sapa} khawatir banget dengar ini. Kamu gak harus nanggung ini sendirian. Yuk hubungi konselor kampus: ${NAMA_KONSELOR_KAMPUS} (<a href="https://wa.me/${WA_KONSELOR_KAMPUS}" target="_blank">Chat Konselor</a>) atau Hotline: ${HOTLINE_KAMU}`
      : peran === "siswa"
      ? `🚨 ${sapa} khawatir banget dengar ini. Kamu gak harus nanggung ini sendirian. Yuk cerita ke Guru BK: ${NAMA_GURU_BK} (<a href="https://wa.me/${WA_GURU_BK}" target="_blank">Chat Guru BK</a>) atau Hotline: ${HOTLINE_KAMU}`
      : `🚨 ${sapa} khawatir banget sama keadaanmu sekarang. Coba pilih peranmu di atas (Siswa/Mahasiswa) biar aku kasih kontak pendamping, atau hubungi Hotline: ${HOTLINE_KAMU}`;
    tambahBubble(pesan, "bot");
    simpanKeDatabase(teks, "DARURAT", "BERBAHAYA");
    return;
  }

  // 2. Efek jeda mengetik alami (550ms - 950ms)
  let idTyping = "typing-" + Date.now();
  tambahBubble("Mengetik...", "bot", idTyping);

  let balasan = buatBalasanCerdas(teks);
  let jeda = 550 + Math.floor(Math.random() * 400);

  setTimeout(() => {
    let el = document.getElementById(idTyping);
    if (el) el.remove();
    tambahBubble(balasan, "bot");
    simpanKeDatabase(teks, balasan, "aman");
  }, jeda);
}

// ===== MESIN PERCAKAPAN NATURAL TANPA API KEY =====
function buatBalasanCerdas(teksAsli) {
  let bersih = teksAsli.trim();
  let t = bersih.toLowerCase().replace(/[^\w\s?!.,]/g, "").trim();
  let hurufSaja = t.replace(/[^a-z]/g, "");
  let panggil = namaUser ? `, ${namaUser}` : "";

  // 1. TANGANI CHAT ISENG / 1-2 HURUF / TYPO / EMOJI SAJA (misal: "a", "p", "tes", "wkwk", "...")
  const kataTes = ["p", "pp", "ppp", "tes", "test", "tess", "cek", "ping", "y", "x", "o", "k", "ok", "oke", "sip", "yoi", "wkwk", "wkwkwk", "haha", "hehe", "hmm", "hmmm", "huh", "uff"];
  const hurufBerulang = /^(.)\1+$/; // contoh: "aaa", "ppp", "zzzz"

  if (hurufSaja.length === 0 || (hurufSaja.length <= 2 && !["hi", "ya", "ga", "no"].includes(hurufSaja)) || kataTes.includes(hurufSaja) || hurufBerulang.test(hurufSaja)) {
    menungguNama = false;
    if (hurufSaja === "p" || hurufSaja === "pp" || hurufSaja === "ppp" || hurufSaja.startsWith("tes")) {
      return pilihAcakUnik([
        `Hadir! 👋 Sinyal aman kok${panggil}. Lagi mau cerita sesuatu atau cuma ngecek aku aktif?`,
        `Masuk! 🌿 Aku di sini kok. Santai aja, ketik pelan-pelan kalo lagi bingung mau mulai dari mana.`,
        `Tes diterima! ✨ Gimana hari ini? Ada yang lagi ganjel di pikiran gak?`
      ]);
    }
    if (hurufSaja.includes("wkwk") || hurufSaja.includes("haha") || hurufSaja.includes("hehe")) {
      return pilihAcakUnik([
        `Wah kayaknya lagi ada yang lucu nih 😄 Bagi-bagi dong, lagi ketawaain apa?`,
        `Seneng deh liat kamu ketawa${panggil}. Lagi mood bagus hari ini?`,
        `Hehe iya nih${panggil}. Btw selain itu, hari ini harimu aman-aman aja kan?`
      ]);
    }
    if (hurufSaja.includes("hmm") || hurufSaja.includes("huh") || hurufSaja.includes("uff")) {
      return pilihAcakUnik([
        `Kedengeran kayak lagi mikirin sesuatu yang berat ya${panggil}... Tarik napas dulu, mau cerita pelan-pelan?`,
        `Helaan napasnya berasa sampe sini nih${panggil} 🌿 Lagi bingung atau capek sama sesuatu?`,
        `Gak perlu buru-buru jelasin semuanya kok${panggil}. Tulis aja satu hal yang paling bikin kepikiran.`
      ]);
    }
    return pilihAcakUnik([
      `Eh kepencet ya${panggil}? 😄 Gak apa-apa, aku udah standby di sini kok kalo kamu mau ngobrol.`,
      `Haha singkatan apa tuh${panggil}? 😅 Santai aja, kalo lagi susah ngetik panjang, kirim satu kata tentang perasaanmu sekarang juga boleh.`,
      `Jari kepleset di keyboard ya? 🌿 Aku dengerin kok, hari ini lagi ngerasain apa?`
    ]);
  }

  // 2. TANGANI SAPAAN AWAL ("halo", "hai", "pagi", "siang", "sore", "malam", "assalamualaikum")
  const daftarSapaan = ["halo", "haloo", "halooo", "hai", "haii", "haiii", "hi", "hey", "hei", "pagi", "selamat pagi", "siang", "selamat siang", "sore", "selamat sore", "malam", "selamat malam", "assalamualaikum", "p", "permisi"];
  if (daftarSapaan.includes(hurufSaja) || (t.split(" ").length <= 2 && daftarSapaan.some(s => t.startsWith(s)))) {
    if (!namaUser) {
      menungguNama = true;
      return pilihAcakUnik([
        `Hai juga! Senang kamu mampir ke Sahabat Digital 🌿 Biar akrab, boleh kenalan dulu? Aku panggil kamu siapa nih?`,
        `Halo! Selamat datang di ruang amanmu ✨ Sebelum mulai ngobrol, namamu siapa? (Pakai nama panggilan aja juga boleh kok).`
      ]);
    } else {
      return pilihAcakUnik([
        `Hai lagi, ${namaUser}! 🌿 Gimana kabar kamu hari ini? Ada cerita baru?`,
        `Halo ${namaUser} ✨ Aku siap dengerin nih. Hari ini lagi ngerasain apa?`
      ]);
    }
  }

  // 3. DETEKSI NAMA PENGGUNA (BAIK PAKAI "NAMAKU..." MAUPUN LANGSUNG JAWAB NAMA)
  const kataBukanNama = ["halo", "hai", "gak", "nggak", "ga", "tidak", "gatau", "bingung", "cape", "capek", "sedih", "marah", "kesel", "takut", "cemas", "gabut", "lapar", "ngantuk", "bosen", "bosan", "bully", "dibully", "tugas", "kuliah", "sekolah", "pacar", "teman", "keluarga", "rahasia", "anonim"];
  if (t.includes("namaku") || t.includes("nama ku") || t.includes("panggil aku") || t.includes("nama saya") || t.includes("kenalin aku")) {
    let kandidatNama = bersih.replace(/namaku|nama ku|panggil aku|nama saya|kenalin aku|adalah|aja|ya/gi, "").trim().split(" ")[0];
    if (kandidatNama && kandidatNama.length >= 2 && !kataBukanNama.includes(kandidatNama.toLowerCase())) {
      namaUser = kandidatNama.charAt(0).toUpperCase() + kandidatNama.slice(1).toLowerCase();
      menungguNama = false;
      return `Salam kenal ya, ${namaUser}! 🌿 Di sini kamu bebas cerita apa aja tanpa takut dihakimi. Lagi ada hal yang bikin pikiranmu penuh akhir-akhir ini?`;
    }
  } else if (menungguNama && !namaUser && t.split(" ").length <= 2) {
    if (t.includes("rahasia") || t.includes("anonim") || t.includes("gak mau") || t.includes("gamau")) {
      menungguNama = false;
      return `Siap, aman banget! Privasi kamu nomor satu di sini 🌿 Langsung cerita aja ya, lagi ada kejadian atau perasaan apa hari ini?`;
    }
    let kataPertama = bersih.replace(/^aku\s+|^saya\s+/i, "").trim().split(" ")[0];
    if (kataPertama.length >= 2 && kataPertama.length <= 15 && !kataBukanNama.includes(kataPertama.toLowerCase())) {
      namaUser = kataPertama.charAt(0).toUpperCase() + kataPertama.slice(1).toLowerCase();
      menungguNama = false;
      return `Hai ${namaUser}, salam kenal! ✨ Makasih udah mampir. Hari ini harimu gimana—aman, lagi capek, atau ada yang lagi kepikiran?`;
    }
  }
  menungguNama = false;

  // 4. PERTANYAAN TENTANG BOT / DI LUAR KONTEKS / OBROLAN SEHARI-HARI
  if (t.includes("kamu siapa") || t.includes("siapa kamu") || t.includes("kamu bot") || t.includes("kamu robot") || t.includes("kamu ai")) {
    return pilihAcakUnik([
      `Aku Sahabat Digital 🌿 Teman ngobrol virtual yang dibuat khusus buat nemenin kamu cerita soal keseharian, tekanan belajar, atau hal-hal nggak enak di media sosial. Kalo kamu, lagi sibuk apa hari ini?`,
      `Aku Sahabat Digital, ruang aman buat kamu nuangin isi kepala tanpa dihakimi ✨ Memang aku sistem digital, tapi aku di sini buat beneran nyimak ceritamu. Lagi pengen bahas apa nih?`
    ]);
  }

  if (t.includes("apa kabar") || t.includes("gimana kabar")) {
    return pilihAcakUnik([
      `Kabarku baik dan selalu siap dengerin kamu${panggil} 🌿 Justru aku yang pengen nanya—kabar hati sama pikiranmu hari ini gimana?`,
      `Alhamdulillah aman${panggil}! Kalo kamu sendiri gimana, hari ini cukup ramah gak buat kamu?`
    ]);
  }

  if (t.includes("gabut") || t.includes("bosen") || t.includes("bosan") || t.includes("nganggur")) {
    return pilihAcakUnik([
      `Wah lagi mode gabut ya${panggil} 😄 Biasanya kalo lagi gabut gini malah suka kepikiran macem-macem atau cuma pengen rebahan aja?`,
      `Sama nih, kadang waktu kosong malah bikin bingung mau ngapain ya${panggil}. Btw, akhir-akhir ini ada hal seru atau malah ada yang bikin sumpek?`
    ]);
  }

  if (t.includes("lapar") || t.includes("laper") || t.includes("belum makan") || t.includes("ngantuk") || t.includes("tidur")) {
    return pilihAcakUnik([
      `Waduh, kebutuhan dasar tuh jangan sampe kelewat${panggil} 🌿 Kalo perut kosong atau kurang tidur, mood gampang banget turun loh. Cari makan atau istirahat dulu yuk!`,
      `Nah itu sinyal dari badanmu minta diperhatiin${panggil}. Sebelum mikirin hal lain, pastiin kamu udah makan atau cukup istirahat ya. Abis itu kalo mau lanjut cerita aku masih di sini.`
    ]);
  }

  if (t.includes("makasih") || t.includes("terima kasih") || t.includes("thanks") || t.includes("thank you")) {
    return pilihAcakUnik([
      `Sama-sama${panggil} 🌿 Seneng banget bisa nemenin kamu ngobrol hari ini. Kapan pun butuh tempat cerita, tinggal buka aja ya!`,
      `Dengan senang hati${panggil} ✨ Kamu udah keren banget karena mau terbuka sama perasaanmu sendiri. Jangan lupa istirahat ya!`
    ]);
  }

  // 5. DETEKSI TOPIK & EMOSI UTAMA (CURHAT)
  let topikSekarang = "";
  if (/(bully|dibully|dihina|dikatain|diejek|dikucilin|fitnah|difitnah|ancem|diancam|aib|sebar|komentar jahat|dm jahat|toxic|body shaming)/.test(t)) {
    topikSekarang = "cyberbullying";
  } else if (/(overthinking|cemas|takut|khawatir|panik|degdegan|deg-degan|gak bisa tidur|susah tidur|gelisah|insecure)/.test(t)) {
    topikSekarang = "cemas";
  } else if (/(cape|capek|lelah|burnout|pusing|stres|stress|tugas|kuliah|sekolah|ujian|nilai|skripsi|dosen|guru|deadline)/.test(t)) {
    topikSekarang = "akademik";
  } else if (/(sedih|nangis|menangis|down|sepi|kesepian|sendiri|hampa|kosong|kecewa|sakit hati|nyesek)/.test(t)) {
    topikSekarang = "sedih";
  } else if (/(marah|kesel|kesal|sebel|sebal|benci|jengkel|emosi|muak)/.test(t)) {
    topikSekarang = "marah";
  } else if (/(pacar|doi|gebetan|mantan|dicuekin|gak dibales|putus|selingkuh|hubungan)/.test(t)) {
    topikSekarang = "hubungan";
  } else if (/(keluarga|ortu|orang tua|mama|papa|ayah|ibu|kakak|adik|rumah)/.test(t)) {
    topikSekarang = "keluarga";
  } else if (/(teman|temen|sahabat|circle|grup|dikacangin|dijauhin)/.test(t)) {
    topikSekarang = "teman";
  } else if (/(senang|seneng|happy|lega|bersyukur|berhasil|lulus|menang)/.test(t)) {
    topikSekarang = "senang";
  }

  if (topikSekarang) {
    topikTerakhir = topikSekarang;
    ceritaSebelumnya = bersih;
    tahapObrolan = 1;

    switch (topikSekarang) {
      case "cyberbullying":
        return pilihAcakUnik([
          `Aku ikut ngerasain nggak enaknya di posisi kamu sekarang${panggil}. Perlakuan kayak gitu di media sosial atau chat itu nyakitin dan bukan salah kamu. Kejadiannya di platform mana, dan kamu udah sempat screenshot buktinya belum?`,
          `Denger ceritamu aja udah kerasa seseknya${panggil} 🌿 Kamu gak pantas diperlakukan kayak gitu. Biar aku lebih paham, itu terjadi di grup atau lewat pesan pribadi?`
        ]);
      case "cemas":
        return pilihAcakUnik([
          `Pelan-pelan ya${panggil}, tarik napas dulu sebentar 🌿 Pikiran yang muter terus emang bikin badan ikut tegang. Dari sekian hal yang lagi kamu khawatirin, mana yang paling bikin dada kerasa penuh sekarang?`,
          `Wajar banget kok ngerasa cemas pas lagi banyak tekanan${panggil}. Coba urai satu-satu bareng aku—hal apa yang paling bikin kamu takut kejadian?`
        ]);
      case "akademik":
        return pilihAcakUnik([
          `Berat banget emang rasanya kalo tuntutan belajar atau tugas udah numpuk barengan${panggil}. Wajar kalo energimu kerasa habis. Yang paling bikin pusing sekarang tuh tugasnya yang kebanyakan, atau ada orang yang bikin suasana makin gak nyaman?`,
          `Kedengeran kamu udah berusaha keras banget sampe titik capek gini${panggil} 🌿 Boleh cerita, bagian mana dari urusan sekolah/kuliah ini yang paling bikin kamu tertekan?`
        ]);
      case "sedih":
        return pilihAcakUnik([
          `Aku di sini nemenin kamu kok${panggil} 🌿 Gak apa-apa banget kalo hari ini rasanya lagi berat atau pengen nangis. Kalo kamu nyaman cerita, apa yang sebenarnya memicu rasa sedih ini?`,
          `Denger kamu lagi ngerasa down gini, aku pengen kamu tau kalo kamu gak sendirian${panggil}. Rasa sedih ini baru muncul hari ini, atau udah kependem cukup lama?`
        ]);
      case "marah":
        return pilihAcakUnik([
          `Kedengeran banget kamu lagi kesel maksimal ya${panggil}. Wajar kok marah kalo batasmu dilanggar atau kamu gak dihargai. Hal spesifik apa yang barusan bikin kamu segitu emosinya?`,
          `Tumpahin aja rasa keselnya di sini daripada dipendem sendirian${panggil} 🌿 Sikap atau omongan siapa yang bikin kamu paling jengkel?`
        ]);
      case "hubungan":
        return pilihAcakUnik([
          `Urusan perasaan sama pasangan/doi emang paling gampang nguras energi ya${panggil}. Yang paling bikin pikiranmu kepancing tuh karena sikapnya berubah, atau komunikasinya yang lagi buntu?`,
          `Aku paham banget rasanya nunggu kepastian atau ngerasa gak diprioritasin${panggil}. Ceritain aja, kejadian terakhir apa yang bikin kamu kepikiran terus?`
        ]);
      case "keluarga":
        return pilihAcakUnik([
          `Masalah di rumah emang paling susah dihindari karena itu tempat kita pulang ya${panggil} 🌿 Kalo boleh tau, situasi atau ucapan siapa di rumah yang paling membekas di hati kamu?`,
          `Aku dengerin kok${panggil}. Kadang keluarga punya ekspektasi yang bikin kita ngerasa gak dimengerti. Bagian mana yang paling berat buat kamu hadapi sekarang?`
        ]);
      case "teman":
        return pilihAcakUnik([
          `Dikecewain atau dijauhin sama lingkungan pertemanan itu rasanya nggak nyaman banget${panggil}. Itu terjadi sama temen deketmu sendiri, atau satu grup/circle?`,
          `Pertemanan yang gak sehat emang bikin capek batin${panggil} 🌿 Coba ceritain kronologinya pelan-pelan, apa yang mereka lakuin ke kamu?`
        ]);
      case "senang":
        return pilihAcakUnik([
          `Ikut seneng dengernya${panggil}! ✨ Energi positifmu kerasa sampe sini. Ceritain dong hal baik apa yang barusan kamu alami?`,
          `Wah keren banget${panggil}! 🎉 Momen kayak gini layak banget dirayain. Apa yang bikin kamu ngerasa selega atau seseneng ini?`
        ]);
    }
  }

  // 6. TANGANI JAWABAN LANJUTAN / PENDALAMAN OBROLAN (MULTI-TURN)
  const kataSetuju = ["iya", "ya", "iya sih", "bener", "banget", "betul", "hooh", "iyah", "iy", "bener banget"];
  const kataBingung = ["gak", "nggak", "ga", "tidak", "gatau", "gak tau", "entah", "bingung", "belum", "susah"];

  if (kataSetuju.includes(t)) {
    tahapObrolan = Math.min(tahapObrolan + 1, 3);
    if (tahapObrolan === 2) {
      return pilihAcakUnik([
        `Aku tangkep maksudmu${panggil} 🌿 Pas ngalamin itu semua, reaksi pertama kamu waktu itu gimana—lebih banyak dipendem sendiri, atau sempat kamu luapin?`,
        `Pantesan aja pikiranmu jadi penuh${panggil}. Menurutmu, apa yang paling kamu butuhin saat ini biar beban itu sedikit berkurang?`
      ]);
    }
    return pilihAcakUnik([
      `Makasih udah mau jujur sejauh ini${panggil} ✨ Sekarang enaknya kita ngapain: kamu masih pengen lanjut cerita aja sampe lega, atau mau bareng-bareng mikirin langkah kecil yang aman buat kamu lakuin?`,
      `Aku bangga kamu berani ngakuin perasaanmu sendiri${panggil}. Kalo kamu mau baca panduan singkat di menu "Materi Hari Ini" di atas juga boleh, atau kita lanjut ngobrol di sini aja?`
    ]);
  }

  if (kataBingung.includes(t)) {
    return pilihAcakUnik([
      `Gak masalah kalo belum ketemu jawabannya sekarang${panggil} 🌿 Kadang pikiran kita cuma butuh jeda sebentar. Dari skala 1 sampai 10, seberat apa perasaanmu saat ini?`,
      `Wajar banget kok ngerasa bingung${panggil}. Gak usah dipaksa harus langsung nemu solusi. Ceritain aja hal random yang lagi lewat di kepala kamu.`
    ]);
  }

  // 7. RESPONS GENERIK NATURAL UNTUK CERITA PANJANG YANG BELUM TERDETEKSI KATA KUNCINYA
  tahapObrolan++;
  ceritaSebelumnya = bersih;

  if (tahapObrolan === 1) {
    return pilihAcakUnik([
      `Aku nyimak ceritamu${panggil} 🌿 Kedengeran hal itu cukup menyita pikiranmu ya. Boleh ceritain lebih detail, awalnya gimana sampai bisa kayak gitu?`,
      `Makasih udah mau berbagi cerita ini ke aku${panggil}. Pas kejadian itu berlangsung, hal apa yang paling kerasa ngeganjel di hati kamu?`,
      `Aku dengerin penuh kok${panggil} ✨ Terus setelah itu terjadi, apa yang kamu lakuin atau rasain sampai sekarang?`
    ]);
  } else if (tahapObrolan === 2) {
    return pilihAcakUnik([
      `Aku ngerti kenapa itu bikin kamu kepikiran${panggil} 🌿 Kalo seandainya kamu bisa ngomong jujur tanpa takut konsekuensi apa pun, hal apa yang paling pengen kamu sampein ke situasi/orang itu?`,
      `Berarti situasinya emang gak gampang buat kamu ya${panggil}. Selama ini kamu nyimpen ini sendirian, atau udah ada temen/orang tepercaya yang tau?`
    ]);
  } else {
    tahapObrolan = 1; // Reset siklus agar percakapan panjang tetap mengalir
    return pilihAcakUnik([
      `Kamu udah ngelewatin banyak hal dan masih bertahan sampai hari ini itu udah hebat banget${panggil} ✨ Sekarang kamu pengen aku nemenin dengerin lanjutannya, atau mau coba teknik relaksasi singkat biar lebih tenang?`,
      `Aku selalu ada di sini buat nyimak kelanjutannya${panggil} 🌿 Ada bagian lain dari cerita ini yang masih pengen kamu keluarin?`
    ]);
  }
}

// Pesan pembuka awal
tambahBubble("Hai! Aku Sahabat Digital 🌿 Kenalan dulu yuk, namamu siapa? Cerita aja bebas, apa aja boleh, aku dengerin.", "bot");

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
  { menit: 60, judul: "🌿 Kamu berharga", isi: "Udah sejam nih, gimana perasaanmu sekarang? Cerita yuk, aku dengerin.", materi: "selflove" },
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
    kirimNotifLuar("🌿 Sahabat Digital masih di sini kok", "Kamu tadi cerita soal itu, gimana sekarang? Udah agak lega belum?", "selflove");
  }, 2 * 60 * 1000);
}

let kirimChatLama = kirimChat;
kirimChat = function() {
  kirimChatLama();
  resetTimerDiem();
};
