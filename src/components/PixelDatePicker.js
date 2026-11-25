"use client";

import { useState } from "react";
import { playSelectBlip } from "@/lib/sound8bit";

const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const NAMA_BULAN_PENDEK = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Ags",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const HARI_PENDEK = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function PixelCalendarIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="4" y="1" width="2" height="2" />
      <rect x="10" y="1" width="2" height="2" />
      <rect x="2" y="3" width="12" height="2" />
      <rect x="2" y="5" width="12" height="9" />
      <rect x="4" y="7" width="8" height="5" fill="#0B1020" />
      <rect x="5" y="8" width="2" height="2" />
      <rect x="9" y="8" width="2" height="2" />
    </svg>
  );
}

function formatDateKey(tahun, bulanIndex, hari) {
  return `${tahun}-${String(bulanIndex + 1).padStart(2, "0")}-${String(hari).padStart(2, "0")}`;
}

function formatLabelTanggal(dateStr) {
  if (!dateStr || !dateStr.includes("-")) return "Tap pilih tanggal";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const tahun = Number(parts[0]);
  const bulan = Number(parts[1]) - 1;
  const hari = Number(parts[2]);
  if (Number.isNaN(tahun) || Number.isNaN(bulan) || Number.isNaN(hari)) {
    return dateStr;
  }
  return `${hari} ${NAMA_BULAN_PENDEK[bulan] || ""} ${tahun}`;
}

export default function PixelDatePicker({ value, onChange, soundEnabled }) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(0);
  const [todayKey, setTodayKey] = useState("");

  const handleToggle = () => {
    if (!open) {
      const sekarang = new Date();
      setTodayKey(
        formatDateKey(
          sekarang.getFullYear(),
          sekarang.getMonth(),
          sekarang.getDate()
        )
      );

      if (value && value.includes("-")) {
        const [y, m] = value.split("-").map(Number);
        if (!Number.isNaN(y) && !Number.isNaN(m)) {
          setViewYear(y);
          setViewMonth(m - 1);
        } else {
          setViewYear(sekarang.getFullYear());
          setViewMonth(sekarang.getMonth());
        }
      } else {
        setViewYear(sekarang.getFullYear());
        setViewMonth(sekarang.getMonth());
      }
      if (soundEnabled) playSelectBlip();
    }
    setOpen((prev) => !prev);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
    if (soundEnabled) playSelectBlip();
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
    if (soundEnabled) playSelectBlip();
  };

  const handlePickDay = (day) => {
    onChange(formatDateKey(viewYear, viewMonth, day));
    setOpen(false);
    if (soundEnabled) playSelectBlip();
  };

  const handlePickToday = () => {
    const skrg = new Date();
    onChange(
      formatDateKey(skrg.getFullYear(), skrg.getMonth(), skrg.getDate())
    );
    setOpen(false);
    if (soundEnabled) playSelectBlip();
  };

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const blankSlots = Array.from({ length: firstWeekday }, (_, i) => i);
  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="relative">
      <button
        type="button"
        id="krl-tanggal"
        onClick={handleToggle}
        className="pixel-well w-full px-2.5 py-2 rounded-lg text-left text-xs font-mono flex items-center justify-between gap-2 text-white hover:border-[#F5B700] cursor-pointer"
      >
        <span className={value ? "text-white font-bold" : "text-slate-400"}>
          {formatLabelTanggal(value)}
        </span>
        <span className="text-[#F5B700] shrink-0">
          <PixelCalendarIcon />
        </span>
      </button>

      {open ? (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-black/55 sm:bg-transparent"
          />

          <div className="pixel-panel rounded-xl p-3 w-72 max-w-[92vw] z-40 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:absolute sm:left-auto sm:top-auto sm:translate-x-0 sm:translate-y-0 sm:bottom-full sm:mb-2 sm:right-0 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Bulan sebelumnya"
                className="pixel-btn px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border-slate-500 text-xs font-mono font-bold text-white cursor-pointer"
              >
                &lt;
              </button>
              <span className="font-display text-xs text-[#F5B700]">
                {NAMA_BULAN[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Bulan berikutnya"
                className="pixel-btn px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border-slate-500 text-xs font-mono font-bold text-white cursor-pointer"
              >
                &gt;
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono text-slate-400">
              {HARI_PENDEK.map((h) => (
                <span key={h} className="py-0.5">
                  {h}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {blankSlots.map((slot) => (
                <span key={`blank-${slot}`} className="h-7" />
              ))}
              {dayNumbers.map((day) => {
                const key = formatDateKey(viewYear, viewMonth, day);
                const isSelected = key === value;
                const isToday = key === todayKey;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handlePickDay(day)}
                    className={
                      isSelected
                        ? "h-7 rounded text-xs font-mono font-bold bg-[#F5B700] text-[#0B1020] border border-amber-200 cursor-pointer"
                        : isToday
                          ? "h-7 rounded text-xs font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-400 cursor-pointer hover:bg-sky-500/35"
                          : "h-7 rounded text-xs font-mono text-slate-200 bg-slate-900/80 border border-slate-700 hover:border-[#F5B700] hover:text-white cursor-pointer"
                    }
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-700">
              <button
                type="button"
                onClick={handlePickToday}
                className="pixel-btn px-2.5 py-1 rounded bg-sky-500/20 hover:bg-sky-500/35 border-sky-400 text-[11px] font-mono font-bold text-sky-300 cursor-pointer"
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="pixel-btn px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border-slate-500 text-[11px] font-mono text-slate-200 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
