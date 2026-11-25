"use client";

import { useEffect, useState } from "react";
import KrlGameStage from "@/components/KrlGameStage";
import {
  getIdToken,
  isFirebaseAuthConfigured,
  loginWithGoogle,
  logoutGoogle,
  subscribeAuth,
} from "@/lib/firebaseAuth";
import { getPeronStyle } from "@/lib/peronStyle";
import {
  playSelectBlip,
  playTambahGerbong,
} from "@/lib/sound8bit";
import {
  DAFTAR_PERON,
  PENGUMUMAN_PERON,
  getPangkatMasinis,
} from "./memeData";

function PixelTrainIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 16 16"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="3" y="2" width="10" height="10" />
      <rect x="4" y="4" width="3" height="3" fill="#0B1020" />
      <rect x="9" y="4" width="3" height="3" fill="#0B1020" />
      <rect x="3" y="8" width="10" height="2" fill="#F5B700" />
      <rect x="4" y="10" width="2" height="1" fill="#FEF08A" />
      <rect x="10" y="10" width="2" height="1" fill="#FEF08A" />
      <rect x="4" y="12" width="2" height="2" />
      <rect x="10" y="12" width="2" height="2" />
    </svg>
  );
}

function PixelBellIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="7" y="1" width="2" height="2" />
      <rect x="5" y="3" width="6" height="2" />
      <rect x="4" y="5" width="8" height="5" />
      <rect x="2" y="10" width="12" height="2" />
      <rect x="6" y="13" width="4" height="2" />
    </svg>
  );
}

function PixelRefreshIcon() {
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
      <rect x="10" y="4" width="3" height="2" />
      <rect x="2" y="4" width="2" height="6" />
      <rect x="12" y="6" width="2" height="6" />
      <rect x="3" y="10" width="3" height="2" />
      <rect x="4" y="12" width="8" height="2" />
    </svg>
  );
}

function PixelCheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="2" y="8" width="2" height="2" />
      <rect x="4" y="10" width="2" height="2" />
      <rect x="6" y="10" width="2" height="2" />
      <rect x="8" y="8" width="2" height="2" />
      <rect x="10" y="6" width="2" height="2" />
      <rect x="12" y="4" width="2" height="2" />
    </svg>
  );
}

function PixelTrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="5" y="2" width="6" height="2" />
      <rect x="2" y="4" width="12" height="2" />
      <rect x="4" y="6" width="8" height="8" />
      <rect x="6" y="8" width="1" height="4" fill="#0B1020" />
      <rect x="9" y="8" width="1" height="4" fill="#0B1020" />
    </svg>
  );
}

function PixelSearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="4" y="2" width="6" height="2" />
      <rect x="4" y="10" width="6" height="2" />
      <rect x="2" y="4" width="2" height="6" />
      <rect x="10" y="4" width="2" height="6" />
      <rect x="10" y="10" width="2" height="2" />
      <rect x="12" y="12" width="2" height="2" />
    </svg>
  );
}

function PixelGoogleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#0B1020"
        d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"
      />
    </svg>
  );
}

async function authFetch(url, options = {}) {
  const token = await getIdToken();
  const headers = { ...(options.headers || {}) };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}

function normalizeTrackKey(jalur) {
  const teks = (jalur || DAFTAR_PERON[0].id).trim() || DAFTAR_PERON[0].id;
  return teks.toUpperCase();
}

function formatDateInput(date) {
  const tahun = date.getFullYear();
  const bulan = String(date.getMonth() + 1).padStart(2, "0");
  const hari = String(date.getDate()).padStart(2, "0");
  return `${tahun}-${bulan}-${hari}`;
}

function formatTimeInput(date) {
  const jam = String(date.getHours()).padStart(2, "0");
  const menit = String(date.getMinutes()).padStart(2, "0");
  return `${jam}:${menit}`;
}

function formatJamWIB(isoString) {
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

function formatTanggalPendek(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "short",
  });
}

function formatClockLive(date) {
  if (!date) return "--:--:-- WIB";
  const jam = String(date.getHours()).padStart(2, "0");
  const menit = String(date.getMinutes()).padStart(2, "0");
  const detik = String(date.getSeconds()).padStart(2, "0");
  return `${jam}:${menit}:${detik} WIB`;
}

