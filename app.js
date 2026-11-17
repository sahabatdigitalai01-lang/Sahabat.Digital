const HOTLINE_KAMU = "GANTI_NOMOR_HOTLINE";
const NAMA_KONSELOR_KAMPUS = "GANTI_NAMA_KONSELOR";
const WA_KONSELOR_KAMPUS = "62812xxxx";
const NAMA_GURU_BK = "GANTI_NAMA_GURU_BK";
const WA_GURU_BK = "62812xxxx";

let namaUser = "";
let chatKe = 0;
let omonganTerakhir = "";
let omonganSebelumnya = "";
let topikTerakhir = "";
let modeObrolan = "netral"; // "netral" | "dengerin" | "solusi"
let balasanTerakhir = "";
let sudahTanyaKapan = false;
let sudahTanyaTerberat = false;
let sudahTanyaMauApa = false;

function tambahBubble(teks, siapa) {
  let box = document.getElementById('chatBox');
  box.innerHTML += `<div class="${siapa === "bot" ? "bubble-bot" : "bubble-user"}">${teks}</div>`;
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
    nama: namaUser,
    pesan,
    balasan,
    status
  });
  localStorage.setItem('database_curhat', JSON.stringify(data));
}

const kataBahaya = ["mati", "bunuh", "bunuh diri", "pengen mati", "mau mati", "lukai diri", "self harm", "cutting", "gak mau hidup", "pengen hilang", "mau ngakhiri"];
function cekBahaya(t) {
  return kataBahaya.some(k => t.toLowerCase().includes(k));
}

function kirimChat() {
  let input = document.getElementById('inputChat');
  let teks = input.value.trim();
  if (!teks) return;
  tambahBubble(teks, "user");
  input.value = "";
  chatKe++;
  omonganSebelumnya = omonganTerakhir;
  omonganTerakhir = teks;

  if (cekBahaya(teks)) {
    let peran = document.getElementById('pilihPeran').value;
    let nama = namaUser || "Kamu";
    let pesan = peran === "mahasiswa"
      ? `🚨 ${nama}, aku khawatir banget. Yuk ke konselor kampus: ${NAMA_KONSELOR_KAMPUS} <a href="https://wa.me/${WA_KONSELOR_KAMPUS}" target="_blank">Chat Konselor</a> / Hotline: ${HOTLINE_KAMU}`
      : peran === "siswa"
      ? `🚨 ${nama}, aku khawatir banget. Yuk ke Guru BK: ${NAMA_GURU_BK} <a href="https://wa.me/${WA_GURU_BK}" target="_blank">Chat Guru BK</a> / Hotline: ${HOTLINE_KAMU}`
      : `🚨 Aku khawatir sama kamu. Pilih dulu di atas kamu siswa/mahasiswa. Hotline: ${HOTLINE_KAMU}`;
    tambahBubble(pesan, "bot");
    simpanKeDatabase(teks, "DARURAT", "BERBAHAYA");
    return;
  }

  let balasan = buatBalasan(teks);
  setTimeout(() => {
    tambahBubble(balasan, "bot");
    simpanKeDatabase(teks, balasan, "aman");
  }, 400);
}

