import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, operatorActions, scenarioHistory, trainEtaObservations, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function recordOperatorAction(actionType: string, payload: Record<string, unknown>, actorOpenId?: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(operatorActions).values({ actionType, payload: JSON.stringify(payload), actorOpenId: actorOpenId ?? null });
}

export async function recordScenarioTransition(scenarioId: string, action: "SET" | "CLEAR" | "RECALCULATE", delayMinutes: number, affectedFleet: number, actorOpenId?: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(scenarioHistory).values({ scenarioId, action, delayMinutes, affectedFleet, actorOpenId: actorOpenId ?? null });
}

export async function recordEtaObservation(trainId: string, etaMinutes: number, scheduledMinutes: number, confidence: number, position: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(trainEtaObservations).values({ trainId, etaMinutes, scheduledMinutes, confidence, position });
}

export async function getActionHistory(limit = 24) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(operatorActions).orderBy(desc(operatorActions.createdAt)).limit(limit);
}

export async function getScenarioHistory(limit = 12) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scenarioHistory).orderBy(desc(scenarioHistory.createdAt)).limit(limit);
}

export async function getTrainEtaHistory(trainId: string, limit = 24) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trainEtaObservations).where(eq(trainEtaObservations.trainId, trainId)).orderBy(desc(trainEtaObservations.createdAt)).limit(limit);
}
