export const DAFTAR_ANOMALI = [
  { id: "robot", nama: "Bot Bug Ngoding", shortLabel: "Bot CRT", color: "#4ADE80" },
  { id: "oren", nama: "Kocheng Oren Kantek", shortLabel: "Kocheng Oren", color: "#FB923C" },
  { id: "capy", nama: "Capybara Santuy UI", shortLabel: "Capybara", color: "#FACC15" },
  { id: "kentong", nama: "Tung-Tung Kukel", shortLabel: "Tung-Tung", color: "#D97706" },
  { id: "gurita", nama: "Gurita SKS Kopi", shortLabel: "Gurita Kopi", color: "#A855F7" },
];

export function getAnomaliInfo(task) {
  if (task?.anomaliType) {
    const found = DAFTAR_ANOMALI.find((a) => a.id === task.anomaliType);
    if (found) {
      return { type: found.id, nama: found.nama };
    }
  }

  const jalur = (task?.jalur || "").toUpperCase();
  if (jalur.includes("KERJA") || jalur.includes("KANTEK")) {
    return { type: "oren", nama: "Kocheng Oren Kantek" };
  }
  if (jalur.includes("BIKUN")) {
    return { type: "capy", nama: "Capybara Santuy UI" };
  }
  if (jalur.includes("PRIBADI") || jalur.includes("KUKEL")) {
    return { type: "kentong", nama: "Tung-Tung Kukel" };
  }
  if (jalur.includes("NGAWI")) {
    return { type: "gurita", nama: "Gurita SKS Kopi" };
  }
  return { type: "robot", nama: "Bot Bug Ngoding" };
}

function drawGroundShadow(ctx, cx, footY) {
  ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
  ctx.fillRect(cx - 10, footY - 1, 20, 3);
}

export function drawAnomaliCreature(ctx, type, cx, footY, frame, jumping = false) {
  const bounce = jumping
    ? -Math.abs(Math.round(Math.sin(frame * 0.28) * 6))
    : Math.floor(frame / 16) % 2 === 0
      ? 0
      : -1;
  const wave = Math.floor(frame / 10) % 2 === 0 ? -2 : 2;
  const x = Math.round(cx);
  const y = Math.round(footY + bounce);

  drawGroundShadow(ctx, x, Math.round(footY));

  if (type === "oren") {
    ctx.fillStyle = "#EA580C";
    ctx.fillRect(x - 12, y - 12 + wave, 4, 3);
    ctx.fillRect(x - 14, y - 15 + wave, 3, 4);
    ctx.fillStyle = "#F8FAFC";
    ctx.fillRect(x - 6, y - 4, 4, 4);
    ctx.fillRect(x + 2, y - 4, 4, 4);
    ctx.fillStyle = "#FACC15";
    ctx.fillRect(x - 8, y - 13, 16, 9);
    ctx.fillStyle = "#CA8A04";
    ctx.fillRect(x + 6, y - 14, 3, 9);
    ctx.fillStyle = "#FB923C";
    ctx.fillRect(x - 9, y - 24, 18, 11);
    ctx.fillStyle = "#EA580C";
    ctx.fillRect(x + 7, y - 25, 3, 11);
    ctx.fillStyle = "#F97316";
    ctx.fillRect(x - 9, y - 28, 4, 4);
    ctx.fillRect(x + 5, y - 28, 4, 4);
    ctx.fillStyle = "#0F172A";
    ctx.fillRect(x - 5, y - 20, 3, 3);
    ctx.fillRect(x + 2, y - 20, 3, 3);
    ctx.fillStyle = "#FEF3C7";
    ctx.fillRect(x - 4, y - 17, 8, 3);
    ctx.fillStyle = "#F43F5E";
    ctx.fillRect(x - 1, y - 17, 2, 2);
    return;
  }

  if (type === "capy") {
    ctx.fillStyle = "#451A03";
    ctx.fillRect(x - 7, y - 4, 4, 4);
    ctx.fillRect(x + 3, y - 4, 4, 4);
    ctx.fillStyle = "#FACC15";
    ctx.fillRect(x - 9, y - 14, 18, 10);
    ctx.fillStyle = "#EAB308";
    ctx.fillRect(x + 7, y - 15, 3, 10);
    ctx.fillStyle = "#92400E";
    ctx.fillRect(x - 10, y - 24, 20, 11);
    ctx.fillStyle = "#78350F";
    ctx.fillRect(x + 8, y - 25, 4, 11);
    ctx.fillStyle = "#B45309";
    ctx.fillRect(x - 5, y - 20, 12, 6);
    ctx.fillStyle = "#0F172A";
    ctx.fillRect(x - 6, y - 22, 4, 2);
    ctx.fillRect(x + 3, y - 22, 4, 2);
    ctx.fillStyle = "#F97316";
    ctx.fillRect(x - 3, y - 29, 6, 5);
    ctx.fillStyle = "#22C55E";
    ctx.fillRect(x, y - 31, 2, 2);
    return;
  }

  if (type === "kentong") {
    ctx.fillStyle = "#DC2626";
    ctx.fillRect(x - 7, y - 4, 5, 4);
    ctx.fillRect(x + 2, y - 4, 5, 4);
    ctx.fillStyle = "#78350F";
    ctx.fillRect(x - 5, y - 8, 2, 4);
    ctx.fillRect(x + 3, y - 8, 2, 4);
    ctx.fillStyle = "#B45309";
    ctx.fillRect(x - 7, y - 26, 14, 18);
    ctx.fillStyle = "#D97706";
    ctx.fillRect(x - 7, y - 28, 14, 3);
    ctx.fillStyle = "#78350F";
    ctx.fillRect(x + 5, y - 27, 4, 18);
    ctx.fillStyle = "#451A03";
    ctx.fillRect(x - 1, y - 16, 2, 7);
    ctx.fillStyle = "#F8FAFC";
    ctx.fillRect(x - 5, y - 23, 4, 4);
    ctx.fillRect(x + 1, y - 23, 4, 4);
    ctx.fillStyle = "#0F172A";
    ctx.fillRect(x - 4, y - 22, 2, 2);
    ctx.fillRect(x + 2, y - 22, 2, 2);
    ctx.fillStyle = "#92400E";
    ctx.fillRect(x - 11, y - 18 + wave, 4, 3);
    ctx.fillRect(x + 7, y - 18 - wave, 4, 3);
    return;
  }

  if (type === "gurita") {
    const tShift = Math.floor(frame / 8) % 2;
    ctx.fillStyle = "#9333EA";
    ctx.fillRect(x - 10, y - 6 + tShift, 4, 6);
    ctx.fillRect(x - 4, y - 6 - tShift, 4, 6);
    ctx.fillRect(x + 2, y - 6 + tShift, 4, 6);
    ctx.fillRect(x + 8, y - 6 - tShift, 4, 6);
    ctx.fillStyle = "#A855F7";
    ctx.fillRect(x - 9, y - 22, 18, 16);
    ctx.fillStyle = "#7E22CE";
    ctx.fillRect(x + 7, y - 23, 4, 16);
    ctx.fillStyle = "#FEF08A";
    ctx.fillRect(x - 6, y - 17, 4, 4);
    ctx.fillRect(x + 2, y - 17, 4, 4);
    ctx.fillStyle = "#0F172A";
    ctx.fillRect(x - 5, y - 16, 2, 2);
    ctx.fillRect(x + 3, y - 16, 2, 2);
    ctx.fillStyle = "#FACC15";
    ctx.fillRect(x + 9, y - 15 + wave, 6, 6);
    ctx.fillStyle = "#451A03";
    ctx.fillRect(x + 10, y - 15 + wave, 4, 2);
    return;
  }

  ctx.fillStyle = "#475569";
  ctx.fillRect(x - 6, y - 4, 4, 4);
  ctx.fillRect(x + 2, y - 4, 4, 4);
  ctx.fillStyle = "#64748B";
  ctx.fillRect(x - 7, y - 13, 14, 9);
  ctx.fillStyle = "#475569";
  ctx.fillRect(x + 5, y - 14, 3, 9);
  ctx.fillStyle = "#94A3B8";
  ctx.fillRect(x - 11, y - 12 + wave, 4, 3);
  ctx.fillRect(x + 7, y - 12 - wave, 4, 3);
  ctx.fillStyle = "#CBD5E1";
  ctx.fillRect(x - 9, y - 25, 18, 12);
  ctx.fillStyle = "#64748B";
  ctx.fillRect(x + 7, y - 26, 4, 12);
  ctx.fillStyle = "#0F172A";
  ctx.fillRect(x - 7, y - 23, 13, 8);
  ctx.fillStyle = "#4ADE80";
  ctx.fillRect(x - 5, y - 21, 3, 2);
  ctx.fillRect(x + 1, y - 21, 3, 2);
  ctx.fillRect(x - 3, y - 17, 5, 2);
  ctx.fillStyle = "#94A3B8";
  ctx.fillRect(x - 1, y - 29, 2, 4);
  ctx.fillStyle = "#F5B700";
  ctx.fillRect(x - 2, y - 31, 4, 3);
}

