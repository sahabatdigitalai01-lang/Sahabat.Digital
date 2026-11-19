const HOTLINE_KAMU = "GANTI_NOMOR_HOTLINE";
const NAMA_KONSELOR_KAMPUS = "GANTI_NAMA_KONSELOR";
const WA_KONSELOR_KAMPUS = "62812xxxx";
const NAMA_GURU_BK = "GANTI_NAMA_GURU_BK";
const WA_GURU_BK = "62812xxxx";

const JEDA_BERPIKIR_AI_MS = 6000;

// Pengaturan pengingat otomatis: 1 hari 1 kali (24 jam)
const SATU_HARI_MS = 24 * 60 * 60 * 1000;
const KUNCI_NOTIF_HARIAN = "sahabat_digital_notif_harian_v1";

let namaUser = "";
let chatKe = 0;
let omonganTerakhir = "";
let omonganSebelumnya = "";
let sudahTanyaKapan = false;
let sudahTanyaTerberat = false;
let sudahTanyaMauApa = false;

const balasanSudahTampil = new Set();
const timerAIItem = new Map();

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
  if (!box) return;
  const div = document.createElement("div");
  div.className = siapa === "user" ? "bubble-user" : "bubble-bot";
  div.innerHTML = allowHtml ? teks : escapeHTML(teks);
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

const daftarSambutanWeb = [
  {
    judul: "💬 Selamat Datang di Sahabat Digital",
    text: "Hai! Sahabat Digital selalu ada buat dengerin cerita kamu. Tips anti cyberbullying: jangan balas emosi & simpan bukti perundungan.",
    materi: "cyberbullying"
  },
  {
    judul: "🌀 Sahabat Digital Menemani Kamu",
    text: "Lagi ngerasa tertinggal tren atau capek scrolling? Ingat, langkahmu punya ritme sendiri. Cerita aja bebas di sini.",
    materi: "fomo"
  },
  {
    judul: "🔐 Jaga Ruang Aman Digitalmu",
    text: "Kapan pun butuh teman cerita, aku di sini. Jangan lupa jaga password, 2FA, dan batasi info pribadi di media sosial ya.",
    materi: "keamanan-data"
  }
];

let notifTerakhir = "";
let timerTutupNotifMini = null;

function tampilkanPopupDalamWeb(judul, teks, materi = "cyberbullying", durasiMs = 9000) {
  const popup = document.getElementById("notifPopup");
  const titleEl = document.getElementById("notifTitle");
  const textEl = document.getElementById("notifText");
  if (!popup || !titleEl || !textEl) return;

  notifTerakhir = materi;
  titleEl.innerText = judul;
  textEl.innerText = teks;
  popup.classList.remove("hidden");

  if (timerTutupNotifMini) clearTimeout(timerTutupNotifMini);
  if (durasiMs > 0) {
    timerTutupNotifMini = setTimeout(() => {
      tutupNotif();
    }, durasiMs);
  }
}

function tampilkanPopupSambutanMasukWeb() {
  const sambutan = daftarSambutanWeb[Math.floor(Math.random() * daftarSambutanWeb.length)];
  tampilkanPopupDalamWeb(sambutan.judul, sambutan.text, sambutan.materi, 9000);
}

function tutupNotif() {
  if (timerTutupNotifMini) {
    clearTimeout(timerTutupNotifMini);
    timerTutupNotifMini = null;
  }
  const popup = document.getElementById("notifPopup");
  if (popup) popup.classList.add("hidden");
}

function bukaMateriDariNotif() {
  tutupNotif();
  if (notifTerakhir) bukaMateri(notifTerakhir);
}

const dataMateri = {
  "cyberbullying": {
    judul: "📱 Cyberbullying",
    isi: "Cyberbullying adalah perundungan lewat HP/internet: komentar menghina, penyebaran foto/chat tanpa izin, pengucilan di grup, atau ancaman lewat DM. Langkah terhindar: jangan balas emosi, screenshot bukti, blokir & laporkan akun pelaku, serta cerita ke guru BK, konselor, atau orang dewasa tepercaya."
  },
  "fomo": {
    judul: "🌀 FOMO (Fear of Missing Out)",
    isi: "FOMO adalah rasa cemas atau takut tertinggal momen, tren, atau aktivitas orang lain di media sosial. Langkah mengatasinya: sadar bahwa media sosial hanya menampilkan cuplikan pilihan, batasi waktu scrolling, fokus pada prioritas & kebutuhan dirimu sendiri, dan beri jeda rehat dari layar."
  },
  "keamanan-data": {
    judul: "🔐 Keamanan Data Digital",
    isi: "Keamanan data digital melindungi informasi pribadi dan akunmu dari penyalahgunaan atau peretasan. Langkah aman: gunakan password yang kuat dan berbeda tiap akun, aktifkan autentikasi dua langkah (2FA), jangan bagikan kode OTP/alamat/data sensitif sembarangan, dan hati-hati terhadap tautan mencurigakan."
  }
};

