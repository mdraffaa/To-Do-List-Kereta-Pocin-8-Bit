export const DAFTAR_PERON = [
  { id: "PERON 1 • KULIAH", label: "Peron 1: Kuliah" },
  { id: "PERON 2 • KERJA", label: "Peron 2: Kerja / Projek" },
  { id: "PERON 3 • PRIBADI", label: "Peron 3: Pribadi" },
];

export const PENGUMUMAN_PERON = [
  "PERHATIAN: Kereta Cepat Pocin-Ngawi jalur Mas Rusdi diberangkatkan 10 menit lagi. Yang tugasnya masih kosong, mohon sadar diri.",
  "INFO CUACA PLANET DEPOK: Margonda terik 38°C, tapi khusus di atas kosan Kukel terpantau hujan badai lokal + angin kenangan.",
  "PERINGATAN PERON 3: Penumpang ketiduran di Bikun dari Halte Teknik berisiko bangun-bangun udah semester 9.",
  "LOKET MAS FUAD & MAS FAIZ: Dilarang ngerjain tugas pas baterai 2% terus kaget ilang. Pencet tombol SAMBUNG GERBONG dulu rek!",
  "TRANSIT MANGGARAI SIMULATOR: Sisa 30 menit sebelum deadline tapi masih sempet buka reels? Mental baja atau nekat nih?",
  "PENGUMUMAN KANTEK FTUI: Bau kopi sachet jam 02:15 WIB terdeteksi kuat di Jalur 1 & 9. Kerjain tugas sebelum WiFi kosan ngambek.",
  "HIMBAUAN KEPALA STASIUN MAS RUSDI: Potongan rambut boleh mullet rapi, tapi jadwal deadline jangan sampai berantakan.",
  "PERHATIAN PENUMPANG: Tombol '+30m' cuma buat darurat SKS, bukan dipencet tiap setengah jam sampe wisuda!",
];

export const CELETUKAN_MAS_RUSDI = [
  "AWAS PINTU NUTUP REK!",
  "KERETA NGAWI SIAP GAS!",
  "JANGAN KETIDURAN DI BIKUN!",
  "KUMPUL MODUL SEBELUM MANGGARAI!",
  "NGOPI KUKEL NANTI DULU!",
  "GAS POL JALUR POCIN!",
  "MAS FUAD CEK TIKET DULU!",
];

export function getPangkatMasinis(jumlahBerangkat) {
  const xp = jumlahBerangkat * 120;
  if (jumlahBerangkat >= 10) {
    return { title: "Raja Rel Manggarai", xp };
  }
  if (jumlahBerangkat >= 5) {
    return { title: "Masinis Senior Pocin", xp };
  }
  if (jumlahBerangkat >= 2) {
    return { title: "Asisten Mas Fuad", xp };
  }
  return { title: "Magang Stasiun Depok", xp };
}