function formatSisaWaktu(diffMs) {
  const absMenit = Math.floor(Math.abs(diffMs) / 60000);
  if (absMenit < 1) return diffMs <= 0 ? "Baru aja lewat" : "< 1 menit lagi";
  if (absMenit < 60) {
    return diffMs <= 0 ? `Telat ${absMenit} mnt` : `Sisa ${absMenit} mnt`;
  }
  const jam = Math.floor(absMenit / 60);
  const sisaMnt = absMenit % 60;
  if (jam < 24) {
    return diffMs <= 0
      ? `Telat ${jam}j ${sisaMnt}m`
      : `Sisa ${jam}j ${sisaMnt}m`;
  }
  const hari = Math.floor(jam / 24);
  return diffMs <= 0 ? `Telat ${hari} hari` : `Sisa ${hari} hari`;
}

function getStatusKeberangkatan(task, now) {
  if (task.completed) {
    return {
      key: "berangkat",
      label: "SAMPAI",
      detail: "Sudah tuntas",
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-400/50",
      timeClass: "text-emerald-300",
    };
  }

  if (!now) {
    return {
      key: "aman",
      label: "MENUNGGU",
      detail: "Sinkronisasi jam...",
      badgeClass: "bg-sky-500/20 text-sky-300 border-sky-400/50",
      timeClass: "text-slate-100",
    };
  }

  const diffMs = new Date(task.dueAt).getTime() - now.getTime();
  if (diffMs <= 0) {
    return {
      key: "telat",
      label: "TELAT COK",
      detail: formatSisaWaktu(diffMs),
      badgeClass: "bg-rose-500/25 text-rose-300 border-rose-400/60",
      timeClass: "text-rose-300",
    };
  }

  if (diffMs <= 2 * 60 * 60 * 1000) {
    return {
      key: "boarding",
      label: "BOARDING!",
      detail: formatSisaWaktu(diffMs),
      badgeClass: "bg-amber-400/20 text-amber-300 border-amber-400/60",
      timeClass: "text-amber-300",
    };
  }

  return {
    key: "aman",
    label: "AMAN REK",
    detail: formatSisaWaktu(diffMs),
    badgeClass: "bg-sky-500/20 text-sky-300 border-sky-400/50",
    timeClass: "text-slate-100",
  };
}

