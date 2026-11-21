// ============================================================
//  FALLBACK KONSELING CERDAS (Jika Kuota API Habis / Offline)
// ============================================================
function buatBalasanKonselingLokal(teks, peran = "") {
  const t = (teks || "").toLowerCase().trim();
  const ringkas = teks.length > 55 ? teks.slice(0, 55) + "..." : teks;

  // 1. Cek kata bahaya terlebih dahulu
  const KATA_BAHAYA = [
    "mati", "bunuh", "bunuh diri", "pengen mati", "mau mati", "ingin mati",
    "lukai diri", "self harm", "self-harm", "cutting", "menyakiti diri",
    "gak mau hidup", "tidak mau hidup", "pengen hilang", "ingin hilang",
    "ingin mengakhiri", "mau mengakhiri hidup", "bunuh aja", "matiin aku"
  ];
  const adaBahaya = KATA_BAHAYA.some(k => t.includes(k));
  if (adaBahaya) {
    return {
      reply: "Aku sangat peduli dan khawatir dengan keselamatanmu. Kamu tidak sendirian melewati masa-masa yang berat ini. Tolong segera hubungi konselor atau kontak darurat di bawah ini ya, ada orang yang siap mendengarkan dan membantumu 💚",
      is_dangerous: true,
      risk_level: "high",
      reason: "Terdeteksi indikasi bahaya keselamatan konseli"
    };
  }

  // 2. Deteksi tes atau salam singkat
  if (["tes", "test", "halo", "hai", "hi", "p", "assalamualaikum", "pagi", "siang", "sore", "malam"].includes(t)) {
    return {
      reply: "Hai! Aku Sahabat Digital 💖 Senang kamu ada di sini. Ruang ini aman dan rahasia buat kamu cerita apa pun. Lagi ada hal yang mengganjal di pikiran atau perasaanmu hari ini?",
      is_dangerous: false,
      risk_level: "low",
      reason: "Salam pembuka konseling"
    };
  }

  // 3. Deteksi nama
  if (t.includes("namaku") || t.includes("nama ku") || t.includes("panggil aku")) {
    const kata = teks.replace(/namaku|nama ku|panggil aku/gi, "").trim().split(/\s+/);
    let n = kata[0] || "kamu";
    n = n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
    return {
      reply: `Halo ${n}! Senang bisa kenal kamu di Sahabat Digital 💖 Gimana kabarmu hari ini? Cerita aja santai, aku siap mendengarkan.`,
      is_dangerous: false,
      risk_level: "low",
      reason: "Perkenalan nama konseli"
    };
  }

  // 4. Deteksi perasaan & konteks
  if (t.includes("cape") || t.includes("lelah") || t.includes("capek")) {
    return {
      reply: `Kedengarannya kamu lagi lelah banget ya... Wajar kok merasa capek, kamu sudah berusaha sebaik mungkin sampai hari ini. Boleh ceritakan, capeknya lebih karena fisik yang padat atau pikiran yang lagi numpuk?`,
      is_dangerous: false,
      risk_level: "low",
      reason: "Konseli merasa kelelahan/burnout"
    };
  }

  if (t.includes("stres") || t.includes("stress") || t.includes("pusing") || t.includes("overthinking") || t.includes("cemas") || t.includes("takut")) {
    return {
      reply: `Aku paham rasanya ketika pikiran lagi penuh dan bikin cemas. Tarik napas pelan-pelan dulu ya. Dari semua hal yang bikin kamu kepikiran tentang "${ringkas}", bagian mana yang paling bikin kamu berat saat ini?`,
      is_dangerous: false,
      risk_level: "low",
      reason: "Konseli mengalami stres/kecemasan"
    };
  }

  if (t.includes("sedih") || t.includes("nangis") || t.includes("down") || t.includes("kecewa") || t.includes("sepi") || t.includes("sendiri")) {
    return {
      reply: `Aku ikut merasakan apa yang kamu lalui. Menangis atau merasa sedih itu bukan kelemahan, itu tanda kamu manusiawi. Luapkan saja di sini, aku ada di sampingmu. Mau cerita apa yang terjadi?`,
      is_dangerous: false,
      risk_level: "low",
      reason: "Konseli merasa sedih/kecewa"
    };
  }

  if (t.includes("tugas") || t.includes("kuliah") || t.includes("sekolah") || t.includes("ujian") || t.includes("skripsi") || t.includes("nilai") || t.includes("dosen") || t.includes("guru")) {
    const peranLabel = peran === "siswa" ? "di sekolah" : (peran === "mahasiswa" ? "di kampus" : "akademik");
    return {
      reply: `Tekanan ${peranLabel} memang sering kali bikin kewalahan ya. Ingat, nilaimu tidak menentukan seluruh harga dirimu. Menurutmu, hal apa yang paling mendesak yang bisa kita selesaikan perlahan satu per satu?`,
      is_dangerous: false,
      risk_level: "low",
      reason: "Konseli menghadapi tekanan akademik"
    };
  }

  if (t.includes("bully") || t.includes("dibully") || t.includes("dihina") || t.includes("diejek") || t.includes("dikucilkan")) {
    return {
      reply: `Kamu tidak pantas diperlakukan seperti itu, dan ini sama sekali bukan salahmu. Tetap tenang, jangan balas dengan emosi, simpan bukti perlakuannya, dan ceritakan ke konselor atau orang yang kamu percaya. Aku di sini mendukungmu 💚`,
      is_dangerous: false,
      risk_level: "medium",
      reason: "Konseli mengalami perundungan/bullying"
    };
  }

  if (t.includes("marah") || t.includes("kesel") || t.includes("sebel") || t.includes("benci")) {
    return {
      reply: `Wajar banget kamu merasa kesal setelah apa yang terjadi. Emosi marah itu valid untuk dirasakan. Ceritakan apa yang bikin kamu paling emosi, biar rasa sesaknya bisa berkurang.`,
      is_dangerous: false,
      risk_level: "low",
      reason: "Konseli mengekspresikan kemarahan"
    };
  }

  // 5. Respons empatik umum
  return {
    reply: `Terima kasih ya sudah mau membagikan ini ke Sahabat Digital. Tentang "${ringkas}", bagaimana perasaanmu sekarang setelah mulai menceritakannya? Aku masih di sini mendengarkan.`,
    is_dangerous: false,
    risk_level: "low",
    reason: "Curhatan umum konseli"
  };
}

module.exports = { buatBalasanKonselingLokal };
