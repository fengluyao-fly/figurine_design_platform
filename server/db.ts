import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, projects, orders, InsertOrder, generations, Project } from "../drizzle/schema";
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

// User operations
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Project operations - New simplified API
export async function createProject(data: {
  sessionId: string;
  inputType: "text" | "single_image" | "multi_view";
  textPrompt?: string;
  imageUrls?: string[];
  imageKeys?: string[];
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(projects).values({
    sessionId: data.sessionId,
    inputType: data.inputType,
    textPrompt: data.textPrompt || null,
    imageUrls: data.imageUrls ? JSON.stringify(data.imageUrls) : null,
    imageKeys: data.imageKeys ? JSON.stringify(data.imageKeys) : null,
    status: "draft",
  });
  return result[0].insertId;
}

export async function getProjectById(id: number): Promise<Project | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProjectsBySession(sessionId: string): Promise<Project[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(projects).where(eq(projects.sessionId, sessionId)).orderBy(desc(projects.createdAt));
}

export async function updateProject(id: number, data: Partial<{
  status: "draft" | "generating_views" | "views_ready" | "generating_3d" | "completed" | "ordered";
  fourViewUrls: string[];
  fourViewKeys: string[];
  tripoTaskId: string;
  tripoTaskStatus: "pending" | "queued" | "running" | "success" | "failed";
  modelUrl: string;
  modelKey: string;
  regenerationCount: number;
  userId: number;
  isSaved: boolean;
}>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: Record<string, unknown> = {};
  
  if (data.status !== undefined) updateData.status = data.status;
  if (data.fourViewUrls !== undefined) updateData.fourViewUrls = JSON.stringify(data.fourViewUrls);
  if (data.fourViewKeys !== undefined) updateData.fourViewKeys = JSON.stringify(data.fourViewKeys);
  if (data.tripoTaskId !== undefined) updateData.tripoTaskId = data.tripoTaskId;
  if (data.tripoTaskStatus !== undefined) updateData.tripoTaskStatus = data.tripoTaskStatus;
  if (data.modelUrl !== undefined) updateData.modelUrl = data.modelUrl;
  if (data.modelKey !== undefined) updateData.modelKey = data.modelKey;
  if (data.regenerationCount !== undefined) updateData.regenerationCount = data.regenerationCount;
  if (data.userId !== undefined) updateData.userId = data.userId;
  if (data.isSaved !== undefined) updateData.isSaved = data.isSaved;

  await db.update(projects).set(updateData).where(eq(projects.id, id));
}

export async function getProjectsByUserId(userId: number): Promise<Project[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.createdAt));
}

// Order operations
export async function createOrder(order: InsertOrder): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(orders).values(order);
  return result[0].insertId;
}

export async function getOrderByProject(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(orders).where(eq(orders.projectId, projectId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateOrderPaymentStatus(
  id: number,
  paymentStatus: "pending" | "paid" | "failed" | "refunded",
  stripePaymentIntentId?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(orders).set({ 
    paymentStatus,
    ...(stripePaymentIntentId && { stripePaymentIntentId })
  }).where(eq(orders.id, id));
}

// Legacy functions for backward compatibility with old projects
// These use the generations table which is deprecated for new projects

export async function getGenerationsByProject(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(generations).where(eq(generations.projectId, projectId)).orderBy(desc(generations.createdAt));
}

export async function get3DModelByProject(projectId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select()
    .from(generations)
    .where(eq(generations.projectId, projectId))
    .orderBy(desc(generations.createdAt))
    .limit(1);
  
  const models = result.filter(g => g.type === "model_3d");
  return models.length > 0 ? models[0] : null;
}
