import { NextResponse } from "next/server";
import {
  deleteTask,
  updateTask,
  verifyUserFromRequest,
} from "@/lib/firebase";

export async function PATCH(request, { params }) {
  try {
    const user = await verifyUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Silakan login Google dulu rek!" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const updates = await request.json();

    const cleanUpdates = {};
    if (typeof updates.title === "string" && updates.title.trim() !== "") {
      cleanUpdates.title = updates.title.trim();
    }
    if (
      typeof updates.dueAt === "string" &&
      !Number.isNaN(new Date(updates.dueAt).getTime())
    ) {
      cleanUpdates.dueAt = updates.dueAt;
    }
    if (typeof updates.jalur === "string") {
      cleanUpdates.jalur = updates.jalur;
    }
    if (typeof updates.anomaliType === "string") {
      cleanUpdates.anomaliType = updates.anomaliType;
    }
    if (typeof updates.notified === "boolean") {
      cleanUpdates.notified = updates.notified;
    }
    if (typeof updates.completed === "boolean") {
      cleanUpdates.completed = updates.completed;
    }

    const updated = await updateTask(user.uid, id, cleanUpdates);
    if (!updated) {
      return NextResponse.json(
        { error: "Jadwal gak ketemu di peron!" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Gagal update jadwal:", err);
    return NextResponse.json(
      { error: "Server stasiun gagal nge-update jadwal." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await verifyUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Silakan login Google dulu rek!" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await deleteTask(user.uid, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Gagal hapus jadwal:", err);
    return NextResponse.json(
      { error: "Gagal ngehapus jadwal dari papan peron." },
      { status: 500 }
    );
  }
}