function bukaMateri(k) {
  if (!dataMateri[k]) return;
  document.getElementById("judulMateri").innerText = dataMateri[k].judul;
  document.getElementById("isiMateri").innerText = dataMateri[k].isi;
  document.getElementById("modalMateri").classList.remove("hidden");
}

function tutupMateri() {
  document.getElementById("modalMateri").classList.add("hidden");
}

document.getElementById("modalMateri").addEventListener("click", (e) => {
  if (e.target.id === "modalMateri") tutupMateri();
});

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
    status
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

function apakahItemDitahanAtauSudahDijawabAdmin(idUnik) {
  const data = JSON.parse(localStorage.getItem("database_curhat") || "[]");
  const item = data.find((d) => d.id === idUnik);
  if (!item) return true;
  if (item.tahanAI === true) return true;
  if (item.pengirimBalasan === "Admin" && item.balasan && item.balasan !== "-") return true;
  return false;
}

const kataBahaya = [
  "mati", "bunuh", "bunuh diri", "pengen mati", "mau mati",
  "lukai diri", "self harm", "cutting", "gak mau hidup", "pengen hilang"
];

function cekBahaya(t) {
  return kataBahaya.some((k) => t.toLowerCase().includes(k));
}

function kirimChat() {
  const input = document.getElementById("inputChat");
  const teks = input.value.trim();
  if (!teks) return;

  tambahBubble(teks, "user", false);
  input.value = "";
  chatKe++;
  omonganSebelumnya = omonganTerakhir;
  omonganTerakhir = teks;
  resetTimerDiem();

  if (cekBahaya(teks)) {
    const peran = document.getElementById("pilihPeran").value;
    const nama = escapeHTML(namaUser || "Kamu");
    const hotlineSafe = escapeHTML(HOTLINE_KAMU);
    const konselorSafe = escapeHTML(NAMA_KONSELOR_KAMPUS);
    const guruSafe = escapeHTML(NAMA_GURU_BK);

    let pesanHtml = "";
    if (peran === "mahasiswa") {
      pesanHtml = `🚨 ${nama}, aku khawatir banget. Yuk ke konselor kampus: ${konselorSafe} <a href="https://wa.me/${encodeURIComponent(WA_KONSELOR_KAMPUS)}" target="_blank" rel="noopener noreferrer">Chat Konselor</a> / Hotline: ${hotlineSafe}`;
    } else if (peran === "siswa") {
      pesanHtml = `🚨 ${nama}, aku khawatir banget. Yuk ke Guru BK: ${guruSafe} <a href="https://wa.me/${encodeURIComponent(WA_GURU_BK)}" target="_blank" rel="noopener noreferrer">Chat Guru BK</a> / Hotline: ${hotlineSafe}`;
    } else {
      pesanHtml = `🚨 Aku khawatir sama kamu. Pilih dulu di atas kamu siswa/mahasiswa. Hotline: ${hotlineSafe}`;
    }

    tambahBubble(pesanHtml, "bot", true);
    simpanKeDatabase(teks, "DARURAT", "BERBAHAYA", "AI", false, 0);
    return;
  }

  const deadlineAI = Date.now() + JEDA_BERPIKIR_AI_MS;
  const idChat = simpanKeDatabase(teks, "-", "sedang menyiapkan balasan", "AI", false, deadlineAI);
  const balasanAI = buatBalasan(teks);

  const timerId = setTimeout(() => {
    timerAIItem.delete(idChat);
    if (apakahItemDitahanAtauSudahDijawabAdmin(idChat)) {
      updateItemDatabase(idChat, { status: "sedang menyiapkan balasan", aiBerpikirSampai: 0 });
      return;
    }
    tambahBubble(balasanAI, "bot", false);
    updateItemDatabase(idChat, {
      balasan: balasanAI,
      pengirimBalasan: "AI",
      aiBerpikirSampai: 0,
      status: "aman"
    });
  }, JEDA_BERPIKIR_AI_MS);

  timerAIItem.set(idChat, timerId);
}

