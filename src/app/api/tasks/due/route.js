import { NextResponse, connection } from "next/server";
import { getAllTasks, verifyUserFromRequest } from "@/lib/firebase";

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

    const now = new Date();
    const tasks = await getAllTasks(user.uid);
    const dueTasks = tasks.filter(
      (t) => !t.notified && !t.completed && new Date(t.dueAt) <= now
    );
    return NextResponse.json(dueTasks);
  } catch (err) {
    console.error("Gagal cek tugas jatuh tempo:", err);
    return NextResponse.json(
      { error: "Toa stasiun gagal ngecek jadwal yang udah mepet." },
      { status: 500 }
    );
  }
}
