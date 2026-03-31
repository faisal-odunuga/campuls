import { openDB, type DBSchema } from 'idb';

type OfflineRow = Record<string, unknown> & { id: string };

interface CampusDB extends DBSchema {
  session: {
    key: string;
    value: { token: string; role: 'student' | 'hoc'; updatedAt: number };
  };
  timetable: {
    key: string;
    value: OfflineRow;
  };
  assignments: {
    key: string;
    value: OfflineRow;
  };
  notes: {
    key: string;
    value: OfflineRow;
  };
  queued_mutations: {
    key: string;
    value: {
      id: string;
      kind: string;
      payload: Record<string, unknown>;
      createdAt: number;
    };
  };
}

const DB_NAME = 'campusos-offline';
const DB_VERSION = 1;

async function getDb() {
  return openDB<CampusDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('session')) {
        database.createObjectStore('session');
      }
      if (!database.objectStoreNames.contains('timetable')) {
        database.createObjectStore('timetable', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('assignments')) {
        database.createObjectStore('assignments', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('notes')) {
        database.createObjectStore('notes', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('queued_mutations')) {
        database.createObjectStore('queued_mutations', { keyPath: 'id' });
      }
    }
  });
}

export async function seedOfflineCollections() {
  if (typeof window === 'undefined') {
    return;
  }

  const db = await getDb();
  await db.put('session', { token: 'demo.jwt.token', role: 'student', updatedAt: Date.now() }, 'jwt');
}

export async function saveSessionToken(token: string, role: 'student' | 'hoc') {
  const db = await getDb();
  await db.put('session', { token, role, updatedAt: Date.now() }, 'jwt');
}

export async function readSessionToken() {
  const db = await getDb();
  return db.get('session', 'jwt');
}

export async function cacheRows(store: 'timetable' | 'assignments' | 'notes', rows: OfflineRow[]) {
  const db = await getDb();
  const tx = db.transaction(store, 'readwrite');
  await Promise.all(rows.map((row) => tx.store.put(row)));
  await tx.done;
}

export async function readRows(store: 'timetable' | 'assignments' | 'notes') {
  const db = await getDb();
  return db.getAll(store);
}

export async function queueMutation(kind: string, payload: Record<string, unknown>) {
  const db = await getDb();
  await db.put('queued_mutations', {
    id: crypto.randomUUID(),
    kind,
    payload,
    createdAt: Date.now()
  });
}

export async function readQueuedMutations() {
  const db = await getDb();
  return db.getAll('queued_mutations');
}