function buatBalasan(teks) {
  const t = teks.toLowerCase().trim();
  const panggil = namaUser ? `, ${namaUser}` : "";
  const ucap = teks.length > 60 ? teks.slice(0, 60) + "..." : teks;

  if (t.includes("namaku") || t.includes("nama ku") || t.includes("panggil aku")) {
    const kata = teks.replace(/namaku|nama ku|panggil aku/gi, "").trim().split(/\s+/);
    let n = kata[kata.length - 1] || "";
    n = n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
    if (n.length >= 2) {
      namaUser = n;
      return `Hai ${n}! Seneng kenal kamu di Sahabat Digital 💖 Oke ${n}, ceritain aja bebas, apa yang lagi ada di pikiran kamu sekarang?`;
    }
  }

  if ((t === "halo" || t === "hai" || t === "hi" || t.includes("halo")) && chatKe <= 2 && !namaUser) {
    return "Haiii! Selamat datang di Sahabat Digital 💖 Sebelum cerita, boleh kenalan dulu gak? Namamu siapa?";
  }

  if (teks.length <= 12) {
    if (["iya", "ya", "hehe", "hmm", "oke", "iya sih", "bener", "banget"].includes(t)) {
      if (omonganSebelumnya) {
        return `Iya ya${panggil}, jadi pas kamu bilang "${omonganSebelumnya}" tadi itu, yang paling kerasa tuh apanya? Yang di badan, di pikiran, atau di hati?`;
      }
      return `Iya${panggil}, aku dengerin kok. Coba ceritain 1 kalimat lagi, yang paling jujur, apa yang bikin kamu ngerasa gitu?`;
    }
    if (["gak", "nggak", "ga", "tidak", "gatau", "gak tau", "bingung"].includes(t)) {
      return `Wajar kok kalo masih bingung${panggil}. Coba gini aja, dari yang kamu ceritain tadi "${omonganSebelumnya || ucap}", bagian mana yang paling bikin kamu kepikiran sampe sekarang?`;
    }
    if (["cape", "capek", "lelah"].includes(t)) {
      return `Cape ya${panggil}... cape yang gimana? Cape badannya kayak habis ngapa-ngapain terus, atau cape pikirannya karena kebanyakan mikir? Ceritain deh, hari ini kamu ngapain aja sampe cape gitu?`;
    }
    return `Oke${panggil}, kamu bilang "${ucap}". Boleh ceritain lebih panjang dikit? Kejadiannya gimana, terus kamu ngerasanya gimana pas itu?`;
  }

  let perasaan = "";
  if (t.includes("cape") || t.includes("lelah") || t.includes("pusing")) perasaan = "cape";
  else if (t.includes("sedih") || t.includes("nangis") || t.includes("down") || t.includes("sepi") || t.includes("sendiri")) perasaan = "sedih";
  else if (t.includes("marah") || t.includes("kesel") || t.includes("sebel") || t.includes("benci") || t.includes("jengkel")) perasaan = "marah";
  else if (t.includes("takut") || t.includes("cemas") || t.includes("khawatir") || t.includes("panik") || t.includes("overthinking") || t.includes("gak bisa tidur")) perasaan = "cemas";
  else if (t.includes("bingung") || t.includes("galau") || t.includes("gatau") || t.includes("gak tau")) perasaan = "bingung";
  else if (t.includes("senang") || t.includes("seneng") || t.includes("happy") || t.includes("lega")) perasaan = "senang";
  else if (t.includes("bully") || t.includes("dibully") || t.includes("dihina") || t.includes("dikatain") || t.includes("diejek") || t.includes("dikucilin")) perasaan = "dibully";
  else if (t.includes("pacar") || t.includes("doi") || t.includes("gebetan") || t.includes("mantan") || t.includes("dicuekin") || t.includes("gak dibales") || t.includes("putus")) perasaan = "pacar";
  else if (t.includes("tugas") || t.includes("kuliah") || t.includes("sekolah") || t.includes("ujian") || t.includes("nilai") || t.includes("skripsi") || t.includes("dosen") || t.includes("guru")) perasaan = "sekolah";
  else if (t.includes("keluarga") || t.includes("ortu") || t.includes("mama") || t.includes("papa") || t.includes("ayah") || t.includes("ibu") || t.includes("kakak")) perasaan = "keluarga";
  else if (t.includes("teman") || t.includes("temen") || t.includes("sahabat") || t.includes("grup")) perasaan = "teman";

  if (perasaan && !sudahTanyaKapan) {
    sudahTanyaKapan = true;
    if (perasaan === "cape") return `Cape ya${panggil}, aku ngerti kok rasanya. Kamu bilang "${ucap}"... cape nya itu karena apa? Hari ini ada kejadian apa, atau udah numpuk dari beberapa hari ini?`;
    if (perasaan === "dibully") return `Ya ampun${panggil}, pantesan kamu kepikiran. Kamu bilang "${ucap}". Yang ngelakuin itu siapa? Terus dia ngomongnya di mana, di chat atau langsung?`;
    if (perasaan === "pacar") return `Ooh jadi ini soal pacar ya${panggil}. Kamu bilang "${ucap}". Yang bikin kamu paling kepikiran tuh chatnya, sikapnya, atau karena kamu nungguin kabar dari dia?`;
    if (perasaan === "sedih") return `Denger kamu bilang "${ucap}" aku ikut sedih${panggil}. Sedihnya itu karena kejadian hari ini, atau udah numpuk dari lama? Ceritain pelan-pelan aja.`;
    if (perasaan === "marah") return `Wah kedengeran kesel banget ya${panggil}. Kamu bilang "${ucap}". Yang bikin paling kesel tuh omongannya, atau sikapnya yang kayak gak peduli?`;
    if (perasaan === "cemas") return `Aku denger kamu lagi cemas ya${panggil}. Kamu bilang "${ucap}". Yang paling bikin kamu kepikiran tuh apanya? Coba ceritain yang paling bikin deg-degan.`;
    if (perasaan === "bingung") return `Wajar kok bingung${panggil}. Kamu bilang "${ucap}". Yang bikin kamu paling bingung tuh harus milih apa, atau harus ngapain?`;
    if (perasaan === "senang") return `Eh seneng dengernya${panggil}! Kamu bilang "${ucap}". Ceritain dong, apa yang bikin kamu seneng gitu? Aku ikut seneng!`;
    if (perasaan === "sekolah") return `Oke, soal sekolah/kuliah ya${panggil}. Kamu bilang "${ucap}". Yang paling bikin pusing tuh tugasnya, orangnya, atau deadline-nya?`;
    if (perasaan === "keluarga") return `Oke soal keluarga ya${panggil}. Kamu bilang "${ucap}". Yang bikin kamu paling kepikiran tuh omongan siapa? Terus kejadiannya kapan?`;
    if (perasaan === "teman") return `Oke soal temen ya${panggil}. Kamu bilang "${ucap}". Temen yang mana? Yang deket banget sama kamu, atau temen satu circle? Terus dia ngapain?`;
  }

  if (sudahTanyaKapan && !sudahTanyaTerberat) {
    sudahTanyaTerberat = true;
    return `Oke aku tangkep${panggil}, jadi ceritanya "${ucap}" ya. Dari semua itu, bagian mana yang paling bikin kamu kepikiran sampe sekarang? Yang paling nusuk di hati?`;
  }

  if (sudahTanyaTerberat && !sudahTanyaMauApa) {
    sudahTanyaMauApa = true;
    return `Makasih udah jujur bilang "${ucap}" ya${panggil}, kamu hebat loh udah berani cerita. Sekarang kamu pengen apa? Mau aku temenin cerita aja sampe lega, mau cari solusi bareng, atau mau aku kasih cara biar agak tenangan dulu?`;
  }

  const lanjut = [
    `Oke${panggil}, jadi kamu bilang "${ucap}" ya. Terus abis itu gimana? Apa yang kamu lakuin setelah itu?`,
    `Hmm aku dengerin${panggil}. Kamu bilang "${ucap}". Pas itu terjadi, perasaan kamu jadi gimana? Masih sesek, atau udah agak lega karena udah cerita ke aku?`,
    `Aku paham${panggil}. Jadi intinya "${ucap}" itu yang paling nempel di pikiran kamu ya. Kalo kamu bisa ngomong jujur ke orangnya langsung, kamu pengen ngomong apa?`,
    `Oke${panggil}, aku catet ya, kamu bilang "${ucap}". Kalo kejadian itu keulang lagi besok, kamu pengen ngapain? Diademin, dilawan, atau diceritain ke orang yang kamu percaya?`
  ];
  return lanjut[Math.floor(Math.random() * lanjut.length)];
}

