import { NextResponse, connection } from "next/server";
import {
  createTask,
  getAllTasks,
  getStorageMode,
  verifyUserFromRequest,
} from "@/lib/firebase";

export async function GET(request) {
  await connection();

  try {
    const user = await verifyUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Silakan login Google dulu rek!" },
        { status: 401 }
      );
    }

    const tasks = await getAllTasks(user.uid);
    return NextResponse.json(tasks, {
      headers: {
        "x-storage-mode": getStorageMode(),
      },
    });
  } catch (err) {
    console.error("Gagal ambil daftar jadwal:", err);
    return NextResponse.json(
      { error: "Server stasiun lagi gangguan pas ngambil jadwal." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await verifyUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Silakan login Google dulu rek!" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, dueAt, jalur, anomaliType } = body;

    if (!title || !title.trim() || !dueAt) {
      return NextResponse.json(
        { error: "Judul dan jadwal keberangkatan wajib diisi rek!" },
        { status: 400 }
      );
    }

    if (Number.isNaN(new Date(dueAt).getTime())) {
      return NextResponse.json(
        { error: "Format tanggal/jam gak valid!" },
        { status: 400 }
      );
    }

    const newTask = await createTask(user.uid, {
      title: title.trim(),
      dueAt,
      jalur,
      anomaliType,
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (err) {
    console.error("Gagal cetak jadwal baru:", err);
    return NextResponse.json(
      { error: "Loket error pas nyimpen jadwal baru." },
      { status: 500 }
    );
  }
}
