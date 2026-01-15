import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
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

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Projects table - simplified for Tripo-only workflow
 * Supports text, single image, or multi-view image inputs
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  userId: int("userId"), // null for trial users, set when user saves to account
  isSaved: boolean("isSaved").default(false).notNull(), // whether user has saved this project to their account
  
  // Legacy field - kept for backwards compatibility
  description: text("description"),
  sketchUrl: varchar("sketchUrl", { length: 512 }),
  sketchKey: varchar("sketchKey", { length: 512 }),
  
  // Input type: what the user provided
  inputType: mysqlEnum("inputType", ["text", "single_image", "multi_view"]).default("text").notNull(),
  
  // Text prompt (for text input or as description)
  textPrompt: text("textPrompt"),
  
  // Uploaded images (JSON array of URLs, 1-4 images)
  imageUrls: text("imageUrls"),
  imageKeys: text("imageKeys"),
  
  // Four-view images generated from single image (JSON array of 4 URLs)
  fourViewUrls: text("fourViewUrls"),
  fourViewKeys: text("fourViewKeys"),
  
  // Tripo task tracking
  tripoTaskId: varchar("tripoTaskId", { length: 128 }),
  tripoTaskStatus: mysqlEnum("tripoTaskStatus", ["pending", "queued", "running", "success", "failed"]).default("pending"),
  
  // Generated 3D model
  modelUrl: text("modelUrl"),
  modelKey: varchar("modelKey", { length: 512 }),
  
  // Allow one regeneration
  regenerationCount: int("regenerationCount").default(0).notNull(),
  
  // Overall project status
  status: mysqlEnum("status", ["draft", "generating_views", "views_ready", "generating_3d", "completed", "ordered"]).default("draft").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Orders table - stores order information after user pays deposit
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().unique(),
  contactEmail: varchar("contactEmail", { length: 320 }).notNull(),
  contactPhone: varchar("contactPhone", { length: 32 }),
  modificationFeedback: text("modificationFeedback"),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 128 }),
  stripeSessionId: varchar("stripeSessionId", { length: 128 }),
  depositAmount: decimal("depositAmount", { precision: 10, scale: 2 }).default("20.00").notNull(),
  orderStatus: mysqlEnum("orderStatus", ["submitted", "in_progress", "completed", "cancelled"]).default("submitted").notNull(),
  designerNotes: text("designerNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Legacy tables - kept for backward compatibility with existing data
// These will not be used for new projects

/**
 * @deprecated Use projects table fields instead
 * Legacy generations table for old projects
 */
export const generations = mysqlTable("generations", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  type: mysqlEnum("type", ["three_view", "model_3d"]).notNull(),
  groupNumber: int("groupNumber"),
  assetUrls: text("assetUrls").notNull(),
  assetKeys: text("assetKeys").notNull(),
  isSelected: boolean("isSelected").default(false).notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Generation = typeof generations.$inferSelect;
export type InsertGeneration = typeof generations.$inferInsert;

/**
 * @deprecated Use projects table fields instead
 * Legacy 3D model generations table
 */
export const model3dGenerations = mysqlTable("model3d_generations", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  tripoTaskId: varchar("tripoTaskId", { length: 128 }),
  status: mysqlEnum("status", ["processing", "completed", "failed"]).default("processing").notNull(),
  modelUrl: text("modelUrl"),
  modelKey: varchar("modelKey", { length: 512 }),
  sourceGenerationId: int("sourceGenerationId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Model3dGeneration = typeof model3dGenerations.$inferSelect;
export type InsertModel3dGeneration = typeof model3dGenerations.$inferInsert;