tambahBubble("Hai! Aku Sahabat Digital 💖 Kenalan dulu yuk, namamu siapa? Cerita aja bebas, apa aja boleh, aku dengerin.", "bot", false);

const daftarPengingatBerkala = [
  {
    judul: "💬 Sahabat Digital • Teman Cerita Kamu",
    isi: "Kapan pun kamu butuh teman cerita, Sahabat Digital selalu ada buatmu. Tips anti cyberbullying: jangan balas emosi & simpan bukti perundungan.",
    materi: "cyberbullying"
  },
  {
    judul: "🌀 Sahabat Digital • Jangan Terjebak FOMO",
    isi: "Tiap orang punya prosesnya sendiri. Yuk rehat sejenak dari scrolling berlebihan & cerita kalau lagi merasa tertinggal atau cemas.",
    materi: "fomo"
  },
  {
    judul: "🔐 Sahabat Digital • Keamanan Data Digital",
    isi: "Pakai password kuat, aktifkan 2FA, dan jangan bagikan info pribadi sembarangan. Sahabat Digital siap nemenin kamu cerita kapan saja.",
    materi: "keamanan-data"
  }
];

function sudahKirimNotifHariIni() {
  const terakhir = Number(localStorage.getItem(KUNCI_NOTIF_HARIAN) || "0");
  if (!terakhir) return false;
  return Date.now() - terakhir < SATU_HARI_MS;
}

