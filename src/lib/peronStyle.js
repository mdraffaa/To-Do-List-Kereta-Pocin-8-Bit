const WARNA_DEFAULT = {
  KULIAH: "#38BDF8",
  KERJA: "#FB923C",
  PRIBADI: "#C084FC",
};

const PALET_CUSTOM = [
  "#F472B6",
  "#4ADE80",
  "#FACC15",
  "#2DD4BF",
  "#F87171",
  "#A3E635",
  "#818CF8",
];

export function getPeronStyle(jalur) {
  const teks = (jalur || "PERON 1 • KULIAH").trim() || "PERON 1 • KULIAH";
  const upper = teks.toUpperCase();

  let color = null;
  Object.keys(WARNA_DEFAULT).forEach((kunci) => {
    if (!color && upper.includes(kunci)) {
      color = WARNA_DEFAULT[kunci];
    }
  });

  if (!color) {
    let hash = 0;
    for (let i = 0; i < upper.length; i++) {
      hash = (hash * 31 + upper.charCodeAt(i)) % 9973;
    }
    color = PALET_CUSTOM[hash % PALET_CUSTOM.length];
  }

  const bagian = upper.split("•");
  const nama = (bagian[1] || bagian[0]).trim();

  return { color, label: upper, nama };
}
