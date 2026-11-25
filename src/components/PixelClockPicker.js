"use client";

import { useState } from "react";
import { playSelectBlip } from "@/lib/sound8bit";

const ANGKA_JAM = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const ANGKA_MENIT = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

function PixelClockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="4" y="2" width="8" height="2" />
      <rect x="4" y="12" width="8" height="2" />
      <rect x="2" y="4" width="2" height="8" />
      <rect x="12" y="4" width="2" height="8" />
      <rect x="7" y="4" width="2" height="5" />
      <rect x="9" y="7" width="3" height="2" />
    </svg>
  );
}

function parse24To12(timeStr) {
  if (!timeStr || !timeStr.includes(":")) {
    return { hour12: 9, minute: 0, period: "PM" };
  }
  const [hRaw, mRaw] = timeStr.split(":").map(Number);
  if (Number.isNaN(hRaw) || Number.isNaN(mRaw)) {
    return { hour12: 9, minute: 0, period: "PM" };
  }
  const period = hRaw >= 12 ? "PM" : "AM";
  const hour12 = hRaw % 12 === 0 ? 12 : hRaw % 12;
  return { hour12, minute: mRaw, period };
}

function format12To24(hour12, minute, period) {
  let hour24 = hour12 % 12;
  if (period === "PM") {
    hour24 += 12;
  }
  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatTampilJam(timeStr) {
  if (!timeStr || !timeStr.includes(":")) return "Tap pilih jam";
  const { hour12, minute, period } = parse24To12(timeStr);
  return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
}

export default function PixelClockPicker({ value, onChange, soundEnabled }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("hour");
  const [hour12, setHour12] = useState(9);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState("PM");

  const handleToggle = () => {
    if (!open) {
      let initialTime = value;
      if (!initialTime) {
        const skrg = new Date();
        initialTime = format12To24(
          skrg.getHours() % 12 === 0 ? 12 : skrg.getHours() % 12,
          Math.floor(skrg.getMinutes() / 5) * 5,
          skrg.getHours() >= 12 ? "PM" : "AM"
        );
      }
      const parsed = parse24To12(initialTime);
      setHour12(parsed.hour12);
      setMinute(parsed.minute);
      setPeriod(parsed.period);
      setStep("hour");
      if (soundEnabled) playSelectBlip();
    }
    setOpen((prev) => !prev);
  };

  const applyTime = (nextHour12, nextMinute, nextPeriod) => {
    onChange(format12To24(nextHour12, nextMinute, nextPeriod));
  };

  const handleClickDial = (idx) => {
    if (step === "hour") {
      const pickedHour = ANGKA_JAM[idx];
      setHour12(pickedHour);
      applyTime(pickedHour, minute, period);
      setStep("minute");
    } else {
      const pickedMin = ANGKA_MENIT[idx];
      setMinute(pickedMin);
      applyTime(hour12, pickedMin, period);
    }
    if (soundEnabled) playSelectBlip();
  };

  const handleSetPeriod = (nextPeriod) => {
    setPeriod(nextPeriod);
    applyTime(hour12, minute, nextPeriod);
    if (soundEnabled) playSelectBlip();
  };

  const handleAdjustMinute = (delta) => {
    const nextMin = (minute + delta + 60) % 60;
    setMinute(nextMin);
    applyTime(hour12, nextMin, period);
    if (soundEnabled) playSelectBlip();
  };

  const handAngleDeg = step === "hour" ? (hour12 % 12) * 30 : minute * 6;
  const handAngleRad = ((handAngleDeg - 90) * Math.PI) / 180;
  const handLength = step === "hour" ? 48 : 58;
  const handEndX = Math.round(104 + Math.cos(handAngleRad) * handLength);
  const handEndY = Math.round(104 + Math.sin(handAngleRad) * handLength);

  return (
    <div className="relative">
      <button
        type="button"
        id="krl-jam"
        onClick={handleToggle}
        className="pixel-well w-full px-2.5 py-2 rounded-lg text-left text-xs font-mono flex items-center justify-between gap-2 text-white hover:border-[#F5B700] cursor-pointer"
      >
        <span className={value ? "text-white font-bold tabular-nums" : "text-slate-400"}>
          {formatTampilJam(value)}
        </span>
        <span className="text-[#F5B700] shrink-0">
          <PixelClockIcon />
        </span>
      </button>

      {open ? (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-black/55 sm:bg-transparent"
          />

          <div className="pixel-panel rounded-xl p-3.5 w-[272px] max-w-[92vw] z-40 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:absolute sm:left-auto sm:top-auto sm:translate-x-0 sm:translate-y-0 sm:bottom-full sm:mb-2 sm:right-0 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-[10px] text-[#38BDF8]">
                {step === "hour"
                  ? "1/2: TAP ANGKA JAM"
                  : "2/2: TAP MENIT & AM/PM"}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                WIB: {format12To24(hour12, minute, period)}
              </span>
            </div>

            <div className="pixel-well rounded-lg p-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 font-mono text-lg font-bold tabular-nums">
                <button
                  type="button"
                  onClick={() => setStep("hour")}
                  className={
                    step === "hour"
                      ? "px-2 py-0.5 rounded bg-[#F5B700] text-[#0B1020] cursor-pointer"
                      : "px-2 py-0.5 rounded bg-slate-800 text-slate-200 hover:text-white cursor-pointer"
                  }
                >
                  {String(hour12).padStart(2, "0")}
                </button>
                <span className="text-slate-400">:</span>
                <button
                  type="button"
                  onClick={() => setStep("minute")}
                  className={
                    step === "minute"
                      ? "px-2 py-0.5 rounded bg-[#38BDF8] text-[#0B1020] cursor-pointer"
                      : "px-2 py-0.5 rounded bg-slate-800 text-slate-200 hover:text-white cursor-pointer"
                  }
                >
                  {String(minute).padStart(2, "0")}
                </button>
              </div>

              <div className="flex items-center gap-1 font-mono text-xs font-bold">
                <button
                  type="button"
                  onClick={() => handleSetPeriod("AM")}
                  className={
                    period === "AM"
                      ? "pixel-btn px-2 py-1 rounded bg-[#F5B700] border-amber-200 text-[#0B1020] cursor-pointer"
                      : "pixel-btn px-2 py-1 rounded bg-slate-800 border-slate-600 text-slate-300 cursor-pointer"
                  }
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPeriod("PM")}
                  className={
                    period === "PM"
                      ? "pixel-btn px-2 py-1 rounded bg-[#F5B700] border-amber-200 text-[#0B1020] cursor-pointer"
                      : "pixel-btn px-2 py-1 rounded bg-slate-800 border-slate-600 text-slate-300 cursor-pointer"
                  }
                >
                  PM
                </button>
              </div>
            </div>

            <div className="pixel-well rounded-xl mx-auto relative w-[208px] h-[208px] border-2 border-[#3B4D72]">
              <span className="absolute left-2 top-2 w-1.5 h-1.5 bg-slate-500" />
              <span className="absolute right-2 top-2 w-1.5 h-1.5 bg-slate-500" />
              <span className="absolute left-2 bottom-2 w-1.5 h-1.5 bg-slate-500" />
              <span className="absolute right-2 bottom-2 w-1.5 h-1.5 bg-slate-500" />

              <svg
                width="208"
                height="208"
                viewBox="0 0 208 208"
                shapeRendering="crispEdges"
                className="absolute inset-0 pointer-events-none"
                aria-hidden="true"
              >
                <line
                  x1="104"
                  y1="104"
                  x2={handEndX}
                  y2={handEndY}
                  stroke={step === "hour" ? "#F5B700" : "#38BDF8"}
                  strokeWidth="4"
                />
                <rect
                  x="100"
                  y="100"
                  width="8"
                  height="8"
                  fill={step === "hour" ? "#F5B700" : "#38BDF8"}
                />
              </svg>

              {Array.from({ length: 12 }, (_, idx) => {
                const rad = ((idx * 30 - 90) * Math.PI) / 180;
                const cx = Math.round(104 + Math.cos(rad) * 74);
                const cy = Math.round(104 + Math.sin(rad) * 74);
                const label =
                  step === "hour"
                    ? String(ANGKA_JAM[idx])
                    : String(ANGKA_MENIT[idx]).padStart(2, "0");

                const isActive =
                  step === "hour"
                    ? ANGKA_JAM[idx] === hour12
                    : ANGKA_MENIT[idx] === minute;

                return (
                  <button
                    key={`${step}-${idx}`}
                    type="button"
                    onClick={() => handleClickDial(idx)}
                    style={{
                      left: `${cx - 15}px`,
                      top: `${cy - 15}px`,
                    }}
                    className={
                      isActive
                        ? step === "hour"
                          ? "absolute w-[30px] h-[30px] rounded font-mono text-xs font-bold bg-[#F5B700] text-[#0B1020] border-2 border-amber-200 cursor-pointer"
                          : "absolute w-[30px] h-[30px] rounded font-mono text-xs font-bold bg-[#38BDF8] text-[#0B1020] border-2 border-sky-200 cursor-pointer"
                        : "absolute w-[30px] h-[30px] rounded font-mono text-xs font-bold bg-slate-900/90 hover:bg-slate-700 text-slate-100 border border-slate-600 cursor-pointer"
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleAdjustMinute(-1)}
                  className="pixel-btn px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border-slate-500 text-[11px] font-mono text-slate-200 cursor-pointer"
                >
                  -1m
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustMinute(1)}
                  className="pixel-btn px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border-slate-500 text-[11px] font-mono text-slate-200 cursor-pointer"
                >
                  +1m
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  applyTime(hour12, minute, period);
                  setOpen(false);
                  if (soundEnabled) playSelectBlip();
                }}
                className="pixel-btn px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-400 border-emerald-200 text-[#0B1020] text-xs font-mono font-bold cursor-pointer"
              >
                OK / Pakai Jam
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