function tandaiNotifHariIniTerkirim() {
  localStorage.setItem(KUNCI_NOTIF_HARIAN, String(Date.now()));
}

function tampilkanNotifSistemLangsung(judul, isi, materiKlik) {
  if (!("Notification" in window) || Notification.permission !== "granted") return false;
  try {
    const notif = new Notification(judul, {
      body: isi,
      icon: "https://cdn-icons-png.flaticon.com/512/2343/2343697.png",
      tag: "sahabat-digital-harian-" + Date.now()
    });
    notif.onclick = function () {
      window.focus();
      if (materiKlik) bukaMateri(materiKlik);
      notif.close();
    };
    return true;
  } catch (err) {
    return false;
  }
}

function kirimNotifLuarSekaliSehari(judul, isi, materiKlik, paksaManual = false) {
  if (!("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;
  if (!paksaManual && sudahKirimNotifHariIni()) return false;

  const tampil = tampilkanNotifSistemLangsung(judul, isi, materiKlik);
  if (tampil) {
    tandaiNotifHariIniTerkirim();
  }
  return tampil;
}

function perbaruiStatusPengingat() {
  const titleEl = document.getElementById("statusPengingatTitle");
  const textEl = document.getElementById("statusPengingatText");
  const btnEl = document.getElementById("btnAktifkanPengingat");
  if (!titleEl || !textEl || !btnEl) return;

  if (!("Notification" in window)) {
    titleEl.innerText = "🔔 Aktifkan Notifikasi";
    textEl.innerText = "Browser ini tidak mendukung notifikasi.";
    btnEl.disabled = true;
    btnEl.innerText = "Tidak Tersedia";
    btnEl.classList.remove("aktif");
    return;
  }

  btnEl.disabled = false;

  if (Notification.permission === "granted") {
    titleEl.innerText = "🔔 Aktifkan Notifikasi";
    textEl.innerText = "Notifikasi aktif (1 hari 1 kali).";
    btnEl.innerText = "Notifikasi Aktif";
    btnEl.classList.add("aktif");
  } else if (Notification.permission === "denied") {
    titleEl.innerText = "🔔 Aktifkan Notifikasi";
    textEl.innerText = "Notifikasi diblokir. Izinkan di pengaturan browser.";
    btnEl.innerText = "Aktifkan Notifikasi";
    btnEl.classList.remove("aktif");
  } else {
    titleEl.innerText = "🔔 Aktifkan Notifikasi";
    textEl.innerText = "Aktifkan notifikasi untuk menerima pengingat 1 hari 1 kali.";
    btnEl.innerText = "Aktifkan Notifikasi";
    btnEl.classList.remove("aktif");
  }
}

async function aktifkanPengingatManual() {
  if (!("Notification" in window)) {
    perbaruiStatusPengingat();
    return;
  }

  if (Notification.permission === "denied") {
    perbaruiStatusPengingat();
    return;
  }

  if (Notification.permission === "granted") {
    const pilihan = daftarPengingatBerkala[Math.floor(Math.random() * daftarPengingatBerkala.length)];
    tampilkanPopupDalamWeb(pilihan.judul, pilihan.isi, pilihan.materi, 9000);
    kirimNotifLuarSekaliSehari(pilihan.judul, pilihan.isi, pilihan.materi, true);
    perbaruiStatusPengingat();
    return;
  }

  const izin = await Notification.requestPermission();
  perbaruiStatusPengingat();

  if (izin === "granted") {
    const pilihan = daftarPengingatBerkala[Math.floor(Math.random() * daftarPengingatBerkala.length)];
    tampilkanPopupDalamWeb(pilihan.judul, pilihan.isi, pilihan.materi, 9000);
    kirimNotifLuarSekaliSehari(pilihan.judul, pilihan.isi, pilihan.materi, true);
  }
}

setInterval(() => {
  const data = JSON.parse(localStorage.getItem("database_curhat") || "[]");
  if (!data.length) return;

  data.forEach((item, idx) => {
    if ((item.tahanAI || item.pengirimBalasan === "Admin") && item.id && timerAIItem.has(item.id)) {
      clearTimeout(timerAIItem.get(item.id));
      timerAIItem.delete(item.id);
    }

    if (
      item.pengirimBalasan === "Admin" &&
      item.balasan &&
      item.balasan !== "-" &&
      item.balasanAdminTimestamp
    ) {
      const kunciBalasan = `${item.id || idx}::${item.balasanAdminTimestamp}`;
      if (!balasanSudahTampil.has(kunciBalasan)) {
        balasanSudahTampil.add(kunciBalasan);
        tambahBubble(item.balasan, "bot", false);
      }
    }
  });
}, 1000);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });

  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data && event.data.type === "BUKA_MATERI" && event.data.materi) {
      bukaMateri(event.data.materi);
    }
  });
}

