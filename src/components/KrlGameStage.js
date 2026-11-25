"use client";

import { useEffect, useRef, useState } from "react";
import { CELETUKAN_MAS_RUSDI, DAFTAR_PERON } from "@/app/memeData";
import PixelClockPicker from "@/components/PixelClockPicker";
import PixelDatePicker from "@/components/PixelDatePicker";
import { getPeronStyle } from "@/lib/peronStyle";
import {
  DAFTAR_ANOMALI,
  drawAnomaliBanner,
  drawAnomaliCreature,
  getAnomaliInfo,
} from "@/lib/anomaliSprites";
import {
  playBerangkatJingle,
  playKlakson8Bit,
  playPintuBuka,
  playRemStasiun,
  playSelectBlip,
} from "@/lib/sound8bit";

const CANVAS_W = 680;
const CANVAS_H = 360;
const SKYLINE_H = 104;
const FOCAL_RAIL_Y = 248;
const TRACK_PITCH = 158;

const CUACA_URUTAN = ["malam", "senja", "siang", "hujan"];
const LABEL_CUACA = {
  malam: "MALAM SKS",
  senja: "SENJA KUKEL",
  siang: "SIANG MARGONDA",
  hujan: "HUJAN LOKAL",
};

const WARNA_KONFETI = ["#FACC15", "#4ADE80", "#38BDF8", "#F43F5E", "#F8FAFC"];

const BINTANG_KOORD = [
  [32, 16],
  [84, 34],
  [136, 14],
  [192, 26],
  [248, 12],
  [306, 24],
  [364, 15],
  [422, 30],
  [480, 14],
  [538, 26],
  [596, 16],
  [646, 32],
];

const HUJAN_AWAL = Array.from({ length: 48 }, (_, idx) => ({
  x: (idx * 43) % CANVAS_W,
  y: (idx * 31) % CANVAS_H,
  len: 7 + (idx % 4),
}));

function normalizeTrackKey(jalur) {
  const teks = (jalur || DAFTAR_PERON[0].id).trim() || DAFTAR_PERON[0].id;
  return teks.toUpperCase();
}

function PixelArrowUpIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="5" y="2" width="2" height="2" />
      <rect x="3" y="4" width="6" height="2" />
      <rect x="1" y="6" width="10" height="2" />
      <rect x="5" y="8" width="2" height="2" />
    </svg>
  );
}

function PixelArrowDownIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="5" y="2" width="2" height="2" />
      <rect x="1" y="4" width="10" height="2" />
      <rect x="3" y="6" width="6" height="2" />
      <rect x="5" y="8" width="2" height="2" />
    </svg>
  );
}

function drawBox25D(
  ctx,
  x,
  y,
  w,
  h,
  dx,
  dy,
  frontColor,
  roofColor,
  sideColor,
  outlineColor = "#0F172A"
) {
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + dx, y + dy);
  ctx.lineTo(x + w + dx, y + dy);
  ctx.lineTo(x + w, y);
  ctx.closePath();
  ctx.fill();

  if (sideColor) {
    ctx.fillStyle = sideColor;
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w + dx, y + dy);
    ctx.lineTo(x + w + dx, y + h + dy);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = frontColor;
  ctx.fillRect(x, y, w, h);

  if (outlineColor) {
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + dy);
    ctx.lineTo(x + w + dx, y + dy);
    ctx.lineTo(x + w, y);
    if (sideColor) {
      ctx.moveTo(x + w + dx, y + dy);
      ctx.lineTo(x + w + dx, y + h + dy);
      ctx.lineTo(x + w, y + h);
    }
    ctx.stroke();
  }
}

function getSkyPalette(weatherMode) {
  if (weatherMode === "senja") {
    return {
      bands: ["#1E1538", "#5E2750", "#B4473B", "#E07A38"],
      isDark: true,
    };
  }
  if (weatherMode === "siang") {
    return {
      bands: ["#1D4ED8", "#2563EB", "#38BDF8", "#93C5FD"],
      isDark: false,
    };
  }
  if (weatherMode === "hujan") {
    return {
      bands: ["#0B1320", "#162032", "#223047", "#334155"],
      isDark: true,
    };
  }
  return {
    bands: ["#070B1A", "#0F1733", "#17254D", "#223466"],
    isDark: true,
  };
}

function getTaskUrgenStatus(task, now) {
  if (!task || task.completed) return "aman";
  if (!now) return "aman";
  const diff = new Date(task.dueAt).getTime() - now.getTime();
  if (diff <= 0) return "telat";
  if (diff <= 2 * 60 * 60 * 1000) return "boarding";
  return "aman";
}

function formatJamSingkat(isoString) {
  const date = new Date(isoString);
  return date
    .toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(".", ":");
}

function potongTeks(teks, maxLen) {
  if (!teks) return "";
  return teks.length > maxLen ? `${teks.slice(0, maxLen - 2)}..` : teks;
}

function buatKonfeti(cx, cy, count = 44) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const speed = 1.6 + (i % 5) * 0.72;
    return {
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.8,
      color: WARNA_KONFETI[i % WARNA_KONFETI.length],
      life: 85 + (i % 25),
    };
  });
}

function buildPeronTracks(tasks) {
  const keys = DAFTAR_PERON.map((p) => p.id);
  tasks.forEach((task) => {
    const key = normalizeTrackKey(task.jalur);
    if (!keys.includes(key)) {
      keys.push(key);
    }
  });

  return keys.map((key) => {
    const trackTasks = tasks.filter((t) => normalizeTrackKey(t.jalur) === key);
    return {
      key,
      style: getPeronStyle(key),
      activeTasks: trackTasks.filter((t) => !t.completed),
      completedTasks: trackTasks.filter((t) => t.completed),
    };
  });
}

function getOrCreateTrackState(map, key, defaultMode) {
  if (!map[key]) {
    const baseSpeed =
      defaultMode === "stasiun" ? 0 : defaultMode === "ngebut" ? 4.4 : 2.0;
    map[key] = {
      currentSpeed: baseSpeed,
      scrollX: 0,
      wheelAngle: 0,
      trainOffsetX: 0,
      stationX: 170,
      doorSlide: 0,
    };
  }
  return map[key];
}

