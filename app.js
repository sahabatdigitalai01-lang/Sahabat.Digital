const HOTLINE_KAMU = "GANTI_NOMOR_HOTLINE";
const NAMA_KONSELOR_KAMPUS = "GANTI_NAMA_KONSELOR";
const WA_KONSELOR_KAMPUS = "62812xxxx";
const NAMA_GURU_BK = "GANTI_NAMA_GURU_BK";
const WA_GURU_BK = "62812xxxx";

let namaUser = "";
let chatKe = 0;
let omonganTerakhir = "";
let omonganSebelumnya = "";
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
    judul: "🌿 Self Love & Tenang",
    isi: "Tarik napas 4 detik, tahan 7 detik, buang 8 detik. Ulangi 3x. Minum air, jauhkan HP 10 menit, dengerin lagu yang kamu suka."
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

const kataBahaya = ["mati", "bunuh", "bunuh diri", "pengen mati", "mau mati", "lukai diri", "self harm", "cutting", "gak mau hidup", "pengen hilang"];
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

function buatBalasan(teks) {
  let t = teks.toLowerCase().trim();
  let panggil = namaUser ? `, ${namaUser}` : "";
  let ucap = teks.length > 60 ? teks.slice(0, 60) + "..." : teks;

  if (t.includes("namaku") || t.includes("nama ku") || t.includes("panggil aku")) {
    let kata = teks.replace(/namaku|nama ku|panggil aku/gi, "").trim().split(" ");
    let n = kata[kata.length - 1] || "";
    n = n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
    if (n.length >= 2) {
      namaUser = n;
      return `Hai ${n}! Seneng kenal kamu ✨ Oke ${n}, ceritain aja bebas, apa yang lagi ada di pikiran kamu sekarang?`;
    }
  }

  if ((t === "halo" || t === "hai" || t === "hi" || t.includes("halo")) && chatKe <= 2 && !namaUser) {
    return `Haiii! Selamat datang ✨ Aku Sahabat Digital. Sebelum cerita, boleh kenalan dulu gak? Namamu siapa?`;
  }

  if (teks.length <= 12) {
    if (t === "iya" || t === "ya" || t === "hehe" || t === "hmm" || t === "oke" || t === "iya sih" || t === "bener" || t === "banget") {
      if (omonganSebelumnya) return `Iya ya${panggil}, jadi pas kamu bilang "${omonganSebelumnya}" tadi itu, yang paling kerasa tuh apanya? Yang di badan, di pikiran, atau di hati?`;
      return `Iya${panggil}, aku dengerin kok. Coba ceritain 1 kalimat lagi, yang paling jujur, apa yang bikin kamu ngerasa gitu?`;
    }
    if (t === "gak" || t === "nggak" || t === "ga" || t === "tidak" || t === "gatau" || t === "gak tau" || t === "bingung") {
      return `Wajar kok kalo masih bingung${panggil}. Coba gini aja, dari yang kamu ceritain tadi "${omonganSebelumnya || ucap}", bagian mana yang paling bikin kamu kepikiran sampe sekarang?`;
    }
    if (t === "cape" || t === "capek" || t === "lelah") {
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

  let lanjut = [
    `Oke${panggil}, jadi kamu bilang "${ucap}" ya. Terus abis itu gimana? Apa yang kamu lakuin setelah itu?`,
    `Hmm aku dengerin${panggil}. Kamu bilang "${ucap}". Pas itu terjadi, perasaan kamu jadi gimana? Masih sesek, atau udah agak lega karena udah cerita ke aku?`,
    `Aku paham${panggil}. Jadi intinya "${ucap}" itu yang paling nempel di pikiran kamu ya. Kalo kamu bisa ngomong jujur ke orangnya langsung, kamu pengen ngomong apa?`,
    `Oke${panggil}, aku catet ya, kamu bilang "${ucap}". Kalo kejadian itu keulang lagi besok, kamu pengen ngapain? Diademin, dilawan, atau diceritain ke orang yang kamu percaya?`
  ];
  return lanjut[Math.floor(Math.random() * lanjut.length)];
}

tambahBubble("Hai! Aku Sahabat Digital ✨ Kenalan dulu yuk, namamu siapa? Cerita aja bebas, apa aja boleh, aku dengerin.", "bot");

// ===== NOTIF DI LUAR WEB - SAHABAT DIGITAL (VIA SERVICE WORKER) =====
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(reg => console.log('Service Worker Sahabat Digital siap:', reg.scope))
    .catch(err => console.error('Gagal daftar SW:', err));

  // Tangkap sinyal saat notifikasi dari sw.js diklik
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'BUKA_MATERI') {
      bukaMateri(event.data.materi);
    }
  });
}

// Buka materi otomatis jika web dibuka lewat klik notifikasi (?materi=...)
const urlParams = new URLSearchParams(window.location.search);
const materiDariNotif = urlParams.get('materi');
if (materiDariNotif) {
  bukaMateri(materiDariNotif);
}

function mintaIzinNotif() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission().then(izin => {
      if (izin === "granted") {
        kirimNotifViaSW(
          "💬 Sahabat Digital aktif!",
          "Nanti kalo kamu sedih atau butuh teman cerita, aku bakal ngingetin kamu ya.",
          "selflove"
        );
      }
    });
  }
}

document.addEventListener("click", mintaIzinNotif, { once: true });

function kirimNotifViaSW(judul, isi, materiKlik) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  navigator.serviceWorker.ready.then(registration => {
    registration.showNotification(judul, {
      body: isi,
      icon: "https://cdn-icons-png.flaticon.com/512/2343/2343697.png",
      tag: "sahabat-digital",
      data: { materi: materiKlik }
    });
  });
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    setTimeout(() => {
      kirimNotifViaSW(
        "💬 Sahabat Digital kangen kamu!",
        "Eh jangan pergi dulu, kalo ada yang bikin kamu down, cerita ke aku ya.",
        "selflove"
      );
    }, 10000);
  }
});

let timerDiem;
function resetTimerDiem() {
  clearTimeout(timerDiem);
  timerDiem = setTimeout(() => {
    kirimNotifViaSW(
      "🌿 Sahabat Digital masih di sini",
      "Kamu tadi cerita soal itu, gimana sekarang? Udah agak lega belum?",
      "selflove"
    );
  }, 2 * 60 * 1000);
}

let kirimChatLama = kirimChat;
kirimChat = function() {
  kirimChatLama();
  resetTimerDiem();
};
