import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, projects, generations, orders, InsertProject, InsertGeneration, InsertOrder } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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

// Project operations
export async function createProject(project: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(projects).values(project);
  return result[0].insertId;
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProjectsBySession(sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(projects).where(eq(projects.sessionId, sessionId)).orderBy(desc(projects.createdAt));
}

export async function updateProjectStatus(id: number, status: "draft" | "generating" | "completed" | "ordered") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(projects).set({ status }).where(eq(projects.id, id));
}

// Generation operations
export async function createGeneration(generation: InsertGeneration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(generations).values(generation);
  return result[0].insertId;
}

export async function getGenerationsByProject(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(generations).where(eq(generations.projectId, projectId)).orderBy(desc(generations.createdAt));
}

export async function markGenerationAsSelected(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(generations).set({ isSelected: true }).where(eq(generations.id, id));
}

// Order operations
export async function createOrder(order: InsertOrder) {
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
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(orders).set({ 
    paymentStatus,
    ...(stripePaymentIntentId && { stripePaymentIntentId })
  }).where(eq(orders.id, id));
}

// 3D Model generation operations
export async function create3DModelGeneration(data: {
  projectId: number;
  tripoTaskId: string;
  status: string;
  sourceGenerationId: number;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(generations).values({
    projectId: data.projectId,
    type: "model_3d",
    groupNumber: 0,
    assetUrls: JSON.stringify([]),
    assetKeys: JSON.stringify([]),
    isSelected: true,
    metadata: JSON.stringify({
      tripoTaskId: data.tripoTaskId,
      status: data.status,
      sourceGenerationId: data.sourceGenerationId,
    }),
  });
  
  return Number(result[0].insertId);
}

export async function update3DModelGeneration(generationId: number, data: {
  status: string;
  modelUrl?: string;
  modelKey?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const generation = await db.select().from(generations).where(eq(generations.id, generationId)).limit(1);
  if (generation.length === 0) throw new Error("Generation not found");
  
  const metadata = JSON.parse(generation[0].metadata || '{}');
  metadata.status = data.status;
  
  const updateData: any = { metadata: JSON.stringify(metadata) };
  
  if (data.modelUrl && data.modelKey) {
    updateData.assetUrls = JSON.stringify([data.modelUrl]);
    updateData.assetKeys = JSON.stringify([data.modelKey]);
  }
  
  await db.update(generations)
    .set(updateData)
    .where(eq(generations.id, generationId));
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