export default function KrlGameStage({
  tasks,
  now,
  selectedTaskId,
  onSelectTask,
  activeTrackKey,
  onChangeTrackKey,
  onToggleComplete,
  onDelayTask,
  onDeleteTask,
  busyId,
  eventSignal,
  soundEnabled,
  onToggleSound,
  showHints,
  onToggleHints,
  isAddingOpen,
  onOpenAddForm,
  onCloseAddForm,
  formTitle,
  onChangeFormTitle,
  formTanggal,
  onChangeFormTanggal,
  formJam,
  onChangeFormJam,
  formJalur,
  onChangeFormJalur,
  isCustomJalur,
  onChangeIsCustomJalur,
  customJalur,
  onChangeCustomJalur,
  anomaliType,
  onChangeAnomaliType,
  onQuickMinutes,
  onQuickTimeToday,
  onSubmitNewTask,
  submitting,
  formError,
}) {
  const canvasRef = useRef(null);
  const hitBoxesRef = useRef([]);

  const [throttleMode, setThrottleMode] = useState("jalan");
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [weatherMode, setWeatherMode] = useState("malam");
  const [bubbleText, setBubbleText] = useState("");
  const [panIndex, setPanIndex] = useState(0);

  const peronTracks = buildPeronTracks(tasks);
  const foundTrackIdx = peronTracks.findIndex(
    (tr) => tr.key === normalizeTrackKey(activeTrackKey)
  );
  const activeTrackIndex = foundTrackIdx >= 0 ? foundTrackIdx : 0;
  const currentTrack = peronTracks[activeTrackIndex] || peronTracks[0];
  const currentActiveTasks = currentTrack ? currentTrack.activeTasks : [];
  const totalCompletedCount = tasks.filter((t) => t.completed).length;

  const maxPan = Math.max(0, currentActiveTasks.length - 2);
  const safePanIndex = Math.min(panIndex, maxPan);

  const selectedTask =
    currentActiveTasks.find((t) => t.id === selectedTaskId) ||
    currentActiveTasks[0] ||
    null;

  const callbacksRef = useRef({
    onChangeTrackKey,
    onSelectTask,
  });

  useEffect(() => {
    callbacksRef.current = {
      onChangeTrackKey,
      onSelectTask,
    };
  }, [onChangeTrackKey, onSelectTask]);

  const stateRef = useRef({
    peronTracks: [],
    activeTrackKey: DAFTAR_PERON[0].id,
    activeTrackIndex: 0,
    now: null,
    selectedTaskId: null,
    throttleMode: "jalan",
    doorsOpen: false,
    weatherMode: "malam",
    panIndex: 0,
    isAddingOpen: false,
    soundEnabled: true,
  });

  const animRef = useRef({
    frame: 0,
    skyScrollX: 0,
    cameraPanX: 0,
    cameraY: 0,
    trackStates: {},
    bikunX: 90,
    honkFlash: 0,
    coupleBounce: 0,
    coupleTrackKey: "",
    bubbleTimer: 0,
    bubbleText: "",
    popupText: "",
    popupX: 496,
    popupY: 0,
    popupTimer: 0,
    lastEventSeq: 0,
    smokeParticles: [],
    sparks: [],
    rainDrops: HUJAN_AWAL.map((d) => ({ ...d })),
    cutscene: {
      active: false,
      phase: "idle",
      timer: 0,
      task: null,
      trackKey: "",
      carIndex: 0,
      anomali: { type: "robot", nama: "Bot Bug Ngoding" },
      carDoorSlide: 0,
      jumpProgress: 0,
      relPlatformX: 200,
      confetti: [],
      shake: 0,
      flash: 0,
      letterbox: 0,
      ringRadius: 0,
      nextTrackKey: null,
      nextTaskId: null,
      pannedToRemaining: false,
    },
  });

  useEffect(() => {
    const built = buildPeronTracks(tasks);
    const idxFound = built.findIndex(
      (tr) => tr.key === normalizeTrackKey(activeTrackKey)
    );
    const safeIdx = idxFound >= 0 ? idxFound : 0;
    const focused = built[safeIdx] || built[0];

    stateRef.current = {
      peronTracks: built,
      activeTrackKey: focused ? focused.key : DAFTAR_PERON[0].id,
      activeTrackIndex: safeIdx,
      now,
      selectedTaskId,
      throttleMode,
      doorsOpen,
      weatherMode,
      panIndex: safePanIndex,
      isAddingOpen,
      soundEnabled,
    };
  }, [
    tasks,
    now,
    selectedTaskId,
    activeTrackKey,
    throttleMode,
    doorsOpen,
    weatherMode,
    safePanIndex,
    isAddingOpen,
    soundEnabled,
  ]);

  useEffect(() => {
    if (!eventSignal || !eventSignal.seq) return;
    if (eventSignal.seq === animRef.current.lastEventSeq) return;

    animRef.current.lastEventSeq = eventSignal.seq;

    if (eventSignal.type === "dropoff" && eventSignal.task) {
      const tKey = normalizeTrackKey(
        eventSignal.trackKey || eventSignal.task.jalur
      );
      const tState = getOrCreateTrackState(
        animRef.current.trackStates,
        tKey,
        stateRef.current.throttleMode
      );
      if (tState.stationX < -120) {
        tState.stationX = CANVAS_W + 20;
      }
      animRef.current.cutscene = {
        active: true,
        phase: "braking",
        timer: 0,
        task: eventSignal.task,
        trackKey: tKey,
        carIndex: eventSignal.carIndex ?? 0,
        anomali: getAnomaliInfo(eventSignal.task),
        carDoorSlide: 0,
        jumpProgress: 0,
        relPlatformX: 200,
        confetti: [],
        shake: 0,
        flash: 0,
        letterbox: 0,
        ringRadius: 0,
        nextTrackKey: null,
        nextTaskId: null,
        pannedToRemaining: false,
      };
      animRef.current.bubbleText = "MASUK STASIUN POCIN! SIAP TURUN!";
      animRef.current.bubbleTimer = 150;
      if (stateRef.current.soundEnabled) {
        playRemStasiun();
      }
    } else if (eventSignal.type === "couple") {
      animRef.current.coupleBounce = 34;
      animRef.current.coupleTrackKey = normalizeTrackKey(eventSignal.trackKey);
      animRef.current.bubbleText = "GERBONG BARU NYAMBUNG!";
      animRef.current.bubbleTimer = 130;
    }
  }, [eventSignal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;

    function drawFrame() {
      const st = stateRef.current;
      const anim = animRef.current;
      const cs = anim.cutscene;
      anim.frame += 1;

      const reducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const tracks = st.peronTracks;
      const focusedTrack = tracks[st.activeTrackIndex] || tracks[0];
      const focusedState = focusedTrack
        ? getOrCreateTrackState(anim.trackStates, focusedTrack.key, st.throttleMode)
        : null;

      let targetPanX = st.panIndex * 130;

      if (cs.active) {
        cs.timer += 1;
        const csTrack =
          tracks.find((tr) => tr.key === cs.trackKey) || focusedTrack;
        const csState = csTrack
          ? getOrCreateTrackState(anim.trackStates, csTrack.key, st.throttleMode)
          : focusedState;
        const csRailY = FOCAL_RAIL_Y;

        if (cs.phase === "braking") {
          cs.letterbox = Math.min(1, cs.letterbox + 0.06);
          targetPanX = Math.max(0, cs.carIndex - 1) * 130;

          if (csState) {
            const targetCarX = 486 + targetPanX - (cs.carIndex + 1) * 130;
            const desiredStationX = Math.max(
              12,
              Math.min(200, targetCarX - 165)
            );
            csState.stationX += (desiredStationX - csState.stationX) * 0.06;

            if (
              csState.currentSpeed > 0.25 &&
              !reducedMotion &&
              anim.frame % 4 === 0
            ) {
              const panVal = Math.round(anim.cameraPanX);
              const sparkCarX = 486 + panVal - (cs.carIndex + 1) * 130;
              anim.sparks.push({
                x: sparkCarX + 20,
                y: csRailY - 6,
                vx: -1.4 - (anim.frame % 3) * 0.4,
                vy: -0.9 - (anim.frame % 2) * 0.6,
                life: 16,
              });
              anim.sparks.push({
                x: sparkCarX + 94,
                y: csRailY - 6,
                vx: -1.1 - (anim.frame % 3) * 0.4,
                vy: -0.7 - (anim.frame % 2) * 0.6,
                life: 16,
              });
            }

            const readyToOpen =
              cs.timer >= 92 ||
              (cs.timer >= 60 &&
                csState.currentSpeed < 0.08 &&
                Math.abs(csState.stationX - desiredStationX) < 8);

            if (readyToOpen) {
              cs.phase = "door_open";
              cs.timer = 0;
              if (st.soundEnabled) playPintuBuka();
            }
          }
        } else if (cs.phase === "door_open") {
          cs.letterbox = 1;
          targetPanX = Math.max(0, cs.carIndex - 1) * 130;
          cs.carDoorSlide = Math.min(1, cs.timer / 36);
          cs.jumpProgress = Math.max(0, Math.min(1, (cs.timer - 50) / 78));

          if (cs.timer >= 132 && csState) {
            const panVal = Math.round(anim.cameraPanX);
            const targetCarX = 486 + panVal - (cs.carIndex + 1) * 130;
            const landX = targetCarX + 60;
            cs.relPlatformX = landX - csState.stationX;
            cs.confetti = buatKonfeti(landX, csRailY - 4, 48);
            cs.shake = reducedMotion ? 0 : 18;
            cs.flash = reducedMotion ? 0 : 14;
            cs.ringRadius = 4;
            cs.phase = "celebrate";
            cs.timer = 0;
            anim.bubbleText = "ANJAY KELAR SATU BEBAN HIDUP REK!";
            anim.bubbleTimer = 200;
            if (st.soundEnabled) playBerangkatJingle();
          }
        } else if (cs.phase === "celebrate") {
          cs.letterbox = 1;
          targetPanX = Math.max(0, cs.carIndex - 1) * 130;
          if (cs.timer > 115) {
            cs.carDoorSlide = Math.max(0, 1 - (cs.timer - 115) / 40);
          } else {
            cs.carDoorSlide = 1;
          }

          if (cs.timer === 48 && csState) {
            const landX = csState.stationX + cs.relPlatformX;
            cs.confetti.push(...buatKonfeti(landX, csRailY - 18, 28));
          }

          if (cs.ringRadius > 0 && cs.ringRadius < 52) {
            cs.ringRadius += 2.2;
          } else {
            cs.ringRadius = 0;
          }

          if (cs.timer >= 165) {
            cs.phase = "depart_boost";
            cs.timer = 0;
            anim.popupText = "+120 PENUMPANG!";
            anim.popupX = Math.min(
              CANVAS_W - 125,
              Math.max(20, 486 + Math.round(anim.cameraPanX) + 10)
            );
            anim.popupY = csRailY - 96;
            anim.popupTimer = 115;
            anim.honkFlash = 26;
            if (st.soundEnabled) playKlakson8Bit();
          }
        } else if (cs.phase === "depart_boost") {
          cs.letterbox = 1;
          if (csState) {
            csState.stationX -= csState.currentSpeed;
          }
          if (cs.timer >= 95) {
            const remainingOther = tracks.find(
              (tr) => tr.key !== cs.trackKey && tr.activeTasks.length > 0
            );
            const fallbackRemaining = tracks.find(
              (tr) => tr.activeTasks.length > 0
            );
            const targetRemaining = remainingOther || fallbackRemaining || csTrack;

            cs.nextTrackKey = targetRemaining ? targetRemaining.key : cs.trackKey;
            cs.nextTaskId = targetRemaining?.activeTasks[0]?.id || null;
            cs.phase = "pan_remaining";
            cs.timer = 0;
            cs.pannedToRemaining = false;

            tracks.forEach((tr) => {
              const tState = getOrCreateTrackState(
                anim.trackStates,
                tr.key,
                st.throttleMode
              );
              if (tState.trainOffsetX > CANVAS_W + 60) {
                tState.trainOffsetX = -240;
              }
            });

            if (cs.nextTrackKey && cs.nextTrackKey !== cs.trackKey) {
              callbacksRef.current.onChangeTrackKey(cs.nextTrackKey);
              callbacksRef.current.onSelectTask(cs.nextTaskId);
              cs.pannedToRemaining = true;
            }
          }
        } else if (cs.phase === "pan_remaining") {
          targetPanX = 0;
          cs.letterbox = Math.max(0, cs.letterbox - 0.03);
          const panLimit =
            cs.nextTrackKey && cs.nextTrackKey !== cs.trackKey ? 68 : 28;
          if (cs.timer >= panLimit) {
            cs.active = false;
            cs.phase = "idle";
            cs.letterbox = 0;
          }
        }
      } else {
        cs.letterbox = 0;
      }

      tracks.forEach((tr) => {
        const tState = getOrCreateTrackState(
          anim.trackStates,
          tr.key,
          st.throttleMode
        );

        let trackTargetSpeed = 0;
        if (cs.active) {
          if (tr.key === cs.trackKey) {
            if (cs.phase === "depart_boost") {
              trackTargetSpeed = 5.6;
            } else if (cs.phase === "pan_remaining") {
              trackTargetSpeed =
                st.throttleMode === "stasiun"
                  ? 0
                  : st.throttleMode === "ngebut"
                    ? 4.4
                    : 2.0;
            } else {
              trackTargetSpeed = 0;
            }
          } else if (cs.phase === "pan_remaining") {
            trackTargetSpeed =
              st.throttleMode === "stasiun"
                ? 0
                : st.throttleMode === "ngebut"
                  ? 4.4
                  : 2.0;
          } else {
            trackTargetSpeed = 4.6;
          }
        } else {
          if (st.throttleMode === "jalan") trackTargetSpeed = 2.0;
          else if (st.throttleMode === "ngebut") trackTargetSpeed = 4.4;
        }

        if (reducedMotion) {
          tState.currentSpeed = trackTargetSpeed > 0 ? 0.5 : 0;
        } else {
          const lerp =
            cs.active && tr.key === cs.trackKey && cs.phase === "braking"
              ? 0.05
              : 0.08;
          tState.currentSpeed += (trackTargetSpeed - tState.currentSpeed) * lerp;
          if (Math.abs(tState.currentSpeed) < 0.02 && trackTargetSpeed === 0) {
            tState.currentSpeed = 0;
          }
        }

        tState.scrollX += tState.currentSpeed;
        tState.wheelAngle += tState.currentSpeed * 0.25;

        const wantTrackDoorOpen =
          !cs.active &&
          tr.key === st.activeTrackKey &&
          st.doorsOpen &&
          tState.currentSpeed < 0.2;
        tState.doorSlide +=
          ((wantTrackDoorOpen ? 1 : 0) - tState.doorSlide) * 0.16;

        if (cs.active && cs.phase !== "pan_remaining") {
          if (tr.key === cs.trackKey) {
            tState.trainOffsetX += (0 - tState.trainOffsetX) * 0.14;
          } else {
            if (tState.trainOffsetX < CANVAS_W + 460) {
              tState.trainOffsetX += tState.currentSpeed * 1.55;
            }
            tState.stationX -= tState.currentSpeed;
            if (tState.stationX < -500) {
              tState.stationX = CANVAS_W + 60;
            }
          }
        } else {
          tState.trainOffsetX += (0 - tState.trainOffsetX) * 0.08;
          if (tr.key !== cs.trackKey || cs.phase !== "depart_boost") {
            if (!cs.active && st.throttleMode === "stasiun") {
              tState.stationX += (84 - tState.stationX) * 0.07;
            } else {
              tState.stationX -= tState.currentSpeed;
              if (tState.stationX < -500) {
                tState.stationX = CANVAS_W + 60;
              }
            }
          }
        }
      });

      const targetCameraY = st.activeTrackIndex * TRACK_PITCH;
      if (reducedMotion) {
        anim.cameraY = targetCameraY;
      } else {
        anim.cameraY += (targetCameraY - anim.cameraY) * 0.11;
      }

      anim.cameraPanX += (targetPanX - anim.cameraPanX) * 0.14;

      const skySpeed = focusedState ? focusedState.currentSpeed : 2.0;
      anim.skyScrollX += skySpeed;

      anim.bikunX += reducedMotion ? 0 : 0.5 - skySpeed * 0.12;
      if (anim.bikunX > CANVAS_W + 70) anim.bikunX = -80;
      if (anim.bikunX < -90) anim.bikunX = CANVAS_W + 60;

      if (anim.honkFlash > 0) anim.honkFlash -= 1;
      if (anim.coupleBounce > 0) anim.coupleBounce -= 1;
      if (anim.bubbleTimer > 0) anim.bubbleTimer -= 1;
      if (anim.popupTimer > 0) {
        anim.popupTimer -= 1;
        anim.popupY -= 0.4;
      }

      ctx.imageSmoothingEnabled = false;
      ctx.save();
      if (cs.shake > 0 && !reducedMotion) {
        const amp = Math.ceil(cs.shake / 4);
        const sxShake = (anim.frame % 2 === 0 ? 1 : -1) * amp;
        const syShake =
          (anim.frame % 3 === 0 ? -1 : 1) * Math.max(1, Math.floor(amp * 0.7));
        ctx.translate(sxShake, syShake);
        cs.shake -= 1;
      }

      const sky = getSkyPalette(st.weatherMode);
      const bandHeight = Math.ceil(SKYLINE_H / sky.bands.length) + 2;
      sky.bands.forEach((col, i) => {
        ctx.fillStyle = col;
        ctx.fillRect(0, i * Math.floor(SKYLINE_H / 4), CANVAS_W, bandHeight + 6);
      });

      if (sky.isDark) {
        BINTANG_KOORD.forEach(([bx, by], idx) => {
          const kedip = Math.floor((anim.frame + idx * 9) / 28) % 2 === 0;
          ctx.fillStyle = kedip ? "#F8FAFC" : "#94A3B8";
          ctx.fillRect(bx, by, 2, 2);
        });
        if (st.weatherMode !== "hujan") {
          ctx.fillStyle = "#FEF08A";
          ctx.fillRect(622, 14, 14, 14);
          ctx.fillStyle = sky.bands[0];
          ctx.fillRect(627, 12, 11, 11);
        }
      } else {
        ctx.fillStyle = "#FDE047";
        ctx.fillRect(618, 14, 18, 18);
        ctx.fillStyle = "#E0F2FE";
        const cloudOffset = Math.floor(anim.skyScrollX * 0.08) % (CANVAS_W + 80);
        [95, 310, 520].forEach((cx) => {
          const xPos =
            (((cx - cloudOffset) % (CANVAS_W + 80)) + (CANVAS_W + 80)) %
              (CANVAS_W + 80) -
            40;
          ctx.fillRect(xPos, 22, 36, 8);
          ctx.fillRect(xPos + 7, 16, 20, 6);
        });
      }

      const farOffset = Math.floor(anim.skyScrollX * 0.25) % 340;
      for (let rep = -1; rep < 3; rep++) {
        const bx = rep * 340 - farOffset;
        drawBox25D(
          ctx,
          bx + 32,
          44,
          34,
          56,
          6,
          -5,
          sky.isDark ? "#1E293B" : "#475569",
          sky.isDark ? "#334155" : "#64748B",
          sky.isDark ? "#0F172A" : "#334155",
          null
        );
        ctx.fillStyle = sky.isDark ? "#F5B700" : "#BAE6FD";
        for (let wy = 52; wy < 90; wy += 10) {
          ctx.fillRect(bx + 39, wy, 4, 4);
          ctx.fillRect(bx + 52, wy, 4, 4);
        }
        drawBox25D(
          ctx,
          bx + 114,
          62,
          66,
          38,
          6,
          -5,
          sky.isDark ? "#172033" : "#64748B",
          sky.isDark ? "#28354E" : "#94A3B8",
          sky.isDark ? "#0F172A" : "#475569",
          null
        );
        [216, 258, 298].forEach((tx) => {
          ctx.fillStyle = "#451A03";
          ctx.fillRect(bx + tx + 8, 86, 4, 14);
          ctx.fillStyle = sky.isDark ? "#14532D" : "#15803D";
          ctx.fillRect(bx + tx + 1, 70, 18, 18);
          ctx.fillStyle = sky.isDark ? "#166534" : "#22C55E";
          ctx.fillRect(bx + tx + 4, 65, 12, 8);
        });
      }

      ctx.fillStyle = sky.isDark ? "#1E293B" : "#475569";
      ctx.fillRect(0, 96, CANVAS_W, 6);
      ctx.fillStyle = sky.isDark ? "#0F172A" : "#334155";
      ctx.fillRect(0, 102, CANVAS_W, 4);

      const bikX = Math.floor(anim.bikunX);
      drawBox25D(
        ctx,
        bikX,
        82,
        36,
        14,
        4,
        -3,
        "#FACC15",
        "#FEF08A",
        "#CA8A04",
        "#0F172A"
      );
      ctx.fillStyle = "#1D4ED8";
      ctx.fillRect(bikX, 92, 36, 3);
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(bikX + 4, 85, 6, 4);
      ctx.fillRect(bikX + 13, 85, 6, 4);
      ctx.fillRect(bikX + 22, 85, 6, 4);
      ctx.fillRect(bikX + 30, 85, 4, 5);
      ctx.fillRect(bikX + 5, 95, 5, 3);
      ctx.fillRect(bikX + 25, 95, 5, 3);

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, SKYLINE_H, CANVAS_W, CANVAS_H - SKYLINE_H);
      ctx.clip();

      ctx.fillStyle = "#141823";
      ctx.fillRect(0, SKYLINE_H, CANVAS_W, CANVAS_H - SKYLINE_H);

      hitBoxesRef.current = [];
      let focusedLocoX = 486;
      let focusedLocoY = FOCAL_RAIL_Y - 72;

      tracks.forEach((tr, trackIdx) => {
        const railY = Math.round(
          FOCAL_RAIL_Y + trackIdx * TRACK_PITCH - anim.cameraY
        );
        if (railY < 58 || railY > CANVAS_H + 140) return;

        const isFocused = tr.key === st.activeTrackKey;
        const isCutsceneTrack = cs.active && cs.trackKey === tr.key;
        const tState = getOrCreateTrackState(
          anim.trackStates,
          tr.key,
          st.throttleMode
        );
        const peronStyle = tr.style;

        const sx = Math.floor(tState.stationX);
        if (sx > -520 && sx < CANVAS_W + 60) {
          ctx.fillStyle = "#475569";
          [sx + 38, sx + 225, sx + 412].forEach((px) => {
            ctx.fillRect(px, railY - 122, 7, 58);
          });
          drawBox25D(
            ctx,
            sx + 14,
            railY - 134,
            432,
            13,
            12,
            -7,
            "#1E293B",
            "#334155",
            "#0F172A",
            "#0B1020"
          );
          ctx.fillStyle = peronStyle.color;
          ctx.fillRect(sx + 14, railY - 124, 432, 3);
          ctx.fillStyle = "#F5B700";
          ctx.fillRect(sx + 14, railY - 121, 432, 2);

          ctx.fillStyle = "#0F172A";
          ctx.fillRect(sx + 128, railY - 117, 210, 16);
          ctx.strokeStyle = peronStyle.color;
          ctx.lineWidth = 2;
          ctx.strokeRect(sx + 128, railY - 117, 210, 16);
          ctx.fillStyle = "#F8FAFC";
          ctx.font = "bold 9px monospace";
          ctx.textAlign = "center";
          ctx.fillText(
            potongTeks(`ST. PONDOK CINA • ${peronStyle.nama}`, 30),
            sx + 233,
            railY - 106
          );
          ctx.textAlign = "left";

          [sx + 80, sx + 350, sx + 402].forEach((lx) => {
            ctx.fillStyle = "#FEF08A";
            ctx.fillRect(lx, railY - 119, 16, 3);
          });

          drawBox25D(
            ctx,
            sx,
            railY - 66,
            460,
            16,
            12,
            -7,
            "#475569",
            "#64748B",
            "#334155",
            "#0F172A"
          );
          ctx.fillStyle = peronStyle.color;
          ctx.fillRect(sx + 8, railY - 70, 444, 3);

          const walkShift =
            tState.doorSlide > 0.3 ? Math.floor(tState.doorSlide * 5) : 0;
          [sx + 96, sx + 188, sx + 286].forEach((mx, mIdx) => {
            const bob = Math.floor((anim.frame + mIdx * 12) / 18) % 2;
            ctx.fillStyle = "#FDBA74";
            ctx.fillRect(mx, railY - 90 + bob - walkShift, 7, 7);
            ctx.fillStyle = "#1E293B";
            ctx.fillRect(mx, railY - 93 + bob - walkShift, 7, 4);
            ctx.fillStyle = "#FACC15";
            ctx.fillRect(mx - 1, railY - 83 + bob - walkShift, 9, 8);
            ctx.fillStyle = "#1E293B";
            ctx.fillRect(mx, railY - 75 + bob - walkShift, 3, 5);
            ctx.fillRect(mx + 5, railY - 75 + bob - walkShift, 3, 5);
          });

          const rusdiX = sx + 365;
          const rusdiWave = Math.floor(anim.frame / 14) % 2;
          ctx.fillStyle = "#FDBA74";
          ctx.fillRect(rusdiX, railY - 92, 7, 7);
          ctx.fillStyle = "#0F172A";
          ctx.fillRect(rusdiX - 1, railY - 94, 9, 3);
          ctx.fillStyle = "#F97316";
          ctx.fillRect(rusdiX - 1, railY - 85, 9, 9);
          ctx.fillStyle = "#0F172A";
          ctx.fillRect(rusdiX, railY - 76, 3, 6);
          ctx.fillRect(rusdiX + 5, railY - 76, 3, 6);
          ctx.fillStyle = tState.currentSpeed < 0.2 ? "#EF4444" : "#22C55E";
          ctx.fillRect(rusdiX + 10, railY - 93 + rusdiWave * 4, 3, 8);
        }

        const poleSpacing = 155;
        const poleShift = Math.floor(tState.scrollX) % poleSpacing;
        ctx.fillStyle = "#334155";
        for (
          let px = -poleShift;
          px < CANVAS_W + poleSpacing;
          px += poleSpacing
        ) {
          ctx.fillRect(px, railY - 134, 5, 128);
          ctx.fillRect(px, railY - 128, 22, 4);
        }
        ctx.fillStyle = "#94A3B8";
        ctx.fillRect(0, railY - 122, CANVAS_W, 2);

        ctx.fillStyle = "#1D2434";
        ctx.fillRect(0, railY - 18, CANVAS_W, 40);

        ctx.fillStyle = "#2A3347";
        const gravelShift = Math.floor(tState.scrollX) % 26;
        for (let gx = -gravelShift; gx < CANVAS_W; gx += 26) {
          ctx.fillRect(gx + 3, railY + 6, 5, 2);
          ctx.fillRect(gx + 15, railY + 12, 4, 2);
          ctx.fillRect(gx + 9, railY - 4, 5, 2);
        }

        ctx.fillStyle = "#4A3628";
        const sleeperShift = Math.floor(tState.scrollX) % 20;
        for (let tx = -sleeperShift; tx < CANVAS_W + 20; tx += 20) {
          ctx.beginPath();
          ctx.moveTo(tx, railY + 2);
          ctx.lineTo(tx + 12, railY - 10);
          ctx.lineTo(tx + 19, railY - 10);
          ctx.lineTo(tx + 7, railY + 2);
          ctx.closePath();
          ctx.fill();
        }

        ctx.fillStyle = "#475569";
        ctx.fillRect(0, railY - 10, CANVAS_W, 3);
        ctx.fillStyle = "#CBD5E1";
        ctx.fillRect(0, railY - 10, CANVAS_W, 1);

        ctx.fillStyle = "#64748B";
        ctx.fillRect(0, railY - 1, CANVAS_W, 5);
        ctx.fillStyle = isFocused ? "#F8FAFC" : "#94A3B8";
        ctx.fillRect(0, railY - 1, CANVAS_W, 2);

        const badgeText = `REL ${trackIdx + 1}: ${potongTeks(peronStyle.nama, 12)}`;
        const badgeW = Math.min(132, badgeText.length * 6 + 14);
        ctx.fillStyle = isFocused ? peronStyle.color : "#1E293B";
        ctx.fillRect(8, railY - 22, badgeW, 15);
        ctx.strokeStyle = peronStyle.color;
        ctx.lineWidth = isFocused ? 2 : 1.5;
        ctx.strokeRect(8, railY - 22, badgeW, 15);
        ctx.fillStyle = isFocused ? "#0B1020" : peronStyle.color;
        ctx.font = "bold 8px monospace";
        ctx.fillText(badgeText, 14, railY - 12);

        let renderList = [...tr.activeTasks];
        if (
          isCutsceneTrack &&
          cs.phase !== "depart_boost" &&
          cs.phase !== "pan_remaining" &&
          cs.task &&
          !renderList.some((t) => t.id === cs.task.id)
        ) {
          const insertPos = Math.min(cs.carIndex, renderList.length);
          renderList.splice(insertPos, 0, cs.task);
        }

        const panShift =
          isFocused || (isCutsceneTrack && cs.phase !== "pan_remaining")
            ? Math.round(anim.cameraPanX)
            : 0;
        const bounceOffset =
          anim.coupleBounce > 0 && anim.coupleTrackKey === tr.key
            ? Math.round(Math.sin(anim.coupleBounce * 0.5) * 4)
            : 0;
        const rumbleY =
          tState.currentSpeed > 0.4 && !reducedMotion && anim.frame % 10 < 5
            ? -1
            : 0;

        const locoW = 136;
        const locoH = 62;
        const locoX = 486 + panShift + Math.round(tState.trainOffsetX);
        const locoY = railY - 72 + rumbleY;

        if (isFocused) {
          focusedLocoX = locoX;
          focusedLocoY = locoY;
        }

        const carW = 118;
        const carH = 58;
        const carStep = 130;

        if (isFocused && (!cs.active || cs.phase === "pan_remaining")) {
          const ghostIndex = renderList.length;
          const ghostX = locoX - (ghostIndex + 1) * carStep;
          const ghostY = railY - 68 + rumbleY;

          if (ghostX + carW > -20 && ghostX < CANVAS_W + 20) {
            ctx.fillStyle = st.isAddingOpen ? "#F5B700" : peronStyle.color;
            ctx.fillRect(ghostX + carW, ghostY + 28, 12, 4);

            const pulse = Math.floor(anim.frame / 18) % 2 === 0;
            const blueprintBorder = st.isAddingOpen
              ? "#F5B700"
              : pulse
                ? peronStyle.color
                : "#64748B";

            ctx.save();
            ctx.fillStyle = st.isAddingOpen
              ? "rgba(245, 183, 0, 0.22)"
              : "rgba(56, 189, 248, 0.14)";
            ctx.fillRect(ghostX, ghostY, carW, carH);

            ctx.beginPath();
            ctx.moveTo(ghostX, ghostY);
            ctx.lineTo(ghostX + 16, ghostY - 12);
            ctx.lineTo(ghostX + carW + 16, ghostY - 12);
            ctx.lineTo(ghostX + carW, ghostY);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = blueprintBorder;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 4]);
            ctx.strokeRect(ghostX, ghostY, carW, carH);
            ctx.beginPath();
            ctx.moveTo(ghostX, ghostY);
            ctx.lineTo(ghostX + 16, ghostY - 12);
            ctx.lineTo(ghostX + carW + 16, ghostY - 12);
            ctx.lineTo(ghostX + carW, ghostY);
            ctx.stroke();
            ctx.restore();

            ctx.fillStyle = st.isAddingOpen ? "#FDE047" : peronStyle.color;
            ctx.fillRect(ghostX + 55, ghostY + 11, 8, 22);
            ctx.fillRect(ghostX + 48, ghostY + 18, 22, 8);
            ctx.font = "bold 9px monospace";
            ctx.textAlign = "center";
            ctx.fillText("+ GERBONG TUGAS", ghostX + carW / 2, ghostY + 48);
            ctx.textAlign = "left";

            hitBoxesRef.current.push({
              id: `add-slot-${tr.key}`,
              kind: "add",
              trackKey: tr.key,
              x: ghostX - 4,
              y: Math.max(SKYLINE_H, ghostY - 14),
              w: carW + 22,
              h: carH + 20,
            });
          }
        }

        for (let i = renderList.length - 1; i >= 0; i--) {
          const task = renderList[i];
          const carX = locoX - (i + 1) * carStep;
          if (carX + carW + 24 < 0 || carX > CANVAS_W + 20) continue;

          const isDepartingCar =
            isCutsceneTrack &&
            cs.phase !== "depart_boost" &&
            cs.phase !== "pan_remaining" &&
            cs.task?.id === task.id;
          const isFirstNew =
            i === 0 &&
            anim.coupleBounce > 0 &&
            anim.coupleTrackKey === tr.key;
          const carY = railY - 68 + rumbleY + (isFirstNew ? bounceOffset : 0);

          ctx.fillStyle = "#0F172A";
          ctx.fillRect(carX + carW, carY + 8, 12, carH - 12);
          ctx.fillStyle = "#334155";
          ctx.fillRect(carX + carW + 3, carY + 10, 6, carH - 16);

          drawBox25D(
            ctx,
            carX,
            carY,
            carW,
            carH,
            16,
            -12,
            "#CBD5E1",
            "#64748B",
            null,
            "#0F172A"
          );

          ctx.fillStyle = "#94A3B8";
          ctx.fillRect(carX + 2, carY + 5, carW - 4, 2);
          ctx.fillStyle = peronStyle.color;
          ctx.fillRect(carX + 2, carY + 49, carW - 4, 5);
          ctx.fillRect(carX + 8, carY - 7, carW, 3);

          drawBox25D(
            ctx,
            carX + 28,
            carY - 15,
            34,
            8,
            8,
            -6,
            "#94A3B8",
            "#F1F5F9",
            "#475569",
            "#0F172A"
          );
          ctx.fillStyle = "#334155";
          ctx.fillRect(carX + 32, carY - 12, 24, 2);

          drawBox25D(
            ctx,
            carX + 76,
            carY - 15,
            28,
            8,
            8,
            -6,
            "#94A3B8",
            "#F1F5F9",
            "#475569",
            "#0F172A"
          );
          ctx.fillStyle = "#334155";
          ctx.fillRect(carX + 80, carY - 12, 18, 2);

          ctx.fillStyle = "#DC2626";
          ctx.fillRect(carX + 1, carY + 32, carW - 2, 8);
          ctx.fillStyle = "#F8FAFC";
          ctx.fillRect(carX + 1, carY + 40, carW - 2, 2);
          ctx.fillStyle = "#F5B700";
          ctx.fillRect(carX + 1, carY + 42, carW - 2, 4);

          const effectiveDoor = isDepartingCar
            ? Math.max(tState.doorSlide, cs.carDoorSlide)
            : tState.doorSlide;
          const doorSlidePx = Math.round(effectiveDoor * 7);

          [carX + 18, carX + 78].forEach((dx) => {
            ctx.fillStyle =
              isDepartingCar && effectiveDoor > 0.2 ? "#DCFCE7" : "#FEF3C7";
            ctx.fillRect(dx, carY + 11, 20, 41);
            ctx.fillStyle = "#F5B700";
            ctx.fillRect(dx + 5, carY + 13, 2, 4);
            ctx.fillRect(dx + 13, carY + 13, 2, 4);

            ctx.fillStyle = "#94A3B8";
            ctx.fillRect(dx - doorSlidePx, carY + 11, 10, 41);
            ctx.fillRect(dx + 10 + doorSlidePx, carY + 11, 10, 41);
            ctx.fillStyle = "#0F172A";
            ctx.fillRect(dx + 3 - doorSlidePx, carY + 15, 4, 12);
            ctx.fillRect(dx + 13 + doorSlidePx, carY + 15, 4, 12);
          });

          [carX + 5, carX + 44, carX + 60, carX + 103].forEach((wx, wIdx) => {
            ctx.fillStyle = sky.isDark ? "#FDE68A" : "#93C5FD";
            ctx.fillRect(wx, carY + 12, 10, 14);
            ctx.strokeStyle = "#1E293B";
            ctx.lineWidth = 1;
            ctx.strokeRect(wx, carY + 12, 10, 14);
            if (wIdx % 2 === 0) {
              ctx.fillStyle = "#0F172A";
              ctx.fillRect(wx + 3, carY + 18, 4, 8);
            }
          });

          ctx.fillStyle = "#1E293B";
          ctx.fillRect(carX + 38, carY + carH, 42, 6);
          ctx.fillStyle = "#334155";
          ctx.fillRect(carX + 42, carY + carH + 1, 14, 4);
          ctx.fillRect(carX + 62, carY + carH + 1, 14, 4);

          [carX + 12, carX + 82].forEach((bx) => {
            ctx.fillStyle = "#0F172A";
            ctx.fillRect(bx, carY + carH - 1, 24, 6);
            ctx.fillStyle = "#475569";
            ctx.fillRect(bx + 8, carY + carH + 1, 8, 3);
            [bx + 4, bx + 18].forEach((wx) => {
              ctx.fillStyle = "#334155";
              ctx.fillRect(wx - 3, carY + carH + 1, 8, 8);
              ctx.fillStyle = "#CBD5E1";
              ctx.fillRect(wx - 2, carY + carH + 2, 6, 6);
              ctx.fillStyle = "#0F172A";
              const spoke = Math.floor(tState.wheelAngle) % 2;
              ctx.fillRect(wx + spoke, carY + carH + 4, 2, 2);
            });
          });

          if (isFocused && !isDepartingCar) {
            hitBoxesRef.current.push({
              id: task.id,
              kind: "task",
              trackKey: tr.key,
              x: carX,
              y: Math.max(SKYLINE_H, carY - 58),
              w: carW + 14,
              h: carH + 66,
            });
          }

          const statusKey = getTaskUrgenStatus(task, st.now);
          const isSelected =
            isFocused && task.id === st.selectedTaskId && !isDepartingCar;

          let borderColor = "#38BDF8";
          let beaconColor = "#38BDF8";
          if (isDepartingCar) {
            borderColor = "#4ADE80";
            beaconColor = "#4ADE80";
          } else if (statusKey === "telat") {
            borderColor = "#EF4444";
            beaconColor =
              Math.floor(anim.frame / 10) % 2 === 0 ? "#EF4444" : "#7F1D1D";
            if (!reducedMotion && anim.frame % 16 === 0) {
              anim.smokeParticles.push({
                x: carX + 54,
                y: carY - 18,
                life: 36,
              });
            }
          } else if (statusKey === "boarding") {
            borderColor = "#F5B700";
            beaconColor =
              Math.floor(anim.frame / 14) % 2 === 0 ? "#F5B700" : "#78350F";
          }
          if (isSelected) borderColor = "#FACC15";

          ctx.fillStyle = beaconColor;
          ctx.fillRect(carX + 64, carY - 16, 8, 5);

          if (isSelected || isDepartingCar) {
            ctx.strokeStyle = isDepartingCar ? "#4ADE80" : "#FACC15";
            ctx.lineWidth = 2.5;
            ctx.strokeRect(carX - 2, carY - 2, carW + 4, carH + 4);
          }

          const boardX = carX + 2;
          const boardY = carY - 54;
          const boardW = carW - 4;
          const boardH = 35;

          ctx.fillStyle = borderColor;
          ctx.fillRect(carX + 58, boardY + boardH, 2, 5);

          ctx.fillStyle =
            isSelected || isDepartingCar ? "#1E293B" : "rgba(15, 23, 42, 0.92)";
          ctx.fillRect(boardX, boardY, boardW, boardH);

          ctx.fillStyle = peronStyle.color;
          ctx.fillRect(boardX, boardY, boardW, 11);
          ctx.fillStyle = "#0B1020";
          ctx.font = "bold 8px monospace";
          ctx.fillText(potongTeks(peronStyle.label, 21), boardX + 5, boardY + 8);

          ctx.strokeStyle = peronStyle.color;
          ctx.lineWidth = isSelected || isDepartingCar ? 2.5 : 1.5;
          ctx.strokeRect(boardX, boardY, boardW, boardH);

          ctx.fillStyle = borderColor;
          ctx.font = "bold 8px monospace";
          ctx.fillText(
            isDepartingCar
              ? `G${i + 1} • TURUN!`
              : `G${i + 1} • ${formatJamSingkat(task.dueAt)}`,
            boardX + 5,
            boardY + 21
          );

          ctx.fillStyle = "#F8FAFC";
          ctx.font = "bold 8px monospace";
          ctx.fillText(potongTeks(task.title, 16), boardX + 5, boardY + 31);

          if (isSelected) {
            const arrowBob = Math.floor(anim.frame / 12) % 2 === 0 ? 0 : 3;
            ctx.fillStyle = "#FACC15";
            ctx.fillRect(carX + 55, boardY - 10 + arrowBob, 8, 4);
            ctx.fillRect(carX + 57, boardY - 6 + arrowBob, 4, 3);
          }
        }

        if (locoX + locoW + 24 > 0 && locoX < CANVAS_W + 40) {
          if (isFocused) {
            hitBoxesRef.current.push({
              id: `lokomotif-${tr.key}`,
              kind: "loco",
              trackKey: tr.key,
              x: locoX,
              y: Math.max(SKYLINE_H, locoY - 28),
              w: locoW + 20,
              h: locoH + 34,
            });
          }

          drawBox25D(
            ctx,
            locoX,
            locoY,
            locoW,
            locoH,
            18,
            -13,
            "#E2E8F0",
            "#64748B",
            "#94A3B8",
            "#0F172A"
          );

          ctx.fillStyle = "#CBD5E1";
          ctx.fillRect(locoX + 2, locoY + 5, locoW - 4, 2);
          ctx.fillStyle = peronStyle.color;
          ctx.fillRect(locoX + 8, locoY - 7, locoW, 3);

          drawBox25D(
            ctx,
            locoX + 60,
            locoY - 15,
            36,
            8,
            8,
            -6,
            "#94A3B8",
            "#F8FAFC",
            "#475569",
            "#0F172A"
          );
          ctx.fillStyle = "#334155";
          ctx.fillRect(locoX + 65, locoY - 12, 24, 2);

          const pantoX = locoX + 24;
          const pantoY = locoY - 9;
          ctx.fillStyle = "#DC2626";
          ctx.fillRect(pantoX + 2, pantoY - 2, 5, 3);
          ctx.fillRect(pantoX + 18, pantoY - 2, 5, 3);

          ctx.strokeStyle = "#E2E8F0";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(pantoX + 4, pantoY - 2);
          ctx.lineTo(pantoX - 6, pantoY - 24);
          ctx.lineTo(pantoX + 12, railY - 122);
          ctx.lineTo(pantoX + 29, pantoY - 24);
          ctx.lineTo(pantoX + 20, pantoY - 2);
          ctx.stroke();

          ctx.fillStyle = "#F8FAFC";
          ctx.fillRect(pantoX + 2, railY - 124, 22, 3);

          if (tState.currentSpeed > 0.6 && !reducedMotion && anim.frame % 7 === 0) {
            anim.sparks.push({
              x: pantoX + 12,
              y: railY - 122,
              vx: -1.8 - (anim.frame % 3) * 0.5,
              vy: (anim.frame % 2 === 0 ? -1 : 1) * 0.9,
              life: 11,
            });
          }

          ctx.fillStyle = "#DC2626";
          ctx.fillRect(locoX + 1, locoY + 34, locoW - 2, 9);
          ctx.fillStyle = "#F8FAFC";
          ctx.fillRect(locoX + 1, locoY + 43, locoW - 2, 2);
          ctx.fillStyle = "#F5B700";
          ctx.fillRect(locoX + 1, locoY + 45, locoW - 2, 4);

          ctx.fillStyle = peronStyle.color;
          ctx.fillRect(locoX + 2, locoY + 51, locoW - 4, 4);

          ctx.fillStyle = "#DC2626";
          ctx.beginPath();
          ctx.moveTo(locoX + locoW, locoY + 34);
          ctx.lineTo(locoX + locoW + 17, locoY + 21);
          ctx.lineTo(locoX + locoW + 17, locoY + 34);
          ctx.lineTo(locoX + locoW, locoY + 47);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "#F5B700";
          ctx.beginPath();
          ctx.moveTo(locoX + locoW, locoY + 47);
          ctx.lineTo(locoX + locoW + 17, locoY + 34);
          ctx.lineTo(locoX + locoW + 17, locoY + 39);
          ctx.lineTo(locoX + locoW, locoY + 52);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "#0F172A";
          ctx.beginPath();
          ctx.moveTo(locoX + locoW + 2, locoY + 4);
          ctx.lineTo(locoX + locoW + 16, locoY - 7);
          ctx.lineTo(locoX + locoW + 16, locoY + 17);
          ctx.lineTo(locoX + locoW + 2, locoY + 28);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "#38BDF8";
          ctx.fillRect(locoX + locoW + 6, locoY + 4, 4, 9);
          ctx.fillStyle = "#94A3B8";
          ctx.fillRect(locoX + locoW + 5, locoY + 17, 2, 7);
          ctx.fillRect(locoX + locoW + 11, locoY + 12, 2, 7);

          ctx.fillStyle = peronStyle.color;
          ctx.fillRect(locoX + locoW + 4, locoY - 4, 10, 4);

          ctx.fillStyle = "#991B1B";
          ctx.fillRect(locoX + locoW - 2, locoY + locoH - 8, 16, 10);
          ctx.fillStyle = "#334155";
          ctx.fillRect(locoX + locoW + 14, locoY + locoH - 5, 5, 4);

          ctx.fillStyle = "#1E293B";
          ctx.fillRect(locoX + 106, locoY + 10, 22, 18);
          ctx.fillStyle = "#FDBA74";
          ctx.fillRect(locoX + 115, locoY + 15, 7, 7);
          ctx.fillStyle = "#0F172A";
          ctx.fillRect(locoX + 115, locoY + 13, 7, 3);
          ctx.fillStyle = "#F97316";
          ctx.fillRect(locoX + 114, locoY + 22, 9, 6);

          const locoDoorSlide = Math.round(tState.doorSlide * 7);
          [locoX + 18, locoX + 66].forEach((dx) => {
            ctx.fillStyle = "#FEF3C7";
            ctx.fillRect(dx, locoY + 11, 20, 44);
            ctx.fillStyle = "#F5B700";
            ctx.fillRect(dx + 5, locoY + 13, 2, 4);
            ctx.fillRect(dx + 13, locoY + 13, 2, 4);

            ctx.fillStyle = "#CBD5E1";
            ctx.fillRect(dx - locoDoorSlide, locoY + 11, 10, 44);
            ctx.fillRect(dx + 10 + locoDoorSlide, locoY + 11, 10, 44);
            ctx.fillStyle = "#0F172A";
            ctx.fillRect(dx + 3 - locoDoorSlide, locoY + 15, 4, 12);
            ctx.fillRect(dx + 13 + locoDoorSlide, locoY + 15, 4, 12);
          });

          [locoX + 4, locoX + 44, locoX + 91].forEach((wx) => {
            ctx.fillStyle = sky.isDark ? "#FDE68A" : "#93C5FD";
            ctx.fillRect(wx, locoY + 12, 10, 14);
            ctx.strokeStyle = "#1E293B";
            ctx.lineWidth = 1;
            ctx.strokeRect(wx, locoY + 12, 10, 14);
          });

          ctx.fillStyle = "#1E293B";
          ctx.fillRect(locoX + 46, locoY + locoH, 42, 6);
          [locoX + 14, locoX + 96].forEach((bx) => {
            ctx.fillStyle = "#0F172A";
            ctx.fillRect(bx, locoY + locoH - 1, 26, 6);
            ctx.fillStyle = "#475569";
            ctx.fillRect(bx + 9, locoY + locoH + 1, 8, 3);
            [bx + 5, bx + 20].forEach((wx) => {
              ctx.fillStyle = "#334155";
              ctx.fillRect(wx - 3, locoY + locoH + 1, 8, 8);
              ctx.fillStyle = "#E2E8F0";
              ctx.fillRect(wx - 2, locoY + locoH + 2, 6, 6);
              ctx.fillStyle = "#0F172A";
              const spoke = Math.floor(tState.wheelAngle) % 2;
              ctx.fillRect(wx + spoke, locoY + locoH + 4, 2, 2);
            });
          });

          const lampuTerang =
            sky.isDark || anim.honkFlash > 0 || tState.currentSpeed > 0.2;
          if (lampuTerang) {
            const beamAlpha =
              anim.honkFlash > 0 ? 0.38 : sky.isDark ? 0.22 : 0.12;
            ctx.fillStyle = `rgba(254, 240, 138, ${beamAlpha})`;
            ctx.beginPath();
            ctx.moveTo(locoX + locoW + 15, locoY + 34);
            ctx.lineTo(CANVAS_W + 20, locoY + 14);
            ctx.lineTo(CANVAS_W + 20, locoY + 64);
            ctx.lineTo(locoX + locoW + 15, locoY + 46);
            ctx.closePath();
            ctx.fill();
          }
          ctx.fillStyle = anim.honkFlash > 0 ? "#FFFFFF" : "#FEF08A";
          ctx.fillRect(locoX + locoW + 12, locoY + 35, 4, 4);
          ctx.fillRect(locoX + locoW + 4, locoY + 41, 4, 4);
          ctx.fillStyle = "#EF4444";
          ctx.fillRect(locoX + locoW + 12, locoY + 26, 3, 3);
        }

        if (sx > -520 && sx < CANVAS_W + 60) {
          drawBox25D(
            ctx,
            sx,
            railY + 14,
            460,
            18,
            12,
            -5,
            "#1E293B",
            "#334155",
            "#0F172A",
            "#0B1020"
          );
          ctx.fillStyle = peronStyle.color;
          ctx.fillRect(sx + 6, railY + 9, 448, 3);

          const idleSpots = [62, 162, 355];
          const chillingAnomali = tr.completedTasks
            .filter((t) => !(cs.active && cs.task?.id === t.id))
            .slice(-3);

          chillingAnomali.forEach((doneTask, idx) => {
            const ax = sx + idleSpots[idx];
            if (ax < -20 || ax > CANVAS_W + 20) return;
            const info = getAnomaliInfo(doneTask);
            drawAnomaliCreature(
              ctx,
              info.type,
              ax,
              railY + 24,
              anim.frame + idx * 7,
              false
            );
            ctx.fillStyle = peronStyle.color;
            ctx.fillRect(ax - 7, railY - 14, 14, 10);
            ctx.strokeStyle = "#0F172A";
            ctx.lineWidth = 1;
            ctx.strokeRect(ax - 7, railY - 14, 14, 10);
            ctx.fillStyle = "#0B1020";
            ctx.font = "bold 7px monospace";
            ctx.fillText("OK", ax - 4, railY - 7);
          });
        }

        if (isCutsceneTrack && cs.task) {
          const targetCarX = locoX - (cs.carIndex + 1) * carStep;

          if (cs.phase === "door_open" || cs.phase === "celebrate") {
            const spotX =
              cs.phase === "door_open"
                ? targetCarX + 28 + cs.jumpProgress * 32
                : tState.stationX + cs.relPlatformX;
            if (spotX > -80 && spotX < CANVAS_W + 80) {
              ctx.save();
              ctx.globalAlpha = cs.phase === "celebrate" ? 0.22 : 0.16;
              ctx.fillStyle = peronStyle.color;
              ctx.beginPath();
              ctx.moveTo(spotX - 12, railY - 122);
              ctx.lineTo(spotX + 12, railY - 122);
              ctx.lineTo(spotX + 44, railY + 26);
              ctx.lineTo(spotX - 44, railY + 26);
              ctx.closePath();
              ctx.fill();
              ctx.restore();
            }
          }

          if (cs.phase === "door_open") {
            const t = cs.jumpProgress;
            const startX = targetCarX + 28;
            const startY = railY - 26;
            const endX = targetCarX + 60;
            const endY = railY + 24;

            const curX = startX + (endX - startX) * t;
            const arcY = -Math.sin(t * Math.PI) * 52;
            const curY = startY + (endY - startY) * t + arcY;

            if (t > 0.05 && t < 0.95) {
              [0.08, 0.16, 0.24].forEach((lag, lIdx) => {
                const pt = Math.max(0, t - lag);
                const px = startX + (endX - startX) * pt;
                const py =
                  startY +
                  (endY - startY) * pt -
                  Math.sin(pt * Math.PI) * 52 -
                  12;
                ctx.fillStyle = lIdx % 2 === 0 ? peronStyle.color : "#FEF08A";
                ctx.fillRect(
                  Math.round(px) - 2,
                  Math.round(py),
                  4 - lIdx,
                  4 - lIdx
                );
              });
            }

            drawAnomaliCreature(
              ctx,
              cs.anomali.type,
              curX,
              curY,
              anim.frame,
              t > 0.05 && t < 0.95
            );
            drawAnomaliBanner(
              ctx,
              curX,
              curY - 62,
              cs.task.title,
              cs.anomali.nama,
              CANVAS_W,
              peronStyle
            );
          } else if (cs.phase === "celebrate" || cs.phase === "depart_boost") {
            const ax = tState.stationX + cs.relPlatformX;
            if (ax > -110 && ax < CANVAS_W + 110) {
              if (cs.phase === "celebrate" && cs.ringRadius > 0) {
                const rw = Math.round(cs.ringRadius * 2);
                const rh = Math.max(6, Math.round(cs.ringRadius * 0.35));
                ctx.strokeStyle = cs.ringRadius < 24 ? "#FACC15" : "#4ADE80";
                ctx.lineWidth = 2;
                ctx.strokeRect(
                  Math.round(ax - rw / 2),
                  Math.round(railY + 23 - rh / 2),
                  rw,
                  rh
                );
              }

              drawAnomaliCreature(
                ctx,
                cs.anomali.type,
                ax,
                railY + 24,
                anim.frame,
                true
              );
              drawAnomaliBanner(
                ctx,
                ax,
                railY - 38,
                cs.task.title,
                cs.anomali.nama,
                CANVAS_W,
                peronStyle
              );
            }
          }

          cs.confetti = cs.confetti.filter((c) => c.life > 0);
          cs.confetti.forEach((c) => {
            c.x +=
              c.vx - (cs.phase === "depart_boost" ? tState.currentSpeed : 0);
            c.y += c.vy;
            c.vy += 0.12;
            c.life -= 1;
            ctx.fillStyle = c.color;
            ctx.fillRect(Math.floor(c.x), Math.floor(c.y), 4, 4);
          });
        }

        if (!isFocused) {
          const bandTop = Math.max(SKYLINE_H, railY - 82);
          const bandBottom = Math.min(CANVAS_H, railY + 34);
          if (bandBottom > bandTop) {
            ctx.fillStyle = "rgba(7, 11, 22, 0.28)";
            ctx.fillRect(0, bandTop, CANVAS_W, bandBottom - bandTop);
            hitBoxesRef.current.push({
              id: `switch-${tr.key}`,
              kind: "switch-track",
              trackKey: tr.key,
              x: 0,
              y: bandTop,
              w: CANVAS_W,
              h: bandBottom - bandTop,
            });
          }
        }
      });

      anim.smokeParticles = anim.smokeParticles.filter((p) => p.life > 0);
      anim.smokeParticles.forEach((p) => {
        p.y -= 0.5;
        p.x -= skySpeed * 0.4;
        p.life -= 1;
        ctx.fillStyle =
          p.life > 18 ? "rgba(239, 68, 68, 0.78)" : "rgba(148, 163, 184, 0.55)";
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 6, 6);
      });

      anim.sparks = anim.sparks.filter((s) => s.life > 0);
      anim.sparks.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 1;
        ctx.fillStyle = s.life % 2 === 0 ? "#FEF08A" : "#38BDF8";
        ctx.fillRect(Math.floor(s.x), Math.floor(s.y), 3, 3);
      });

      ctx.restore();

      if (st.weatherMode === "hujan") {
        ctx.fillStyle = "rgba(186, 230, 253, 0.55)";
        anim.rainDrops.forEach((d) => {
          ctx.fillRect(Math.floor(d.x), Math.floor(d.y), 1, d.len);
          if (!reducedMotion) {
            d.x -= 1.3 + skySpeed * 0.35;
            d.y += 5;
            if (d.y > CANVAS_H) {
              d.y = -8;
              d.x = (d.x + CANVAS_W + 40) % CANVAS_W;
            }
          }
        });
      }

      ctx.restore();

      const hudTop = cs.letterbox > 0 ? Math.round(cs.letterbox * 12) + 4 : 10;

      if (anim.bubbleTimer > 0 && anim.bubbleText) {
        const bw = Math.min(246, anim.bubbleText.length * 6.2 + 20);
        const bx = Math.max(
          12,
          Math.min(CANVAS_W - bw - 12, focusedLocoX + 115 - bw)
        );
        const by = Math.max(hudTop + 28, Math.min(CANVAS_H - 36, focusedLocoY - 38));
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(bx, by, bw, 20);
        ctx.strokeStyle = "#0F172A";
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, 20);
        ctx.fillStyle = "#0F172A";
        ctx.font = "bold 9px monospace";
        ctx.fillText(anim.bubbleText, bx + 8, by + 13);
      }

      if (anim.popupTimer > 0 && anim.popupText) {
        const px = anim.popupX;
        ctx.fillStyle = "#0F172A";
        ctx.fillRect(px, Math.floor(anim.popupY) - 12, 114, 16);
        ctx.strokeStyle = "#4ADE80";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px, Math.floor(anim.popupY) - 12, 114, 16);
        ctx.fillStyle = "#4ADE80";
        ctx.font = "bold 9px monospace";
        ctx.fillText(anim.popupText, px + 6, Math.floor(anim.popupY));
      }

      if (cs.active) {
        let bannerTitle = "";
        let bannerBorder = "#F5B700";
        let bannerTextCol = "#FACC15";

        const peronCs = getPeronStyle(cs.task?.jalur || cs.trackKey);

        if (cs.phase === "braking") {
          bannerTitle = `REM ${potongTeks(peronCs.nama, 12)} | KERETA LAIN LANJUT`;
          bannerBorder = peronCs.color;
          bannerTextCol = peronCs.color;
        } else if (cs.phase === "door_open") {
          bannerTitle = `PINTU G${cs.carIndex + 1} DIBUKA! ${potongTeks(peronCs.label, 20)}`;
          bannerBorder = peronCs.color;
          bannerTextCol = peronCs.color;
        } else if (cs.phase === "celebrate") {
          bannerTitle = `ANJAY KELAR! "${potongTeks(cs.task?.title, 14)}" DI ${potongTeks(peronCs.nama, 12)}`;
          bannerBorder = peronCs.color;
          bannerTextCol = "#4ADE80";
        } else if (cs.phase === "depart_boost") {
          bannerTitle = "TUGAS TURUN! KRL TANCAP GAS BERANGKAT!";
          bannerBorder = "#FACC15";
          bannerTextCol = "#FACC15";
        } else if (cs.phase === "pan_remaining") {
          const nextPeron = getPeronStyle(cs.nextTrackKey || cs.trackKey);
          bannerTitle =
            cs.nextTrackKey && cs.nextTrackKey !== cs.trackKey
              ? `GESER KAMERA KE SISA PERON: ${potongTeks(nextPeron.nama, 14)}`
              : "PERON INI STERIL! LANJUT PANTAU REL";
          bannerBorder = nextPeron.color;
          bannerTextCol = nextPeron.color;
        }

        if (bannerTitle) {
          const bw = Math.min(410, Math.max(230, bannerTitle.length * 6.1 + 22));
          const bx = CANVAS_W - bw - 10;
          const bannerY = st.activeTrackIndex > 0 ? hudTop + 28 : hudTop;
          ctx.fillStyle = "rgba(11, 16, 32, 0.92)";
          ctx.fillRect(bx, bannerY, bw, 24);
          ctx.strokeStyle = bannerBorder;
          ctx.lineWidth = 2;
          ctx.strokeRect(bx, bannerY, bw, 24);
          ctx.fillStyle = bannerTextCol;
          ctx.font = "bold 9px monospace";
          ctx.fillText(bannerTitle, bx + 10, bannerY + 15);
        }
      }

      const activeFocusSpeed = focusedState ? focusedState.currentSpeed : 0;
      const activeFocusCars = focusedTrack ? focusedTrack.activeTasks.length : 0;
      const focusLabel = focusedTrack
        ? `R${st.activeTrackIndex + 1} ${potongTeks(focusedTrack.style.nama, 8)}`
        : "R1";

      ctx.fillStyle = "rgba(15, 23, 42, 0.86)";
      ctx.fillRect(10, hudTop, 198, 24);
      ctx.strokeStyle = focusedTrack ? focusedTrack.style.color : "#3B4D72";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(10, hudTop, 198, 24);
      ctx.fillStyle = "#F5B700";
      ctx.font = "bold 9px monospace";
      const kmh = Math.round(activeFocusSpeed * 22);
      ctx.fillText(
        `${focusLabel} | ${kmh}KM/J | G:${activeFocusCars}`,
        16,
        hudTop + 15
      );

      if (cs.flash > 0) {
        const flashAlpha = (cs.flash / 14) * 0.28;
        ctx.fillStyle = `rgba(254, 249, 195, ${flashAlpha.toFixed(3)})`;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        cs.flash -= 1;
      }

      if (cs.letterbox > 0) {
        const barH = Math.round(cs.letterbox * 12);
        ctx.fillStyle = "#050811";
        ctx.fillRect(0, 0, CANVAS_W, barH);
        ctx.fillRect(0, CANVAS_H - barH, CANVAS_W, barH);
      }

      rafId = requestAnimationFrame(drawFrame);
    }

    rafId = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const triggerKlaksons = () => {
    const idx = animRef.current.frame % CELETUKAN_MAS_RUSDI.length;
    const quote = CELETUKAN_MAS_RUSDI[idx];
    setBubbleText(quote);
    animRef.current.bubbleText = quote;
    animRef.current.bubbleTimer = 150;
    animRef.current.honkFlash = 24;
    if (soundEnabled) {
      playKlakson8Bit();
    }
  };

  const handleSwitchTrack = (targetTrack) => {
    if (!targetTrack) return;
    onChangeTrackKey(targetTrack.key);
    onSelectTask(targetTrack.activeTasks[0]?.id || null);
    setPanIndex(0);
    if (isAddingOpen) onCloseAddForm();
    if (soundEnabled) playSelectBlip();
  };

  const handleStepTrack = (delta) => {
    const nextIdx = activeTrackIndex + delta;
    if (nextIdx < 0 || nextIdx >= peronTracks.length) return;
    handleSwitchTrack(peronTracks[nextIdx]);
  };

  const handleSetThrottle = (mode) => {
    setThrottleMode(mode);
    if (mode !== "stasiun") {
      setDoorsOpen(false);
    }
    if (soundEnabled) playSelectBlip();
  };

  const handleTogglePintu = () => {
    if (throttleMode !== "stasiun") {
      setThrottleMode("stasiun");
      setDoorsOpen(true);
      animRef.current.bubbleText = "REM PAKEM! PINTU PERON DIBUKA!";
      animRef.current.bubbleTimer = 120;
    } else {
      setDoorsOpen((prev) => !prev);
    }
    if (soundEnabled) playSelectBlip();
  };

  const handleCycleCuaca = () => {
    const nextIdx = (CUACA_URUTAN.indexOf(weatherMode) + 1) % CUACA_URUTAN.length;
    setWeatherMode(CUACA_URUTAN[nextIdx]);
    if (soundEnabled) playSelectBlip();
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) * CANVAS_W) / rect.width;
    const clickY = ((e.clientY - rect.top) * CANVAS_H) / rect.height;

    const hit =
      hitBoxesRef.current.find(
        (b) =>
          b.kind !== "switch-track" &&
          clickX >= b.x &&
          clickX <= b.x + b.w &&
          clickY >= b.y &&
          clickY <= b.y + b.h
      ) ||
      hitBoxesRef.current.find(
        (b) =>
          b.kind === "switch-track" &&
          clickX >= b.x &&
          clickX <= b.x + b.w &&
          clickY >= b.y &&
          clickY <= b.y + b.h
      );

    if (!hit) return;
    if (hit.kind === "loco") {
      triggerKlaksons();
    } else if (hit.kind === "add") {
      onOpenAddForm(hit.trackKey || currentTrack?.key);
      if (soundEnabled) playSelectBlip();
    } else if (hit.kind === "task") {
      onSelectTask(hit.id);
      if (isAddingOpen) onCloseAddForm();
      if (soundEnabled) playSelectBlip();
    } else if (hit.kind === "switch-track") {
      const target = peronTracks.find((tr) => tr.key === hit.trackKey);
      handleSwitchTrack(target);
    }
  };

  const selectedIndex = selectedTask
    ? currentActiveTasks.findIndex((t) => t.id === selectedTask.id)
    : -1;
  const selectedStatus = selectedTask
    ? getTaskUrgenStatus(selectedTask, now)
    : "aman";
  const selectedPeron = selectedTask ? getPeronStyle(selectedTask.jalur) : null;
  const prevTrack =
    activeTrackIndex > 0 ? peronTracks[activeTrackIndex - 1] : null;
  const nextTrack =
    activeTrackIndex < peronTracks.length - 1
      ? peronTracks[activeTrackIndex + 1]
      : null;

  return (
    <section className="pixel-panel rounded-2xl p-3 sm:p-3.5 flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 bg-emerald-400" />
          <span className="font-display text-xs sm:text-sm text-white tracking-wide">
            MODEL LIVE 3D KRL POCIN - NGAWI
          </span>
          {currentTrack ? (
            <span
              className="px-2 py-0.5 rounded font-mono text-[11px] font-bold text-[#0B1020]"
              style={{ backgroundColor: currentTrack.style.color }}
            >
              REL {activeTrackIndex + 1}/{peronTracks.length}: {currentTrack.style.label}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          {currentActiveTasks.length > 2 ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={safePanIndex >= maxPan}
                onClick={() => setPanIndex((p) => Math.min(maxPan, p + 1))}
                className="pixel-btn px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border-slate-500 text-amber-300 disabled:opacity-40 cursor-pointer"
              >
                &lt; Geser Rel
              </button>
              <button
                type="button"
                disabled={safePanIndex <= 0}
                onClick={() => setPanIndex((p) => Math.max(0, p - 1))}
                className="pixel-btn px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border-slate-500 text-amber-300 disabled:opacity-40 cursor-pointer"
              >
                Geser Rel &gt;
              </button>
            </div>
          ) : null}

          <span className="pixel-well px-2.5 py-1 rounded text-amber-300">
            CUACA: {LABEL_CUACA[weatherMode]}
          </span>
          <span className="pixel-well px-2.5 py-1 rounded text-emerald-300">
            SAMPAI: {totalCompletedCount}
          </span>
        </div>
      </div>

      <div className="pixel-well rounded-xl overflow-hidden relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          onClick={handleCanvasClick}
          className="pixel-canvas w-full h-auto block cursor-pointer"
          aria-label="Model KRL 3D 8-bit multi-rel interaktif. Gunakan tombol Peron Atas dan Peron Bawah di tengah layar untuk berpindah rel peron, klik gerbong tugas untuk inspeksi, klik slot + Gerbong Tugas di rel untuk menambah tugas, atau klik lokomotif untuk membunyikan klakson."
        />

        {prevTrack ? (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <button
              type="button"
              onClick={() => handleStepTrack(-1)}
              style={{ borderColor: prevTrack.style.color }}
              className="pointer-events-auto pixel-btn peron-bob-up px-3 py-1 rounded-lg bg-[#0B1020]/90 hover:bg-slate-800 text-[11px] font-mono font-bold text-white inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span style={{ color: prevTrack.style.color }}>
                <PixelArrowUpIcon />
              </span>
              <span>PERON ATAS</span>
              <span
                className="px-1.5 py-0.5 rounded text-[10px] text-[#0B1020] font-bold"
                style={{ backgroundColor: prevTrack.style.color }}
              >
                {prevTrack.style.nama}
              </span>
            </button>
          </div>
        ) : null}

        {nextTrack ? (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <button
              type="button"
              onClick={() => handleStepTrack(1)}
              style={{ borderColor: nextTrack.style.color }}
              className="pointer-events-auto pixel-btn peron-bob-down px-3 py-1 rounded-lg bg-[#0B1020]/90 hover:bg-slate-800 text-[11px] font-mono font-bold text-white inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span style={{ color: nextTrack.style.color }}>
                <PixelArrowDownIcon />
              </span>
              <span>PERON BAWAH</span>
              <span
                className="px-1.5 py-0.5 rounded text-[10px] text-[#0B1020] font-bold"
                style={{ backgroundColor: nextTrack.style.color }}
              >
                {nextTrack.style.nama}
              </span>
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
        <span className="text-slate-300 mr-0.5">Rel Peron:</span>
        {peronTracks.map((tr, idx) => {
          const dipilih = currentTrack && currentTrack.key === tr.key;
          return (
            <button
              key={tr.key}
              type="button"
              onClick={() => handleSwitchTrack(tr)}
              style={
                dipilih
                  ? {
                      backgroundColor: tr.style.color,
                      borderColor: tr.style.color,
                      color: "#0B1020",
                    }
                  : {
                      backgroundColor: `${tr.style.color}20`,
                      borderColor: tr.style.color,
                      color: tr.style.color,
                    }
              }
              className="pixel-btn inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-bold cursor-pointer"
            >
              <span
                className="inline-block w-2 h-2 shrink-0 border border-[#0B1020]"
                style={{ backgroundColor: dipilih ? "#0B1020" : tr.style.color }}
              />
              <span>
                R{idx + 1} {tr.style.nama} ×{tr.activeTasks.length}
              </span>
            </button>
          );
        })}
      </div>

      {showHints ? (
        <div className="pixel-well rounded-xl px-3 py-2 border-[#38BDF8] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-3 flex-1 text-slate-200">
            <p>
              <span className="text-[#38BDF8] font-bold">1.</span> Pindah jalur rel pakai{" "}
              <span className="text-sky-300 font-bold">▲ / ▼</span> atau tap badge Rel Peron, lalu klik{" "}
              <span className="text-[#38BDF8] font-bold">[+ GERBONG TUGAS]</span>.
            </p>
            <p>
              <span className="text-[#F5B700] font-bold">2.</span> Pencet{" "}
              <span className="text-emerald-300 font-bold">BERANGKATKAN!</span> buat berhenti &amp; turunin Anomali; KRL peron lain lanjut melaju!
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleHints}
            className="pixel-btn self-start sm:self-center shrink-0 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border-slate-500 text-[#38BDF8] font-bold cursor-pointer"
          >
            Tutup Petunjuk
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleSetThrottle("stasiun")}
            className={
              throttleMode === "stasiun"
                ? "pixel-btn px-2.5 py-1.5 rounded bg-rose-600 border-rose-400 text-white font-mono text-xs font-bold cursor-pointer"
                : "pixel-btn px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200 font-mono text-xs cursor-pointer"
            }
          >
            BERHENTI POCIN
          </button>
          <button
            type="button"
            onClick={() => handleSetThrottle("jalan")}
            className={
              throttleMode === "jalan"
                ? "pixel-btn px-2.5 py-1.5 rounded bg-[#F5B700] border-amber-200 text-[#0B1020] font-mono text-xs font-bold cursor-pointer"
                : "pixel-btn px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200 font-mono text-xs cursor-pointer"
            }
          >
            JALAN SANTAI
          </button>
          <button
            type="button"
            onClick={() => handleSetThrottle("ngebut")}
            className={
              throttleMode === "ngebut"
                ? "pixel-btn px-2.5 py-1.5 rounded bg-emerald-500 border-emerald-200 text-[#0B1020] font-mono text-xs font-bold cursor-pointer"
                : "pixel-btn px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200 font-mono text-xs cursor-pointer"
            }
          >
            NGEBUT NGAWI
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleTogglePintu}
            className={
              doorsOpen && throttleMode === "stasiun"
                ? "pixel-btn px-2.5 py-1.5 rounded bg-sky-500 border-sky-200 text-[#0B1020] font-mono text-xs font-bold cursor-pointer"
                : "pixel-btn px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200 font-mono text-xs cursor-pointer"
            }
          >
            {doorsOpen && throttleMode === "stasiun"
              ? "PINTU: TERBUKA"
              : "BUKA PINTU"}
          </button>
          <button
            type="button"
            onClick={triggerKlaksons}
            className="pixel-btn px-2.5 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/35 border-amber-400 text-amber-300 font-mono text-xs font-bold cursor-pointer"
          >
            KLAKSON
          </button>
          <button
            type="button"
            onClick={handleCycleCuaca}
            className="pixel-btn px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200 font-mono text-xs cursor-pointer"
          >
            GANTI CUACA
          </button>
          <button
            type="button"
            onClick={onToggleSound}
            className={
              soundEnabled
                ? "pixel-btn px-2.5 py-1.5 rounded bg-emerald-500/20 border-emerald-400 text-emerald-300 font-mono text-xs font-bold cursor-pointer"
                : "pixel-btn px-2.5 py-1.5 rounded bg-slate-800 border-slate-600 text-slate-400 font-mono text-xs cursor-pointer"
            }
          >
            SFX: {soundEnabled ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {bubbleText ? (
        <p className="text-xs font-mono text-amber-300 pixel-well rounded px-3 py-1.5">
          MAS RUSDI: &quot;{bubbleText}&quot;
        </p>
      ) : null}

      {isAddingOpen ? (
        <form
          onSubmit={onSubmitNewTask}
          className="pixel-well rounded-xl p-3.5 sm:p-4 border-[#F5B700] flex flex-col gap-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-display text-xs sm:text-sm text-[#F5B700]">
              LOKET KERETA: PASANG GERBONG TUGAS BARU
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => onQuickMinutes(1)}
                className="pixel-btn px-2.5 py-1 rounded bg-amber-400/20 hover:bg-amber-400/35 border-amber-400 text-[11px] font-mono text-amber-300 cursor-pointer"
              >
                +1 Menit (Tes Toa)
              </button>
              <button
                type="button"
                onClick={() => onQuickTimeToday(17, 0)}
                className="pixel-btn px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border-slate-500 text-[11px] font-mono text-slate-200 cursor-pointer"
              >
                17:00
              </button>
              <button
                type="button"
                onClick={() => onQuickTimeToday(23, 59)}
                className="pixel-btn px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border-slate-500 text-[11px] font-mono text-slate-200 cursor-pointer"
              >
                23:59
              </button>
            </div>
          </div>

          {formError ? (
            <p className="text-xs font-mono text-rose-300 bg-rose-950/70 border border-rose-500/50 rounded px-2.5 py-1.5">
              {formError}
            </p>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end">
            <div className="md:col-span-6 flex flex-col gap-1">
              <label
                htmlFor="krl-judul-tugas"
                className="text-[11px] font-mono text-slate-300"
              >
                Tujuan Tugas
              </label>
              <input
                id="krl-judul-tugas"
                type="text"
                autoFocus
                value={formTitle}
                onChange={(e) => onChangeFormTitle(e.target.value)}
                placeholder="Contoh: Submit Modul 4 EXERCISE"
                className="pixel-well w-full px-3 py-2 rounded-lg text-white placeholder:text-slate-400 text-sm"
              />
            </div>

            <div className="md:col-span-3 flex flex-col gap-1">
              <span className="text-[11px] font-mono text-slate-300">
                Tanggal (Tap Kalender)
              </span>
              <PixelDatePicker
                value={formTanggal}
                onChange={onChangeFormTanggal}
                soundEnabled={soundEnabled}
              />
            </div>

            <div className="md:col-span-3 flex flex-col gap-1">
              <span className="text-[11px] font-mono text-slate-300">
                Jam (Tap Jam 8-Bit)
              </span>
              <PixelClockPicker
                value={formJam}
                onChange={onChangeFormJam}
                soundEnabled={soundEnabled}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-slate-300">
                Jalur Peron
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {DAFTAR_PERON.map((item) => {
                  const selected = !isCustomJalur && formJalur === item.id;
                  const warna = getPeronStyle(item.id).color;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onChangeIsCustomJalur(false);
                        onChangeFormJalur(item.id);
                      }}
                      style={
                        selected
                          ? {
                              backgroundColor: warna,
                              borderColor: warna,
                              color: "#0B1020",
                            }
                          : { borderColor: warna }
                      }
                      className={
                        selected
                          ? "pixel-btn inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer"
                          : "pixel-btn inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono cursor-pointer"
                      }
                    >
                      <span
                        className="inline-block w-2.5 h-2.5 shrink-0 border border-[#0B1020]"
                        style={{ backgroundColor: warna }}
                      />
                      {item.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => onChangeIsCustomJalur(true)}
                  className={
                    isCustomJalur
                      ? "pixel-btn px-2.5 py-1 rounded bg-[#38BDF8] border-sky-200 text-[#0B1020] text-xs font-mono font-bold cursor-pointer"
                      : "pixel-btn px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border-slate-500 text-sky-300 text-xs font-mono cursor-pointer"
                  }
                >
                  + Peron Sendiri
                </button>
              </div>
              {isCustomJalur ? (
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="inline-block w-4 h-4 shrink-0 border-2 border-[#0B1020]"
                    style={{
                      backgroundColor: getPeronStyle(customJalur || "PERON BARU").color,
                    }}
                    title="Warna peron buatanmu"
                  />
                  <input
                    id="krl-custom-peron"
                    type="text"
                    value={customJalur}
                    onChange={(e) => onChangeCustomJalur(e.target.value)}
                    placeholder="Ketik nama peron sendiri (misal: PERON 7 • SKRIPSI)"
                    className="pixel-well w-full px-3 py-1.5 rounded-lg text-white placeholder:text-slate-400 text-xs font-mono"
                  />
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-slate-300">
                Model Anomali Penumpang
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {DAFTAR_ANOMALI.map((anom) => {
                  const selected = anomaliType === anom.id;
                  return (
                    <button
                      key={anom.id}
                      type="button"
                      onClick={() => onChangeAnomaliType(anom.id)}
                      className={
                        selected
                          ? "pixel-btn inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/25 border-emerald-400 text-emerald-200 text-xs font-mono font-bold cursor-pointer"
                          : "pixel-btn inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200 text-xs font-mono cursor-pointer"
                      }
                    >
                      <span
                        className="inline-block w-2.5 h-2.5 shrink-0"
                        style={{ backgroundColor: anom.color }}
                      />
                      <span>{anom.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCloseAddForm}
              className="pixel-btn px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border-slate-500 text-slate-200 font-mono text-xs cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="pixel-btn px-4 py-1.5 rounded bg-[#F5B700] hover:bg-[#FFC71F] border-amber-200 disabled:opacity-60 text-[#0B1020] font-mono text-xs font-bold cursor-pointer disabled:cursor-not-allowed"
            >
              {submitting ? "Nyambung..." : "Pasang ke KRL"}
            </button>
          </div>
        </form>
      ) : (
        <div className="pixel-well rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {selectedTask ? (
            <div className="flex flex-wrap items-center gap-2.5 min-w-0 flex-1">
              <span
                className={
                  selectedStatus === "telat"
                    ? "px-2.5 py-1 rounded bg-rose-600 text-white font-mono text-xs font-bold shrink-0"
                    : selectedStatus === "boarding"
                      ? "px-2.5 py-1 rounded bg-[#F5B700] text-[#0B1020] font-mono text-xs font-bold shrink-0"
                      : "px-2.5 py-1 rounded bg-sky-500 text-[#0B1020] font-mono text-xs font-bold shrink-0"
                }
              >
                GERBONG G{selectedIndex + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-bold text-white truncate">
                  {selectedTask.title}
                </p>
                <p className="text-xs font-mono text-slate-300 flex flex-wrap items-center gap-1.5 mt-0.5">
                  <span
                    className="px-2 py-0.5 rounded font-bold text-[#0B1020]"
                    style={{ backgroundColor: selectedPeron.color }}
                  >
                    {selectedPeron.label}
                  </span>
                  <span>
                    Jam {formatJamSingkat(selectedTask.dueAt)} WIB • Anomali: {getAnomaliInfo(selectedTask).nama}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs sm:text-sm font-mono text-emerald-300 flex-1">
              PERON INI STERIL! Belum ada gerbong aktif di {currentTrack?.style.label}. Klik + buat pasang gerbong baru!
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {selectedTask ? (
              <>
                <button
                  type="button"
                  disabled={busyId === selectedTask.id}
                  onClick={() => onToggleComplete(selectedTask)}
                  className="pixel-btn px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 border-emerald-200 text-[#0B1020] font-mono text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  BERANGKATKAN!
                </button>
                <button
                  type="button"
                  disabled={busyId === selectedTask.id}
                  onClick={() => onDelayTask(selectedTask)}
                  className="pixel-btn px-2.5 py-1.5 rounded bg-amber-400/20 hover:bg-amber-400/35 border-amber-400 text-amber-300 font-mono text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  +30m
                </button>
                <button
                  type="button"
                  disabled={busyId === selectedTask.id}
                  onClick={() => onDeleteTask(selectedTask.id)}
                  className="pixel-btn px-2.5 py-1.5 rounded bg-rose-500/20 hover:bg-rose-500/35 border-rose-400 text-rose-300 font-mono text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  LEPAS
                </button>
              </>
            ) : null}

            <button
              type="button"
              onClick={() => onOpenAddForm(currentTrack?.key)}
              className="pixel-btn px-3.5 py-1.5 rounded bg-[#F5B700] hover:bg-[#FFC71F] border-amber-200 text-[#0B1020] font-mono text-xs font-bold cursor-pointer"
            >
              + Tambah Gerbong Tugas
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