export function drawAnomaliBanner(
  ctx,
  centerX,
  topY,
  taskTitle,
  anomaliName,
  canvasWidth = 680,
  peron = null
) {
  const safeTitle =
    taskTitle && taskTitle.length > 18
      ? `${taskTitle.slice(0, 16)}..`
      : taskTitle || "Tugas Kelar";
  const line1 = `KELAR! • ${anomaliName}`;
  const line2 = `"${safeTitle}"`;

  const estWidth = Math.max(line1.length, line2.length) * 5.6 + 18;
  const bw = Math.min(200, Math.max(122, Math.round(estWidth)));
  const bh = 28;
  const bx = Math.max(8, Math.min(canvasWidth - bw - 8, Math.round(centerX - bw / 2)));
  const by = Math.max(50, Math.round(topY));

  if (peron) {
    ctx.fillStyle = peron.color;
    ctx.fillRect(bx, by - 12, bw, 12);
    ctx.fillStyle = "#0B1020";
    ctx.font = "bold 8px monospace";
    const labelPeron =
      peron.label.length > 22 ? `${peron.label.slice(0, 20)}..` : peron.label;
    ctx.fillText(labelPeron, bx + 6, by - 3);
  }

  ctx.fillStyle = "rgba(11, 16, 32, 0.94)";
  ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = "#4ADE80";
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, by, bw, bh);

  const stemX = Math.max(bx + 6, Math.min(bx + bw - 8, Math.round(centerX) - 1));
  ctx.fillStyle = "#4ADE80";
  ctx.fillRect(stemX, by + bh, 2, 5);

  ctx.fillStyle = "#4ADE80";
  ctx.font = "bold 8px monospace";
  ctx.fillText(line1, bx + 6, by + 11);

  ctx.fillStyle = "#FACC15";
  ctx.font = "bold 8px monospace";
  ctx.fillText(line2, bx + 6, by + 22);
}
