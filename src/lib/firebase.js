import { getApp, getApps, initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  updateDoc,
} from "firebase/firestore";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const COLLECTION_NAME = "tasks";
const LOCAL_FILE_PATH = path.join(process.cwd(), "data", "tasks-lokal.json");

function isFirebaseReady() {
  const projectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  return Boolean(projectId && projectId.trim() !== "");
}

function getDb() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  return getFirestore(app);
}

function sortByDueAt(tasks) {
  return [...tasks].sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
}

async function readLocalTasks() {
  try {
    const raw = await readFile(LOCAL_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err.code === "ENOENT") {
      await writeLocalTasks([]);
      return [];
    }
    throw err;
  }
}

async function writeLocalTasks(tasks) {
  await mkdir(path.dirname(LOCAL_FILE_PATH), { recursive: true });
  await writeFile(LOCAL_FILE_PATH, JSON.stringify(tasks, null, 2), "utf-8");
}

export function getStorageMode() {
  return isFirebaseReady() ? "firebase" : "lokal";
}

export async function verifyUserFromRequest(request) {
  const authHeader = request.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return null;
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const user = Array.isArray(data.users) ? data.users[0] : null;
    if (!user || !user.localId) {
      return null;
    }

    return {
      uid: user.localId,
      email: user.email || "",
      name: user.displayName || "",
    };
  } catch (err) {
    console.error("Gagal verifikasi token Google:", err);
    return null;
  }
}

export async function getAllTasks(userId) {
  if (!userId) return [];

  if (isFirebaseReady()) {
    const db = getDb();
    const userTasksRef = collection(db, "users", String(userId), COLLECTION_NAME);
    const snapshot = await getDocs(userTasksRef);
    const list = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));
    return sortByDueAt(list);
  }

  const localList = await readLocalTasks();
  const userTasks = localList.filter(
    (t) => String(t.userId || "") === String(userId)
  );
  return sortByDueAt(userTasks);
}

export async function createTask(userId, { title, dueAt, jalur, anomaliType }) {
  const newTaskData = {
    title,
    dueAt,
    jalur: jalur || "PERON 1 • KULIAH",
    anomaliType: anomaliType || "robot",
    notified: false,
    completed: false,
  };

  if (isFirebaseReady()) {
    const db = getDb();
    const userTasksRef = collection(db, "users", String(userId), COLLECTION_NAME);
    const docRef = await addDoc(userTasksRef, newTaskData);
    return {
      id: docRef.id,
      ...newTaskData,
    };
  }

  const localList = await readLocalTasks();
  const newTask = {
    id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: String(userId),
    ...newTaskData,
  };
  localList.push(newTask);
  await writeLocalTasks(localList);
  return newTask;
}

export async function updateTask(userId, id, updates) {
  if (!userId) return null;

  if (isFirebaseReady()) {
    const db = getDb();
    const taskRef = doc(db, "users", String(userId), COLLECTION_NAME, String(id));
    const existing = await getDoc(taskRef);
    if (!existing.exists()) {
      return null;
    }
    await updateDoc(taskRef, updates);
    return {
      id: existing.id,
      ...existing.data(),
      ...updates,
    };
  }

  const localList = await readLocalTasks();
  const index = localList.findIndex(
    (t) => String(t.id) === String(id) && String(t.userId || "") === String(userId)
  );
  if (index === -1) {
    return null;
  }
  localList[index] = {
    ...localList[index],
    ...updates,
  };
  await writeLocalTasks(localList);
  return localList[index];
}

export async function deleteTask(userId, id) {
  if (!userId) return false;

  if (isFirebaseReady()) {
    const db = getDb();
    const taskRef = doc(db, "users", String(userId), COLLECTION_NAME, String(id));
    await deleteDoc(taskRef);
    return true;
  }

  const localList = await readLocalTasks();
  const filtered = localList.filter(
    (t) => !(String(t.id) === String(id) && String(t.userId || "") === String(userId))
  );
  await writeLocalTasks(filtered);
  return true;
}