window.addEventListener("load", () => {
  perbaruiStatusPengingat();
  setTimeout(() => {
    tampilkanPopupSambutanMasukWeb();
  }, 1200);

  if ("Notification" in window && Notification.permission === "granted") {
    const pilihan = daftarPengingatBerkala[Math.floor(Math.random() * daftarPengingatBerkala.length)];
    kirimNotifLuarSekaliSehari(pilihan.judul, pilihan.isi, pilihan.materi, false);
  }
});

const paramsMateri = new URLSearchParams(window.location.search).get("materi");
if (paramsMateri && dataMateri[paramsMateri]) {
  setTimeout(() => bukaMateri(paramsMateri), 300);
}

// ===== NOTIF 1 HARI 1 KALI =====

if ("Notification" in window && Notification.permission === "default") {
  setTimeout(() => {
    Notification.requestPermission().then((izin) => {
      perbaruiStatusPengingat();
      if (izin === "granted") {
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

document.addEventListener("visibilitychange", () => {
  if (document.hidden && "Notification" in window && Notification.permission === "granted") {
    const pilihan = daftarPengingatBerkala[Math.floor(Math.random() * daftarPengingatBerkala.length)];
    kirimNotifLuarSekaliSehari(pilihan.judul, pilihan.isi, pilihan.materi, false);
  }
});

let timerDiem;
function resetTimerDiem() {
  clearTimeout(timerDiem);
  timerDiem = setTimeout(() => {
    const pilihan = daftarPengingatBerkala[Math.floor(Math.random() * daftarPengingatBerkala.length)];
    kirimNotifLuarSekaliSehari(
      "💖 Masih di sini kok",
      "Kamu tadi cerita soal itu, gimana sekarang? Udah agak lega belum?",
      pilihan.materi,
      false
    );
  }, 2 * 60 * 1000);
}

const kirimChatLama = kirimChat;
kirimChat = function () {
  kirimChatLama();
  resetTimerDiem();
};
