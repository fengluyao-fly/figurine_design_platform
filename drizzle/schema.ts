import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Projects table - stores user's figurine design projects
 * Each project represents one design request with description and optional sketch
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  /** Anonymous session identifier for tracking non-authenticated users */
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  /** Text description of the desired figurine */
  description: text("description").notNull(),
  /** S3 URL of uploaded sketch image (optional) */
  sketchUrl: varchar("sketchUrl", { length: 512 }),
  /** S3 key for sketch image */
  sketchKey: varchar("sketchKey", { length: 512 }),
  /** Current status of the project */
  status: mysqlEnum("status", ["draft", "generating", "completed", "ordered"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Generations table - stores AI-generated images and 3D models
 * Each generation belongs to a project and contains either three-view images or 3D model
 */
export const generations = mysqlTable("generations", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  /** Type of generation: three_view (9 images in 3 groups) or model_3d */
  type: mysqlEnum("type", ["three_view", "model_3d"]).notNull(),
  /** For three_view: group number (1, 2, or 3). For model_3d: null */
  groupNumber: int("groupNumber"),
  /** JSON array of image URLs for three_view, single URL for model_3d */
  assetUrls: text("assetUrls").notNull(),
  /** JSON array of S3 keys corresponding to assetUrls */
  assetKeys: text("assetKeys").notNull(),
  /** Whether this generation was selected by user */
  isSelected: boolean("isSelected").default(false).notNull(),
  /** Generation parameters and metadata (JSON) */
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Generation = typeof generations.$inferSelect;
export type InsertGeneration = typeof generations.$inferInsert;

/**
 * Orders table - stores order information after user selects design and pays deposit
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().unique(),
  /** User's contact email */
  contactEmail: varchar("contactEmail", { length: 320 }).notNull(),
  /** User's contact phone (optional) */
  contactPhone: varchar("contactPhone", { length: 32 }),
  /** User's modification feedback for the 3D model */
  modificationFeedback: text("modificationFeedback"),
  /** Payment status */
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
  /** Stripe payment intent ID */
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 128 }),
  /** Stripe checkout session ID */
  stripeSessionId: varchar("stripeSessionId", { length: 128 }),
  /** Deposit amount in USD */
  depositAmount: decimal("depositAmount", { precision: 10, scale: 2 }).default("20.00").notNull(),
  /** Order status for designer workflow */
  orderStatus: mysqlEnum("orderStatus", ["submitted", "in_progress", "completed", "cancelled"]).default("submitted").notNull(),
  /** Designer notes (internal use) */
  designerNotes: text("designerNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
