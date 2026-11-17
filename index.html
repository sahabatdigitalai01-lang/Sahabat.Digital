<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Teman Curhat - Anti Cyberbullying</title>
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
  <h1>💬 Teman Curhat</h1>
  <p>Kamu tidak sendiri. Cerita aja, aman & rahasia.</p>
  <select id="pilihPeran">
    <option value="">Kamu siapa? Pilih dulu...</option>
    <option value="siswa">Saya Siswa (SMP/SMA)</option>
    <option value="mahasiswa">Saya Mahasiswa</option>
  </select>
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

<<script src="https://js.puter.com/v2/"></script>
<script src="app.js"></script>
<script>
// ===== NOTIF LUAR WEB - MUNCUL WALAUPUN UDAH KELUAR =====
if ('serviceWorker' in navigator && 'Notification' in window) {
  const kodeSW = `
    self.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'JADWAL_NOTIF') {
        setTimeout(() => {
          self.registration.showNotification(e.data.judul, {
            body: e.data.isi,
            icon: 'https://cdn-icons-png.flaticon.com/512/2343/2343697.png',
            tag: 'teman-curhat',
            vibrate: [200, 100, 200]
          });
        }, e.data.delay);
      }
    });
    self.addEventListener('notificationclick', (event) => {
      event.notification.close();
      event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
          if (clientList.length > 0) return clientList[0].focus();
          return clients.openWindow('/');
        })
      );
    });
  `;
  const blob = new Blob([kodeSW], { type: 'application/javascript' });
  const urlSW = URL.createObjectURL(blob);
  navigator.serviceWorker.register(urlSW).then((reg) => {
    if (Notification.permission === 'default') {
      setTimeout(() => { Notification.requestPermission(); }, 3000);
    }
    function jadwalkanNotifLuar(judul, isi, detik) {
      if (Notification.permission !== 'granted') return;
      const pesan = { type: 'JADWAL_NOTIF', judul: judul, isi: isi, delay: detik * 1000 };
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(pesan);
      } else if (reg.active) {
        reg.active.postMessage(pesan);
      }
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        jadwalkanNotifLuar('💬 Teman Curhat kangen kamu!', 'Eh jangan pergi dulu, kalo ada yang bikin kamu down, cerita ke aku ya. Klik buat balik lagi.', 10);
      }
    });
    window.addEventListener('pagehide', () => {
      jadwalkanNotifLuar('💖 Kamu berharga loh', 'Udah sejam nih, gimana perasaanmu sekarang? Klik buat cerita lagi.', 10);
    });
    setInterval(() => {
      jadwalkanNotifLuar('📱 Yuk baca materi hari ini', 'Ada materi baru soal cyberbullying, klik buat baca.', 1);
    }, 60 * 60 * 1000);
  });
}
</script>
</body>
</html>
