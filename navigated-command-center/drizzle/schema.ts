import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const operatorActions = mysqlTable("operator_actions", {
  id: int("id").autoincrement().primaryKey(),
  actionType: varchar("actionType", { length: 64 }).notNull(),
  payload: text("payload"),
  actorOpenId: varchar("actorOpenId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const scenarioHistory = mysqlTable("scenario_history", {
  id: int("id").autoincrement().primaryKey(),
  scenarioId: varchar("scenarioId", { length: 32 }).notNull(),
  action: mysqlEnum("action", ["SET", "CLEAR", "RECALCULATE"]).notNull(),
  delayMinutes: int("delayMinutes").default(0).notNull(),
  affectedFleet: int("affectedFleet").default(0).notNull(),
  actorOpenId: varchar("actorOpenId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const trainEtaObservations = mysqlTable("train_eta_observations", {
  id: int("id").autoincrement().primaryKey(),
  trainId: varchar("trainId", { length: 16 }).notNull(),
  etaMinutes: int("etaMinutes").notNull(),
  scheduledMinutes: int("scheduledMinutes").notNull(),
  confidence: int("confidence").notNull(),
  position: int("position").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type OperatorAction = typeof operatorActions.$inferSelect;
export type ScenarioHistory = typeof scenarioHistory.$inferSelect;
export type TrainEtaObservation = typeof trainEtaObservations.$inferSelect;