export default function Home() {
  const [title, setTitle] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [jam, setJam] = useState("");
  const [jalur, setJalur] = useState(DAFTAR_PERON[0].id);
  const [isCustomJalur, setIsCustomJalur] = useState(false);
  const [customJalur, setCustomJalur] = useState("");
  const [anomaliType, setAnomaliType] = useState("robot");

  const [tasks, setTasks] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [formError, setFormError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const [notifPermission, setNotifPermission] = useState("default");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [now, setNow] = useState(null);
  const [indexPengumuman, setIndexPengumuman] = useState(0);

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [activeTrackKey, setActiveTrackKey] = useState(DAFTAR_PERON[0].id);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [trainEvent, setTrainEvent] = useState({ type: null, label: "", seq: 0 });
  const [isAddingOpen, setIsAddingOpen] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [showAllList, setShowAllList] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeAuth((firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function loadTasks() {
      try {
        const res = await authFetch("/api/tasks");
        if (!res.ok) {
          throw new Error("Gagal ngambil data jadwal dari stasiun.");
        }
        const data = await res.json();
        if (!cancelled) {
          setTasks(data);
          setErrorMsg("");
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setErrorMsg(
            "Waduh rek, jadwal dari server gagal dimuat. Coba refresh halaman."
          );
        }
      }
    }

    loadTasks();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    const initTimer = setTimeout(() => {
      setNow(new Date());
      if (typeof window !== "undefined" && "Notification" in window) {
        setNotifPermission(Notification.permission);
      } else {
        setNotifPermission("unsupported");
      }
    }, 0);

    const clockId = setInterval(() => {
      setNow(new Date());
    }, 1000);

    const tickerId = setInterval(() => {
      setIndexPengumuman((prev) => (prev + 1) % PENGUMUMAN_PERON.length);
    }, 10000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(clockId);
      clearInterval(tickerId);
    };
  }, []);

  useEffect(() => {
    if (notifPermission !== "granted" || !user) return;

    async function checkDueTasks() {
      try {
        const res = await authFetch("/api/tasks/due");
        if (!res.ok) return;
        const dueTasks = await res.json();

        for (const task of dueTasks) {
          const notif = new Notification(
            "TOA STASIUN POCIN: PANGGILAN TERAKHIR!",
            {
              body: `${task.title} (${task.jalur}), buruan kerjain sebelum kereta Ngawi berangkat!`,
              tag: task.id,
              requireInteraction: true,
            }
          );

          notif.onclick = () => {
            window.focus();
            notif.close();
          };

          await authFetch(`/api/tasks/${task.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notified: true }),
          });

          setTasks((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, notified: true } : t))
          );
        }
      } catch (err) {
        console.error("Gagal ngecek pengingat jadwal:", err);
      }
    }

    checkDueTasks();
    const pollingId = setInterval(checkDueTasks, 15000);
    return () => clearInterval(pollingId);
  }, [notifPermission, user]);

  const handleLoginGoogle = async () => {
    setAuthError("");
    if (!isFirebaseAuthConfigured()) {
      setAuthError("Konfigurasi Firebase di .env.local belum lengkap rek.");
      return;
    }

    setAuthBusy(true);
    try {
      await loginWithGoogle();
      if (soundEnabled) playSelectBlip();
    } catch (err) {
      if (err?.code !== "auth/popup-closed-by-user") {
        console.error("Login Google gagal:", err);
      }
      if (
        err?.code === "auth/operation-not-allowed" ||
        err?.code === "auth/configuration-not-found"
      ) {
        setAuthError(
          "Provider Google belum dinyalakan di Firebase Console! Buka Authentication > Sign-in method > aktifkan Google."
        );
      } else if (err?.code === "auth/popup-closed-by-user") {
        setAuthError("Popup login Google ditutup sebelum selesai.");
      } else if (err?.code === "auth/unauthorized-domain") {
        setAuthError(
          "Domain ini belum masuk Authorized domains di Firebase Authentication Settings."
        );
      } else {
        setAuthError(err?.message || "Gagal masuk pakai akun Google.");
      }
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogoutGoogle = async () => {
    setAuthBusy(true);
    setErrorMsg("");
    setInfoMsg("");
    try {
      await logoutGoogle();
      setTasks([]);
      setSelectedTaskId(null);
      setActiveTrackKey(DAFTAR_PERON[0].id);
      setIsAddingOpen(false);
    } catch (err) {
      console.error("Logout gagal:", err);
      setErrorMsg("Gagal keluar dari akun Google.");
    } finally {
      setAuthBusy(false);
    }
  };

  const handleMintaIzinToa = async () => {
    setErrorMsg("");
    setInfoMsg("");

    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotifPermission("unsupported");
      setErrorMsg("Browser ini belum dukung Web Notifications API rek.");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotifPermission(permission);

    if (permission === "granted") {
      setInfoMsg(
        "Toa Stasiun Pondok Cina aktif! Jangan tutup tab ini biar pengingat tetep bunyi."
      );
    } else if (permission === "denied") {
      setErrorMsg(
        "Izin notifikasi diblokir browser. Buka ikon gembok di address bar lalu ubah Notifications ke Allow."
      );
    }
  };

  const handleTesToa = async () => {
    setErrorMsg("");
    setInfoMsg("");

    if (typeof window === "undefined" || !("Notification" in window)) {
      setErrorMsg("Browser ini gak support Web Notifications API.");
      return;
    }

    let currentPerm = Notification.permission;
    if (currentPerm === "default") {
      currentPerm = await Notification.requestPermission();
      setNotifPermission(currentPerm);
    }

    if (currentPerm !== "granted") {
      setErrorMsg(
        "Nyalain dulu izin Toa Stasiun di browser (klik Allow) baru bisa tes notifikasi Windows!"
      );
      return;
    }

    const testNotif = new Notification("TES TOA STASIUN PONDOK CINA", {
      body: "Aman rek! Mas Rusdi & Mas Fuad siap neriakin tugas lu pas jam tenggat tiba.",
      tag: "tes-toa-pocin",
    });

    testNotif.onclick = () => {
      window.focus();
      testNotif.close();
    };

    setInfoMsg(
      "Notifikasi tes udah dikirim ke Windows! Kalau gak muncul, cek Settings > System > Notifications (Focus Assist / Do Not Disturb)."
    );
  };

  const handleIsiCepatMenit = (offsetMenit) => {
    const target = new Date(Date.now() + offsetMenit * 60 * 1000);
    setTanggal(formatDateInput(target));
    setJam(formatTimeInput(target));
    setFormError("");
  };

  const handleIsiJamHariIni = (jamTarget, menitTarget) => {
    const target = new Date();
    target.setHours(jamTarget, menitTarget, 0, 0);
    setTanggal(formatDateInput(target));
    setJam(formatTimeInput(target));
    setFormError("");
  };

  const handleTambahJadwal = async (e) => {
    e.preventDefault();
    setFormError("");
    setErrorMsg("");
    setInfoMsg("");

    const jalurFinal = isCustomJalur ? customJalur.trim() : jalur;

    if (title.trim() === "" || tanggal === "" || jam === "") {
      setFormError(
        "Isi dulu tujuan tugas, tanggal, dan jam keberangkatannya rek!"
      );
      return;
    }

    if (isCustomJalur && jalurFinal === "") {
      setFormError("Ketik dulu nama peron buatanmu rek!");
      return;
    }

    const dueAt = new Date(`${tanggal}T${jam}`).toISOString();

    setSubmitting(true);
    try {
      const res = await authFetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          dueAt,
          jalur: jalurFinal,
          anomaliType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal nyimpen jadwal baru.");
      }

      const listBaru = [...tasks, data].sort(
        (a, b) => new Date(a.dueAt) - new Date(b.dueAt)
      );
      const trackKey = normalizeTrackKey(data.jalur);
      setTasks(listBaru);
      setActiveTrackKey(trackKey);
      setSelectedTaskId(data.id);
      setIsAddingOpen(false);
      setTrainEvent((prev) => ({
        type: "couple",
        label: data.title,
        trackKey,
        seq: prev.seq + 1,
      }));
      if (soundEnabled) playTambahGerbong();

      setTitle("");
      setTanggal("");
      setJam("");
      setIsCustomJalur(false);
      setCustomJalur("");
      setInfoMsg(
        `Gerbong "${data.title}" udah dipasang ke rangkaian KRL!`
      );
    } catch (err) {
      setFormError(err.message || "Gagal nyambung ke loket server stasiun.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSelesai = async (task) => {
    setBusyId(task.id);
    setErrorMsg("");
    try {
      const akanBerangkat = !task.completed;
      const trackKey = normalizeTrackKey(task.jalur);
      const carIndex = [...tasks]
        .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))
        .filter((t) => !t.completed && normalizeTrackKey(t.jalur) === trackKey)
        .findIndex((t) => t.id === task.id);

      const res = await authFetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: akanBerangkat }),
      });

      const updated = await res.json();
      if (!res.ok) {
        throw new Error(updated.error || "Gagal update status kereta.");
      }

      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));

      if (akanBerangkat) {
        setActiveTrackKey(trackKey);
        setTrainEvent((prev) => ({
          type: "dropoff",
          task: updated,
          trackKey,
          carIndex: Math.max(0, carIndex),
          seq: prev.seq + 1,
        }));
        setInfoMsg(
          `Anjay kelar! Kereta ${getPeronStyle(task.jalur).label} berhenti di Stasiun Pondok Cina buat nurunin Anomali "${task.title}"!`
        );
      }
    } catch (err) {
      setErrorMsg(err.message || "Gagal update status tugas.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelay30Menit = async (task) => {
    setBusyId(task.id);
    setErrorMsg("");
    try {
      const baseTime = Math.max(new Date(task.dueAt).getTime(), Date.now());
      const dueAtBaru = new Date(baseTime + 30 * 60 * 1000).toISOString();

      const res = await authFetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueAt: dueAtBaru, notified: false }),
      });

      const updated = await res.json();
      if (!res.ok) {
        throw new Error(updated.error || "Gagal ngundur jadwal +30 menit.");
      }

      const listBaru = tasks
        .map((t) => (t.id === task.id ? updated : t))
        .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));

      setTasks(listBaru);
      setInfoMsg(
        `Gerbong "${task.title}" di-delay +30 menit. Jangan ditunda mulu ya rek!`
      );
    } catch (err) {
      setErrorMsg(err.message || "Gagal nge-delay jadwal.");
    } finally {
      setBusyId(null);
    }
  };

  const handleHapus = async (id) => {
    setBusyId(id);
    setErrorMsg("");
    try {
      const res = await authFetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Gagal ngelepas gerbong dari rangkaian.");
      }
      setTasks((prev) => prev.filter((t) => t.id !== id));
      if (selectedTaskId === id) {
        setSelectedTaskId(null);
      }
    } catch (err) {
      setErrorMsg(err.message || "Gagal hapus jadwal.");
    } finally {
      setBusyId(null);
    }
  };

  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(a.dueAt) - new Date(b.dueAt)
  );

  const activeTasks = sortedTasks.filter((t) => !t.completed);
  const countMenunggu = activeTasks.length;
  const countMepetTelat = activeTasks.filter((t) => {
    if (!now) return false;
    return new Date(t.dueAt).getTime() - now.getTime() <= 2 * 60 * 60 * 1000;
  }).length;
  const countBerangkat = sortedTasks.filter((t) => t.completed).length;

  const pangkat = getPangkatMasinis(countBerangkat);

  const filteredTasks = sortedTasks.filter((task) => {
    const cocokCari =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.jalur || "").toLowerCase().includes(searchQuery.toLowerCase());
    if (!cocokCari) return false;

    const status = getStatusKeberangkatan(task, now);
    if (filterStatus === "belum") return !task.completed;
    if (filterStatus === "kritis") {
      return status.key === "telat" || status.key === "boarding";
    }
    if (filterStatus === "berangkat") return task.completed;
    return true;
  });

  if (authLoading) {
    return (
      <main className="min-h-screen text-slate-50 px-4 py-8 flex items-center justify-center">
        <div className="pixel-panel rounded-2xl p-6 max-w-md w-full text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#DC2626] border-2 border-[#F5B700] text-white flex items-center justify-center">
            <PixelTrainIcon />
          </div>
          <h1 className="font-display text-base sm:text-lg text-white">
            KRL STASIUN POCIN
          </h1>
          <p className="text-xs font-mono text-[#F5B700]">
            MEMERIKSA TIKET MASUK STASIUN POCIN...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen text-slate-50 px-4 py-8 flex items-center justify-center">
        <div className="pixel-panel rounded-2xl p-5 sm:p-7 max-w-md w-full flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#DC2626] border-2 border-[#F5B700] text-white flex items-center justify-center shrink-0">
              <PixelTrainIcon />
            </div>
            <div>
              <h1 className="font-display text-lg sm:text-xl font-bold text-white leading-tight">
                KRL STASIUN POCIN
              </h1>
              <p className="text-xs font-mono text-[#F5B700] mt-0.5">
                GERBANG TAP MASUK PERON
              </p>
            </div>
          </div>

          <div className="pixel-well rounded-xl p-3.5 text-xs sm:text-sm text-slate-200 leading-relaxed flex flex-col gap-2">
            <p>
              Tap masuk pakai akun Google kamu biar gerbong tugas, jalur peron,
              model anomali, dan skor masinis tersimpan pribadi di akun kamu.
            </p>
            <p className="font-mono text-[11px] text-slate-300">
              Jam Stasiun:{" "}
              <span className="text-[#F5B700] font-bold">
                {formatClockLive(now)}
              </span>
            </p>
          </div>

          {authError ? (
            <div className="pixel-well rounded-xl px-3.5 py-2.5 border-rose-400 bg-rose-950/75 text-rose-200 text-xs leading-relaxed">
              {authError}
            </div>
          ) : null}

          <button
            type="button"
            disabled={authBusy}
            onClick={handleLoginGoogle}
            className="pixel-btn w-full py-2.5 px-4 rounded-xl bg-[#F5B700] hover:bg-[#FFC71F] border-amber-200 text-[#0B1020] font-mono text-sm font-bold inline-flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <PixelGoogleIcon />
            <span>
              {authBusy ? "Membuka Loket Google..." : "Masuk dengan Google"}
            </span>
          </button>

          <p className="text-[11px] font-mono text-center text-slate-300">
            Todo & riwayat keberangkatan tersimpan per akun Google di Firebase.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-slate-50 px-3 py-2.5 sm:px-6 sm:py-3 lg:px-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-2.5">
        <header className="pixel-panel rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#DC2626] border-2 border-[#F5B700] text-white flex items-center justify-center shrink-0">
              <PixelTrainIcon />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-base sm:text-lg font-bold tracking-wide text-white leading-tight">
                KRL STASIUN POCIN
              </h1>
              <p className="text-xs font-mono text-slate-300 mt-0.5">
                <span className="text-[#F5B700] font-bold">{pangkat.title}</span> • SKOR:{" "}
                <span className="text-emerald-300 font-bold">{pangkat.xp} PENUMPANG</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="pixel-well rounded-lg px-2.5 py-1 flex flex-col whitespace-nowrap">
              <span className="text-[9px] font-mono text-slate-300">
                JAM PERON
              </span>
              <span className="text-sm font-mono font-bold tabular-nums text-[#F5B700]">
                {formatClockLive(now)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleMintaIzinToa}
              disabled={notifPermission === "granted"}
              className={
                notifPermission === "granted"
                  ? "pixel-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-emerald-500/20 border-emerald-400 text-emerald-300"
                  : "pixel-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#F5B700] border-amber-200 text-[#0B1020] hover:bg-[#FFC71F] cursor-pointer"
              }
            >
              <PixelBellIcon />
              <span>
                {notifPermission === "granted"
                  ? "Toa Aktif"
                  : notifPermission === "denied"
                    ? "Toa Diblokir"
                    : "Nyalakan Toa"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleTesToa}
              className="pixel-btn px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 border-slate-500 text-white cursor-pointer"
            >
              Tes Toa
            </button>

            <button
              type="button"
              onClick={() => setShowHints((prev) => !prev)}
              className={
                showHints
                  ? "pixel-btn px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-sky-500/20 border-sky-400 text-sky-300 cursor-pointer"
                  : "pixel-btn px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 border-slate-500 text-slate-200 cursor-pointer"
              }
            >
              ? Petunjuk
            </button>

            <div className="pixel-well rounded-lg px-2.5 py-1 flex items-center gap-2">
              <span
                className="text-[11px] font-mono text-slate-200 max-w-[130px] truncate"
                title={user.email || user.displayName || "Akun Google"}
              >
                {user.displayName || user.email}
              </span>
              <button
                type="button"
                disabled={authBusy}
                onClick={handleLogoutGoogle}
                className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/60 text-[11px] font-mono font-bold text-rose-200 cursor-pointer disabled:opacity-50"
              >
                Keluar
              </button>
            </div>
          </div>
        </header>

        {errorMsg ? (
          <div className="pixel-panel rounded-xl px-4 py-2.5 border-rose-400 bg-rose-950/75 text-rose-200 flex items-center justify-between gap-3 text-xs sm:text-sm">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg("")}
              className="text-xs font-mono font-bold underline shrink-0 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        ) : null}

        {infoMsg ? (
          <div className="pixel-panel rounded-xl px-4 py-2.5 border-emerald-400 bg-emerald-950/75 text-emerald-200 flex items-center justify-between gap-3 text-xs sm:text-sm">
            <span>{infoMsg}</span>
            <button
              type="button"
              onClick={() => setInfoMsg("")}
              className="text-xs font-mono font-bold underline shrink-0 cursor-pointer"
            >
              Sip
            </button>
          </div>
        ) : null}

        <section className="pixel-panel rounded-2xl p-3 sm:p-3.5 flex flex-col gap-2.5">
          <div className="pixel-well rounded-xl px-3 py-2 border-[#F5B700]/60 bg-amber-400/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start sm:items-center gap-2.5 min-w-0">
              <span className="px-2 py-0.5 rounded bg-[#F5B700] text-[#0B1020] font-display text-[10px] font-bold tracking-wide shrink-0 inline-flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 bg-[#0B1020]" />
                TOA POCIN
              </span>
              <p className="text-xs font-mono text-amber-200 leading-relaxed">
                {PENGUMUMAN_PERON[indexPengumuman]}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setIndexPengumuman((prev) => (prev + 1) % PENGUMUMAN_PERON.length)
              }
              className="pixel-btn inline-flex items-center gap-1.5 self-start sm:self-auto shrink-0 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border-slate-500 text-xs font-mono text-white cursor-pointer"
            >
              <PixelRefreshIcon />
              <span>Ganti Info</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums">
              <button
                type="button"
                onClick={() => {
                  setFilterStatus("belum");
                  setShowAllList(true);
                  if (soundEnabled) playSelectBlip();
                }}
                className={
                  showAllList && filterStatus === "belum"
                    ? "pixel-btn inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-500/30 border-sky-300 text-sky-100 font-bold cursor-pointer"
                    : "pixel-btn inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border-sky-400/70 text-sky-200 cursor-pointer"
                }
              >
                <span className="inline-block w-2 h-2 bg-sky-400 shrink-0" />
                <span>AKTIF</span>
                <span className="px-1.5 py-0.5 rounded bg-[#0B1020]/70 text-sky-300 font-bold">
                  {countMenunggu}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFilterStatus("kritis");
                  setShowAllList(true);
                  if (soundEnabled) playSelectBlip();
                }}
                className={
                  showAllList && filterStatus === "kritis"
                    ? "pixel-btn inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-400/30 border-amber-300 text-amber-100 font-bold cursor-pointer"
                    : "pixel-btn inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border-amber-400/70 text-amber-200 cursor-pointer"
                }
              >
                <span className="inline-block w-2 h-2 bg-amber-400 shrink-0" />
                <span>MEPET / TELAT</span>
                <span className="px-1.5 py-0.5 rounded bg-[#0B1020]/70 text-amber-300 font-bold">
                  {countMepetTelat}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFilterStatus("berangkat");
                  setShowAllList(true);
                  if (soundEnabled) playSelectBlip();
                }}
                className={
                  showAllList && filterStatus === "berangkat"
                    ? "pixel-btn inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/30 border-emerald-300 text-emerald-100 font-bold cursor-pointer"
                    : "pixel-btn inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-400/70 text-emerald-200 cursor-pointer"
                }
              >
                <span className="inline-block w-2 h-2 bg-emerald-400 shrink-0" />
                <span>SAMPAI</span>
                <span className="px-1.5 py-0.5 rounded bg-[#0B1020]/70 text-emerald-300 font-bold">
                  {countBerangkat}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowAllList((prev) => !prev)}
              className={
                showAllList
                  ? "pixel-btn px-3 py-1.5 rounded-lg bg-[#F5B700] hover:bg-[#FFC71F] border-amber-200 text-[#0B1020] text-xs font-mono font-bold cursor-pointer self-start sm:self-auto"
                  : "pixel-btn px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border-slate-500 text-xs font-mono font-bold text-white cursor-pointer self-start sm:self-auto"
              }
            >
              {showAllList
                ? "Tutup Daftar"
                : `Daftar & Riwayat (${sortedTasks.length})`}
            </button>
          </div>

          {showAllList ? (
            <div className="flex flex-col gap-3 pt-2 border-t border-slate-700/80">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="pixel-well rounded-lg p-1 inline-flex flex-wrap items-center gap-1 self-start">
                  <button
                    type="button"
                    onClick={() => setFilterStatus("semua")}
                    className={
                      filterStatus === "semua"
                        ? "px-3 py-1 rounded text-xs font-mono font-bold bg-[#F5B700] text-[#0B1020] cursor-pointer"
                        : "px-3 py-1 rounded text-xs font-mono text-slate-300 hover:text-white cursor-pointer"
                    }
                  >
                    Semua ({sortedTasks.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus("belum")}
                    className={
                      filterStatus === "belum"
                        ? "px-3 py-1 rounded text-xs font-mono font-bold bg-[#F5B700] text-[#0B1020] cursor-pointer"
                        : "px-3 py-1 rounded text-xs font-mono text-slate-300 hover:text-white cursor-pointer"
                    }
                  >
                    Aktif ({countMenunggu})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus("kritis")}
                    className={
                      filterStatus === "kritis"
                        ? "px-3 py-1 rounded text-xs font-mono font-bold bg-[#F5B700] text-[#0B1020] cursor-pointer"
                        : "px-3 py-1 rounded text-xs font-mono text-slate-300 hover:text-white cursor-pointer"
                    }
                  >
                    Mepet / Telat ({countMepetTelat})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus("berangkat")}
                    className={
                      filterStatus === "berangkat"
                        ? "px-3 py-1 rounded text-xs font-mono font-bold bg-[#F5B700] text-[#0B1020] cursor-pointer"
                        : "px-3 py-1 rounded text-xs font-mono text-slate-300 hover:text-white cursor-pointer"
                    }
                  >
                    Sampai ({countBerangkat})
                  </button>
                </div>

                <div className="relative w-full lg:w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300">
                    <PixelSearchIcon />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari tujuan atau peron..."
                    aria-label="Cari tujuan atau peron"
                    className="pixel-well w-full pl-9 pr-3 py-1.5 rounded-lg text-sm text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              {filteredTasks.length === 0 ? (
                <div className="pixel-well rounded-xl p-6 text-center text-xs font-mono text-slate-300">
                  Belum ada gerbong di filter ini.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {filteredTasks.map((task) => {
                    const status = getStatusKeberangkatan(task, now);
                    const isBusy = busyId === task.id;
                    const activePos = activeTasks.findIndex((t) => t.id === task.id);
                    const isSelected = !task.completed && task.id === selectedTaskId;

                    return (
                      <article
                        key={task.id}
                        onClick={() => {
                          if (!task.completed) {
                            setActiveTrackKey(normalizeTrackKey(task.jalur));
                            setSelectedTaskId(task.id);
                            setIsAddingOpen(false);
                            if (soundEnabled) playSelectBlip();
                          }
                        }}
                        className={
                          isSelected
                            ? "flap-enter pixel-well rounded-xl px-3.5 py-2.5 border-[#F5B700] flex flex-col md:grid md:grid-cols-[100px_1fr_175px_145px_215px] md:items-center gap-2.5 cursor-pointer"
                            : "flap-enter pixel-well rounded-xl px-3.5 py-2.5 hover:border-slate-500 flex flex-col md:grid md:grid-cols-[100px_1fr_175px_145px_215px] md:items-center gap-2.5 cursor-pointer"
                        }
                      >
                        <div className="flex md:flex-col items-baseline md:items-start gap-2 md:gap-0">
                          <span
                            className={`text-base font-mono font-bold tabular-nums ${status.timeClass}`}
                          >
                            {formatJamWIB(task.dueAt)}
                          </span>
                          <span className="text-[11px] font-mono text-slate-300">
                            {formatTanggalPendek(task.dueAt)}
                          </span>
                        </div>

                        <div className="min-w-0 flex items-center gap-2">
                          {activePos !== -1 ? (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 text-[10px] font-mono font-bold text-[#F5B700] shrink-0">
                              G{activePos + 1}
                            </span>
                          ) : null}
                          <p
                            className={
                              task.completed
                                ? "text-sm font-semibold text-slate-300 line-through break-words"
                                : "text-sm font-semibold text-white break-words"
                            }
                          >
                            {task.title}
                          </p>
                        </div>

                        <div>
                          <span
                            className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold text-[#0B1020]"
                            style={{
                              backgroundColor: getPeronStyle(task.jalur).color,
                            }}
                          >
                            {getPeronStyle(task.jalur).label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block px-2 py-0.5 rounded border text-[11px] font-mono font-bold ${status.badgeClass}`}
                          >
                            {status.label}
                          </span>
                          <span className="text-[11px] font-mono text-slate-300 tabular-nums">
                            {status.detail}
                          </span>
                        </div>

                        <div
                          className="flex flex-wrap items-center md:justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleToggleSelesai(task)}
                            className={
                              task.completed
                                ? "pixel-btn inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-500 cursor-pointer disabled:opacity-50"
                                : "pixel-btn inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border-emerald-400 cursor-pointer disabled:opacity-50"
                            }
                          >
                            <PixelCheckIcon />
                            <span>{task.completed ? "Batal" : "Berangkat"}</span>
                          </button>

                          {!task.completed ? (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleDelay30Menit(task)}
                              className="pixel-btn px-2 py-1 rounded text-[11px] font-mono font-bold bg-amber-400/20 hover:bg-amber-400/35 text-amber-300 border-amber-400 cursor-pointer disabled:opacity-50"
                            >
                              +30m
                            </button>
                          ) : null}

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleHapus(task.id)}
                            aria-label={`Hapus ${task.title}`}
                            className="pixel-btn inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono font-bold bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 border-rose-400 cursor-pointer disabled:opacity-50"
                          >
                            <PixelTrashIcon />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}
        </section>

        <KrlGameStage
          tasks={sortedTasks}
          now={now}
          selectedTaskId={selectedTaskId}
          onSelectTask={(id) => setSelectedTaskId(id)}
          activeTrackKey={activeTrackKey}
          onChangeTrackKey={(nextKey) => setActiveTrackKey(nextKey)}
          onToggleComplete={handleToggleSelesai}
          onDelayTask={handleDelay30Menit}
          onDeleteTask={handleHapus}
          busyId={busyId}
          eventSignal={trainEvent}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled((prev) => !prev)}
          showHints={showHints}
          onToggleHints={() => setShowHints((prev) => !prev)}
          isAddingOpen={isAddingOpen}
          onOpenAddForm={(preselectTrackKey) => {
            setFormError("");
            if (typeof preselectTrackKey === "string" && preselectTrackKey) {
              const normalized = normalizeTrackKey(preselectTrackKey);
              const defaultMatch = DAFTAR_PERON.find((p) => p.id === normalized);
              if (defaultMatch) {
                setIsCustomJalur(false);
                setJalur(defaultMatch.id);
              } else {
                setIsCustomJalur(true);
                setCustomJalur(normalized);
              }
            }
            setIsAddingOpen(true);
          }}
          onCloseAddForm={() => {
            setFormError("");
            setIsAddingOpen(false);
          }}
          formTitle={title}
          onChangeFormTitle={setTitle}
          formTanggal={tanggal}
          onChangeFormTanggal={setTanggal}
          formJam={jam}
          onChangeFormJam={setJam}
          formJalur={jalur}
          onChangeFormJalur={setJalur}
          isCustomJalur={isCustomJalur}
          onChangeIsCustomJalur={setIsCustomJalur}
          customJalur={customJalur}
          onChangeCustomJalur={setCustomJalur}
          anomaliType={anomaliType}
          onChangeAnomaliType={setAnomaliType}
          onQuickMinutes={handleIsiCepatMenit}
          onQuickTimeToday={handleIsiJamHariIni}
          onSubmitNewTask={handleTambahJadwal}
          submitting={submitting}
          formError={formError}
        />
      </div>
    </main>
  );
}
