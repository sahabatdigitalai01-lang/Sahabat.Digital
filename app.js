let namaUser = "";
let chatKe = 0;
let omonganTerakhir = "";
let omonganSebelumnya = "";
let topikTerakhir = ""; // Menyimpan konteks topik yang sedang dibahas
let modeObrolan = "netral"; // "netral" | "dengerin" | "solusi"
let balasanTerakhir = ""; // Mencegah bot mengulang kalimat yang sama persis
let sudahTanyaKapan = false;
let sudahTanyaTerberat = false;
let sudahTanyaMauApa = false;

function buatBalasan(teks) {
  let t = teks.toLowerCase().trim();
  let panggil = namaUser ? `, ${namaUser}` : "";

  const daftarKata = (daftar) => daftar.some(k => t.includes(k));

  // Helper agar bot tidak pernah mengulang jawaban yang sama berturut-turut
  const pilihUnik = (pilihan) => {
    let kandidat = pilihan.filter(p => p !== balasanTerakhir);
    if (kandidat.length === 0) kandidat = pilihan;
    let terpilih = kandidat[Math.floor(Math.random() * kandidat.length)];
    balasanTerakhir = terpilih;
    return terpilih;
  };

  // Fungsi deteksi topik/perasaan
  const deteksiTopik = (kalimat) => {
    if (["bully", "dibully", "dihina", "dikatain", "diejek", "dikucilin", "aib", "disebar", "dihujat", "fitnah", "diancam", "dikick", "akun fake", "hate comment", "spill"].some(k => kalimat.includes(k))) return "dibully";
    if (["insecure", "minder", "gak pede", "gk pede", "jelek", "malu", "gak berguna", "gagal", "bandingin"].some(k => kalimat.includes(k))) return "insecure";
    if (["takut", "cemas", "khawatir", "panik", "overthinking", "ovt", "gak bisa tidur", "gk bisa tidur", "deg-degan", "gelisah"].some(k => kalimat.includes(k))) return "cemas";
    if (["sedih", "nangis", "down", "sepi", "kesepian", "sendiri", "hampa", "kecewa", "sakit hati", "sesek"].some(k => kalimat.includes(k))) return "sedih";
    if (["marah", "kesel", "sebel", "benci", "jengkel", "emosi", "muak", "gedek", "anjing", "bangsat", "anjir", "parah banget"].some(k => kalimat.includes(k))) return "marah";
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

  // 1. TANGKAP NAMA USER (Dengan perlindungan agar kata emosi tidak dianggap nama)
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

  // 2. TANGANI PROTES / JAWABAN BOT DIANGGAP KAKU ("gk jelas", "gaje", "bot ya")
  if (daftarKata(["gk jelas", "gak jelas", "ga jelas", "gaje", "apaan sih", "ngaco", "gak nyambung", "gk nyambung", "template", "kayak bot", "robot"])) {
    if (topikTerakhir === "dibully") {
      return `Maaf ya${panggil} kalau responsku barusan kurang pas 🙏 Maksudku cuma pengen pastiin kamu aman. Kalau gak mau ditanya-tanya, kamu bisa langsung baca panduan di menu "Cara Hadapi Bully Online" di atas, atau tumpahin aja kekesalanmu di sini.`;
    }
    return `Maaf banget ya${panggil} kalau jawabanku tadi berasa kurang nyambung 🙏 Biar aku gak salah tangkep, sekarang kamu maunya gimana: cukup didengerin aja tanpa ditanya-tanya, atau mau langsung aku kasih saran praktis?`;
  }

  // 3. TANGANI PILIHAN MODE OBROLAN: USER INGIN DIDENGERIN SAJA
  if (daftarKata(["didengerin aja", "dengerin aja", "cuma mau cerita", "jangan ditanya", "gk usah ditanya", "gak usah ditanya", "pengen didengerin", "mau cerita aja", "temenin cerita"])) {
    modeObrolan = "dengerin";
    return pilihUnik([
      `Siap${panggil}, aku gak bakal banyak nanya-nanya kok. Tumpahin aja semuanya di sini pelan-pelan, aku beneran baca dan dengerin kamu 🤍`,
      `Oke${panggil}, aku di sini buat dengerin kamu sepenuhnya. Tulis aja sepuasnya apa yang lagi kamu rasain, gak perlu mikirin susunan katanya.`
    ]);
  }

  // 4. TANGANI PERMINTAAN SOLUSI / SARAN LANGSUNG
  if (daftarKata(["terus gimana", "harus ngapain", "solusinya", "kasih saran", "minta saran", "bantu aku", "caranya gimana", "mending gimana", "saran praktis", "kasih solusi"])) {
    modeObrolan = "solusi";
    if (topikTerakhir === "dibully") {
      return `Oke${panggil}, ini 3 langkah paling aman buat kamu sekarang:\n1. Jangan bales pakai emosi (pelaku emang mancing reaksi kamu).\n2. Screenshot semua bukti chat/komentar beserta username pelakunya.\n3. Blokir & report akunnya, lalu ceritain ke Guru BK atau Konselor biar kamu gak hadapin ini sendirian.`;
    }
    if (topikTerakhir === "cemas" || topikTerakhir === "sedih" || topikTerakhir === "cape") {
      return `Coba lakuin 3 hal kecil ini dulu ya${panggil}: jauhkan layar HP 10 menit, minum segelas air putih, lalu tarik napas dalam 3 kali. Kamu gak harus nyelesaiin semua masalah hari ini juga, istirahat dulu itu valid.`;
    }
    if (topikTerakhir === "insecure") {
      return `Pelan-pelan ya${panggil}. Coba batasi dulu lihat postingan orang yang bikin kamu ngebandingin diri, lalu inget 1 hal kecil yang udah berhasil kamu lewatin minggu ini. Nilai diri kamu gak ditentukan sama komentar orang lain.`;
    }
    if (topikTerakhir === "teman" || topikTerakhir === "pacar") {
      return `Kalau situasinya bikin batin kamu capek${panggil}, ambil jarak sejenak itu bukan berarti kamu jahat. Kasih waktu buat dirimu tenang dulu sebelum mutusin mau ngobrol baik-baik atau jaga batasan.`;
    }
    if (topikTerakhir === "sekolah") {
      return `Biar gak kerasa numpuk banget${panggil}, coba pecah tugasnya jadi bagian paling kecil dulu—kerjain 15 menit aja tanpa target harus langsung beres semua. Yang penting mulai pelan-pelan.`;
    }
    return `Boleh${panggil}, biar saranku pas sama kondisi kamu, kasih tau dikit aja: ini lagi soal perundungan online, pertemanan, keluarga, atau tugas sekolah/kuliah?`;
  }

  // 5. TANGANI JIKA USER MALAS / BELUM SIAP CERITA
  if (daftarKata(["males cerita", "gk mau cerita", "gak mau cerita", "susah jelasin", "capek ngetik", "nanti aja", "rahasia", "bingung mau cerita"])) {
    return pilihUnik([
      `Gak apa-apa banget kok${panggil}, kamu gak harus cerita semuanya sekarang. Kalau lagi penat, tarik napas 4 detik, tahan 7 detik, buang pelan 8 detik ya. Aku tetep di sini kalau nanti kamu udah siap.`,
      `Santai aja${panggil}, gak ada paksaan buat cerita. Kadang diem dan istirahat sebentar emang yang paling dibutuhin.`
    ]);
  }

  // 6. TANGANI PERMINTAAN CARA MENENANGKAN DIRI
  if (daftarKata(["tenangin", "cara tenang", "sesek", "deg-degan banget", "panik banget"])) {
    return `Yuk bareng-bareng dulu${panggil}: taruh HP sebentar, tarik napas lewat hidung 4 detik, tahan 7 detik, terus hembusin pelan lewat mulut 8 detik. Ulangi 3 kali ya, aku tungguin di sini 🤍`;
  }

  // 7. TANGANI UCAPAN TERIMA KASIH / PENUTUP
  if (daftarKata(["makasih", "terima kasih", "thanks", "udah lega", "udah enakan", "mendingan", "off dulu", "tidur dulu", "dadah", "bye"])) {
    return pilihUnik([
      `Sama-sama${panggil} 💖 Makasih juga udah mau percaya dan cerita ke aku. Jaga diri baik-baik ya, kapan pun butuh temen cerita lagi, aku selalu ada di sini.`,
      `Seneng banget dengernya kalau udah agak legaan${panggil} 💖 Istirahat yang cukup ya, inget kamu gak pernah sendirian.`
    ]);
  }

  // 8. SAPAAN AWAL
  if ((t === "halo" || t === "hai" || t === "hi" || t.includes("halo")) && chatKe <= 2 && !namaUser) {
    return `Haiii! Selamat datang 💖 Aku Sahabat Digital. Sebelum cerita, boleh kenalan dulu gak? Namamu siapa?`;
  }

  // 9. DETEKSI TOPIK UTAMA (Reset alur pertanyaan jika user ganti topik)
  let perasaan = deteksiTopik(t);
  if (perasaan && perasaan !== topikTerakhir) {
    topikTerakhir = perasaan;
    sudahTanyaKapan = false;
    sudahTanyaTerberat = false;
    sudahTanyaMauApa = false;
    if (modeObrolan !== "dengerin") modeObrolan = "netral";
  }

  // 10. JAWABAN PENDEK YANG NYAMBUNG KE KONTEKS SEBELUMNYA
  if (teks.length <= 15) {
    if (["iya", "ya", "hehe", "hmm", "oke", "iya sih", "bener", "banget", "nah itu", "parah", "sering", "kadang"].includes(t)) {
      if (modeObrolan === "dengerin") {
        return pilihUnik([
          `Hm, aku ngerti banget kenapa itu kerasa berat buat kamu${panggil}. Lanjutin aja ceritanya kalau masih ada yang ngeganjel.`,
          `Wajar banget kamu ngerasa kayak gitu${panggil}. Aku masih nyimak kok di sini 🤍`
        ]);
      }
      if (topikTerakhir === "dibully") return `Iya${panggil}, perlakuan kayak gitu emang nyakitin dan sama sekali bukan salah kamu. Kejadiannya di grup chat, komentar, atau lewat DM?`;
      if (omonganSebelumnya) return `Kebayang sih rasanya${panggil}... dari yang kamu ceritain tadi, bagian mana yang paling kerasa berat di pikiran atau hati kamu?`;
      return `Iya${panggil}, aku dengerin kok. Coba ceritain 1 kalimat aja apa yang paling bikin kamu ngerasa gitu hari ini?`;
    }
    if (["gak", "nggak", "ga", "tidak", "gatau", "gak tau", "bingung", "belum"].includes(t)) {
      return `Wajar kok kalau masih bingung atau susah dijelasin${panggil}. Gak perlu buru-buru, mau aku kasih cara simpel biar pikiran kamu agak tenangan dulu?`;
    }
    if (["cape", "capek", "lelah"].includes(t)) {
      topikTerakhir = "cape";
      return `Cape ya${panggil}... cape badannya karena aktivitas hari ini, atau cape pikirannya karena banyak yang dipendam sendirian?`;
    }
  }

  // 11. JIKA USER MEMILIH MODE "DENGERIN AJA" -> FOKUS VALIDASI EMPATIK TANPA INTEROGASI
  if (modeObrolan === "dengerin") {
    return pilihUnik([
      `Aku beneran ngerti kenapa itu bikin kamu kepikiran${panggil}. Perasaan kamu valid banget, dan kamu gak harus pura-pura kuat terus 🤍`,
      `Pelan-pelan aja ya${panggil}, aku nyimak setiap kata yang kamu tulis. Keluarin aja semua yang bikin sesek di dada.`,
      `Makasih udah mau jujur soal ini${panggil}. Gak gampang nahan itu sendirian, jadi wajar banget kalau kamu capek.`
    ]);
  }

  // 12. RESPONS MENDALAM SESUAI TOPIK PERTAMA KALI MUNCUL
  if (perasaan && !sudahTanyaKapan) {
    sudahTanyaKapan = true;
    if (perasaan === "dibully") return `Ya ampun${panggil}, pantesan kamu kepikiran. Itu bukan salah kamu sama sekali ya. Yang ngelakuin itu siapa, dan dia ngomongnya di chat, komentar, atau grup?`;
    if (perasaan === "insecure") return `Aku ngerti perasaan kayak gitu tuh gak enak banget${panggil}. Biasanya pikiran itu muncul pas lagi ngelihat hal tertentu di sosmed, atau karena omongan orang di sekitar?`;
    if (perasaan === "cape") return `Cape ya${panggil}, aku ngerti rasanya. Capeknya itu karena kejadian hari ini, atau udah numpuk dari beberapa hari belakangan?`;
    if (perasaan === "pacar") return `Ooh jadi soal hubungan ya${panggil}. Yang bikin kamu paling kepikiran tuh chatnya, sikapnya yang berubah, atau karena nungguin kabar dari dia?`;
    if (perasaan === "sedih") return `Denger kamu cerita gitu aku ikut ngerasain sedihnya${panggil}. Sedihnya karena kejadian baru aja, atau udah dipendam lama?`;
    if (perasaan === "marah") return `Kedengeran kesel banget ya${panggil}, wajar sih kalau kamu emosi. Yang bikin paling kesel tuh omongannya, atau sikapnya yang kayak gak peduli?`;
    if (perasaan === "cemas") return `Tarik napas pelan-pelan dulu ya${panggil}. Bagian mana yang paling bikin kamu kepikiran sampe deg-degan sekarang?`;
    if (perasaan === "bingung") return `Wajar kok bingung${panggil}. Yang bikin paling bimbang tuh harus milih keputusan apa, atau bingung harus mulai dari mana?`;
    if (perasaan === "senang") return `Ikut seneng dengernya${panggil}! Ceritain dong, hal baik apa yang bikin kamu seneng hari ini?`;
    if (perasaan === "sekolah") return `Soal sekolah atau kuliah emang suka bikin pusing ya${panggil}. Yang paling neken tuh tugasnya, deadline-nya, atau orang-orang di sana?`;
    if (perasaan === "keluarga") return `Soal keluarga emang sensitif banget ya${panggil}. Yang paling bikin kepikiran tuh omongan siapa, dan kejadiannya kapan?`;
    if (perasaan === "teman") return `Soal temen ya${panggil}. Ini temen deket kamu sendiri, atau temen satu circle/grup? Dia ngapain ke kamu?`;
  }

  // 13. TAHAP LANJUTAN PERCAKAPAN
  if (sudahTanyaKapan && !sudahTanyaTerberat) {
    sudahTanyaTerberat = true;
    return pilihUnik([
      `Aku tangkep maksud kamu${panggil}. Dari semua kejadian itu, bagian mana yang paling nempel dan paling bikin sakit hati sampe sekarang?`,
      `Kebayang sih posisi kamu saat itu${panggil}. Pas kejadian itu berlangsung, apa hal pertama yang langsung terlintas di pikiran kamu?`
    ]);
  }

  if (sudahTanyaTerberat && !sudahTanyaMauApa) {
    sudahTanyaMauApa = true;
    return `Makasih udah jujur cerita sejauh ini ya${panggil}, kamu hebat udah berani ngungkapin. Sekarang kamu pengennya apa: mau aku temenin cerita terus tanpa ditanya-tanya, mau cari solusi bareng, atau mau cara biar pikiran lebih tenang?`;
  }

  // 14. RESPONS LANJUTAN DINAMIS (ANTI-PENGULANGAN)
  return pilihUnik([
    `Aku dengerin${panggil}. Terus setelah kejadian itu, apa yang kamu lakuin atau rasain?`,
    `Paham${panggil}. Kalau kamu bisa ngomong jujur tanpa takut ke orang itu, kalimat apa yang paling pengen kamu sampein?`,
    `Kebayang sih beratnya${panggil}. Menurut kamu, hal kecil apa yang bisa bikin hati kamu agak legaan habis ini?`,
    `Aku nyimak terus kok${panggil}. Ada bagian lain yang masih ngeganjel di pikiran kamu soal ini?`
  ]);
}