// ===== OTAK PERCAKAPAN SAHABAT DIGITAL =====
function buatBalasan(teks) {
  let t = teks.toLowerCase().trim();
  let panggil = namaUser ? `, ${namaUser}` : "";

  const daftarKata = (daftar) => daftar.some(k => t.includes(k));

  const pilihUnik = (pilihan) => {
    let kandidat = pilihan.filter(p => p !== balasanTerakhir);
    if (kandidat.length === 0) kandidat = pilihan;
    let terpilih = kandidat[Math.floor(Math.random() * kandidat.length)];
    balasanTerakhir = terpilih;
    return terpilih;
  };

  const deteksiTopik = (kalimat) => {
    if (["bully", "dibully", "dihina", "dikatain", "diejek", "dikucilin", "aib", "disebar", "dihujat", "fitnah", "diancam", "dikick", "akun fake", "hate comment", "spill"].some(k => kalimat.includes(k))) return "dibully";
    if (["insecure", "minder", "gak pede", "gk pede", "jelek", "malu", "gak berguna", "gagal", "bandingin"].some(k => kalimat.includes(k))) return "insecure";
    if (["takut", "cemas", "khawatir", "panik", "overthinking", "ovt", "gak bisa tidur", "gk bisa tidur", "deg-degan", "gelisah"].some(k => kalimat.includes(k))) return "cemas";
    if (["sedih", "nangis", "down", "sepi", "kesepian", "sendiri", "hampa", "kecewa", "sakit hati", "sesek"].some(k => kalimat.includes(k))) return "sedih";
    if (["marah", "kesel", "sebel", "benci", "jengkel", "emosi", "muak", "gedek", "parah banget"].some(k => kalimat.includes(k))) return "marah";
    if (["cape", "capek", "lelah", "pusing", "burnout", "penat"].some(k => kalimat.includes(k))) return "cape";
    if (["bingung", "galau", "bimbang", "dilema"].some(k => kalimat.includes(k))) return "bingung";
    if (["senang", "seneng", "happy", "lega", "bersyukur"].some(k => kalimat.includes(k))) return "senang";
    if (["pacar", "doi", "gebetan", "mantan", "dicuekin", "gak dibales", "gk dibales", "putus", "ghosting", "baper", "selingkuh"].some(k => kalimat.includes(k))) return "pacar";
    if (["tugas", "kuliah", "sekolah", "ujian", "nilai", "skripsi", "dosen", "guru", "kelas", "kampus"].some(k => kalimat.includes(k))) return "sekolah";
    if (["keluarga", "ortu", "orang tua", "mama", "papa", "ayah", "ibu", "kakak", "adik", "rumah"].some(k => kalimat.includes(k))) return "keluarga";
    if (["teman", "temen", "sahabat", "grup", "circle", "toxic", "dijauhin", "berantem"].some(k => kalimat.includes(k))) return "teman";
    return "";
  };

  const kataBukanNama = ["halo", "hai", "hi", "p", "assalamualaikum", "pagi", "siang", "sore", "malam", "iya", "ya", "gak", "nggak", "ga", "gaje", "gk jelas", "gak jelas", "apaan", "tes", "test", "bot", "min", "admin"];

  // 1. Tangkap nama user
  if (daftarKata(["namaku", "nama ku", "panggil aku", "panggil aja", "nama saya"])) {
    let kata = teks.replace(/namaku|nama ku|panggil aku|panggil aja|nama saya/gi, "").trim().split(" ");
    let n = (kata[kata.length - 1] || "").replace(/[^a-zA-Z]/g, "");
    if (n.length >= 2) {
      namaUser = n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
      return pilihUnik([
        `Hai ${namaUser}! Seneng kenal kamu 💖 Oke ${namaUser}, ceritain aja bebas, apa yang lagi ada di pikiran kamu sekarang?`,
        `Salam kenal ya ${namaUser} 💖 Di sini aman kok, kamu bebas cerita apa aja yang lagi bikin hati atau pikiran kamu penuh.`
      ]);
    }
  }

  if (chatKe === 1 && !namaUser && teks.split(" ").length <= 2 && !kataBukanNama.includes(t) && !deteksiTopik(t)) {
    let n = teks.split(" ")[0].replace(/[^a-zA-Z]/g, "");
    if (n.length >= 2) {
      namaUser = n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
      return `Hai ${namaUser}! Seneng kenal kamu 💖 Gimana kabarmu hari ini? Kalau ada yang lagi kepikiran, cerita aja ke aku.`;
    }
  }

  // 2. Tangani protes jika jawaban dianggap tidak nyambung
  if (daftarKata(["gk jelas", "gak jelas", "ga jelas", "gaje", "apaan sih", "ngaco", "gak nyambung", "gk nyambung", "template", "kayak bot", "robot"])) {
    if (topikTerakhir === "dibully") {
      return `Maaf ya${panggil} kalau responsku barusan kurang pas 🙏 Maksudku cuma pengen pastiin kamu aman. Kalau gak mau ditanya-tanya, kamu bisa langsung baca panduan di menu "Cara Hadapi Bully Online" di atas, atau tumpahin aja kekesalanmu di sini.`;
    }
    return `Maaf banget ya${panggil} kalau jawabanku tadi berasa kurang nyambung 🙏 Biar aku gak salah tangkep, sekarang kamu maunya gimana: cukup didengerin aja tanpa ditanya-tanya, atau mau langsung aku kasih saran praktis?`;
  }

  // 3. Mode didengerin saja
  if (daftarKata(["didengerin aja", "dengerin aja", "cuma mau cerita", "jangan ditanya", "gk usah ditanya", "gak usah ditanya", "pengen didengerin", "mau cerita aja", "temenin cerita"])) {
    modeObrolan = "dengerin";
    return pilihUnik([
      `Siap${panggil}, aku gak bakal banyak nanya-nanya kok. Tumpahin aja semuanya di sini pelan-pelan, aku beneran baca dan dengerin kamu 🤍`,
      `Oke${panggil}, aku di sini buat dengerin kamu sepenuhnya. Tulis aja sepuasnya apa yang lagi kamu rasain, gak perlu mikirin susunan katanya.`
    ]);
  }

  // 4. Permintaan solusi / saran langsung
  if (daftarKata(["terus gimana", "harus ngapain", "solusinya", "kasih saran", "minta saran", "bantu aku", "caranya gimana", "mending gimana", "saran praktis", "kasih solusi"])) {
    modeObrolan = "solusi";
