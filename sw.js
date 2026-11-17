<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sahabat Digital - Anti Cyberbullying</title>
  <link rel="manifest" href="manifest.json">
  <link rel="stylesheet" href="style.css">
</head>
<body>

<div id="notifPopup" class="notif-popup hidden">
  <span>🔔</span>
  <div>
    <b id="notifTitle">Judul</b>
    <p id="notifText">Isi</p>
    <button onclick="bukaMateriDariNotif()">Baca Materi ➜</button>
    <button onclick="tutupNotif()">Nanti</button>
  </div>
</div>

<header>
  <h1>💬 Sahabat Digital</h1>
  <p>Kamu tidak sendiri. Cerita aja, aman & rahasia.</p>
  <select id="pilihPeran">
    <option value="">Kamu siapa? Pilih dulu...</option>
    <option value="siswa">Saya Siswa (SMP/SMA)</option>
    <option value="mahasiswa">Saya Mahasiswa</option>
  </select>
  <br>
  <button id="btnNotif" class="btn-notif" onclick="aktifkanNotif()">🔔 Aktifkan Pengingat</button>
</header>

<section>
  <h2>📚 Materi Hari Ini</h2>
  <div class="materi-grid">
    <div class="card" onclick="bukaMateri('cyberbullying')">📱 Apa itu Cyberbullying?</div>
    <div class="card" onclick="bukaMateri('cara-hadapi')">🛡️ Cara Hadapi Bully Online</div>
    <div class="card" onclick="bukaMateri('selflove')">💖 Self Love & Tenang</div>
  </div>
</section>

<main id="chatBox"></main>

<div class="input-area">
  <input type="text" id="inputChat" placeholder="Tulis curhatan kamu di sini..." onkeypress="if(event.key==='Enter') kirimChat()">
  <button onclick="kirimChat()">Kirim</button>
</div>

<div id="modalMateri" class="modal hidden">
  <div class="modal-content">
    <button onclick="tutupMateri()" class="close-btn">X TUTUP</button>
    <h2 id="judulMateri"></h2>
    <p id="isiMateri"></p>
  </div>
</div>

<script src="https://js.puter.com/v2/"></script>
<script src="app.js"></script>
<script>
// ===== NOTIF LUAR WEB (MENGGUNAKAN FILE sw.js RESMI) =====
let swReg = null;

if ('serviceWorker' in navigator && 'Notification' in window) {
  navigator.serviceWorker.register('./sw.js').then((reg) => {
    swReg = reg;
  }).catch((err) => console.log('SW gagal:', err));
}

// Sembunyikan tombol jika izin sudah diberikan sebelumnya
const btnNotif = document.getElementById('btnNotif');
if ('Notification' in window && Notification.permission === 'granted' && btnNotif) {
  btnNotif.style.display = 'none';
}

function aktifkanNotif() {
  if (!('Notification' in window)) {
    alert('Browser ini tidak mendukung notifikasi.');
    return;
  }
  Notification.requestPermission().then((izin) => {
    if (izin === 'granted') {
      if (btnNotif) btnNotif.style.display = 'none';
      jadwalkanNotifLuar('💬 Sahabat Digital aktif!', 'Aku siap nemenin dan ngingetin kamu kalau lagi butuh cerita.', 1);
    }
  });
}

function jadwalkanNotifLuar(judul, isi, detik) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const pesan = { type: 'JADWAL_NOTIF', judul: judul, isi: isi, delay: detik * 1000 };
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(pesan);
  } else if (swReg && swReg.active) {
    swReg.active.postMessage(pesan);
  }
}

// Saat user pindah tab atau menekan tombol Home di HP
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    jadwalkanNotifLuar(
      '💬 Sahabat Digital kangen kamu!',
      'Eh jangan pergi dulu, kalo ada yang bikin kamu down, cerita ke aku ya. Klik buat balik lagi.',
      10
    );
  }
});

// Pengingat berkala setiap 1 jam jika web masih terbuka di background
setInterval(() => {
  if (document.hidden) {
    jadwalkanNotifLuar(
      '💖 Kamu berharga loh',
      'Udah sejam nih, gimana perasaanmu sekarang? Klik buat cerita lagi.',
      1
    );
  }
}, 60 * 60 * 1000);
</script>
</body>
</html>
