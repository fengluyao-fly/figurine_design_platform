import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createProject, getProjectById, getProjectsBySession, getProjectsByUserId, updateProject, createOrder, getOrderByProject } from "./db";
import { createTextTo3DTask, createImageTo3DTask, createMultiviewTo3DTask, createTextureModelTask, waitForTaskCompletion, getModelUrlFromResult, TRIPO_STYLES } from "./tripo";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import Stripe from "stripe";
import { PRODUCTS } from "./products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  projects: router({
    // Create a new project with text, single image, or multi-view images
    create: publicProcedure
      .input(z.object({
        inputType: z.enum(["text", "single_image", "multi_view"]),
        textPrompt: z.string().optional(),
        imageBase64: z.string().optional(), // For single image
        imageBase64Array: z.array(z.string()).optional(), // For multi-view (1-4 images)
      }))
      .mutation(async ({ input, ctx }) => {
        const sessionId = ctx.req.cookies?.['figurine_session'] || nanoid();
        
        let imageUrls: string[] = [];
        let imageKeys: string[] = [];
        
        // Handle image uploads
        if (input.inputType === "single_image" && input.imageBase64) {
          const { url, key } = await uploadBase64Image(input.imageBase64, sessionId);
          imageUrls = [url];
          imageKeys = [key];
        } else if (input.inputType === "multi_view" && input.imageBase64Array) {
          for (const base64 of input.imageBase64Array) {
            const { url, key } = await uploadBase64Image(base64, sessionId);
            imageUrls.push(url);
            imageKeys.push(key);
          }
        }
        
        const projectId = await createProject({
          sessionId,
          inputType: input.inputType,
          textPrompt: input.textPrompt,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
          imageKeys: imageKeys.length > 0 ? imageKeys : undefined,
        });
        
        // Set session cookie
        ctx.res.cookie('figurine_session', sessionId, {
          httpOnly: true,
          secure: ctx.req.protocol === 'https',
          sameSite: 'lax',
          maxAge: 365 * 24 * 60 * 60 * 1000,
        });
        
        return { projectId };
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const project = await getProjectById(input.id);
        if (!project) return null;
        
        // Parse JSON fields for frontend
        return {
          ...project,
          imageUrls: project.imageUrls ? JSON.parse(project.imageUrls) : [],
          imageKeys: project.imageKeys ? JSON.parse(project.imageKeys) : [],
          fourViewUrls: project.fourViewUrls ? JSON.parse(project.fourViewUrls) : [],
          fourViewKeys: project.fourViewKeys ? JSON.parse(project.fourViewKeys) : [],
        };
      }),
    
    getBySession: publicProcedure
      .query(async ({ ctx }) => {
        const sessionId = ctx.req.cookies?.['figurine_session'];
        if (!sessionId) return [];
        const projects = await getProjectsBySession(sessionId);
        return projects.map(p => ({
          ...p,
          imageUrls: p.imageUrls ? JSON.parse(p.imageUrls) : [],
          fourViewUrls: p.fourViewUrls ? JSON.parse(p.fourViewUrls) : [],
          isSaved: p.isSaved || false,
        }));
      }),
    
    // Save a project to user's account (requires login)
    saveToAccount: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("LOGIN_REQUIRED");
        }
        
        const project = await getProjectById(input.projectId);
        if (!project) throw new Error("Project not found");
        
        // Update project with user ID
        await updateProject(input.projectId, {
          userId: ctx.user.id,
          isSaved: true,
        });
        
        return { success: true };
      }),
    
    // Get all saved projects for logged-in user
    getSavedProjects: publicProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) return [];
        const savedProjects = await getProjectsByUserId(ctx.user.id);
        return savedProjects.map((p: typeof savedProjects[number]) => ({
          ...p,
          imageUrls: p.imageUrls ? JSON.parse(p.imageUrls) : [],
          fourViewUrls: p.fourViewUrls ? JSON.parse(p.fourViewUrls) : [],
          isSaved: true,
        }));
      }),
  }),

  generate: router({
    // Generate 3D model directly from project input
    start3DGeneration: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ input }) => {
        const project = await getProjectById(input.projectId);
        if (!project) throw new Error("Project not found");
        
        // Check regeneration limit
        if (project.regenerationCount >= 2) {
          throw new Error("Maximum regeneration limit reached (2 times)");
        }
        
        // Update status
        await updateProject(input.projectId, { status: "generating_3d" });
        
        let taskId: string;
        
        try {
          // Choose generation method based on input type
          if (project.inputType === "text") {
            if (!project.textPrompt) throw new Error("Text prompt is required");
            taskId = await createTextTo3DTask(project.textPrompt);
          } else if (project.inputType === "single_image") {
            const imageUrls = project.imageUrls ? JSON.parse(project.imageUrls) : [];
            if (imageUrls.length === 0) throw new Error("Image is required");
            taskId = await createImageTo3DTask(imageUrls[0]);
          } else if (project.inputType === "multi_view") {
            // Use four-view images if available, otherwise use uploaded images
            const fourViewUrls = project.fourViewUrls ? JSON.parse(project.fourViewUrls) : [];
            const imageUrls = project.imageUrls ? JSON.parse(project.imageUrls) : [];
            const urls = fourViewUrls.length > 0 ? fourViewUrls : imageUrls;
            if (urls.length === 0) throw new Error("Images are required");
            taskId = await createMultiviewTo3DTask(urls);
          } else {
            throw new Error("Invalid input type");
          }
          
          // Update with task ID
          await updateProject(input.projectId, {
            tripoTaskId: taskId,
            tripoTaskStatus: "queued",
            regenerationCount: project.regenerationCount + 1,
          });
          
          // Start async polling
          pollAndSaveModel(input.projectId, taskId);
          
          return { success: true, taskId };
        } catch (error) {
          await updateProject(input.projectId, { status: "draft" });
          throw error;
        }
      }),
    
    // Get generation status
    getStatus: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const project = await getProjectById(input.projectId);
        if (!project) return null;
        
        return {
          status: project.status,
          tripoTaskStatus: project.tripoTaskStatus,
          modelUrl: project.modelUrl,
          regenerationCount: project.regenerationCount,
          canRegenerate: project.regenerationCount < 2,
        };
      }),
    
    // Get available texture/style options
    getStyles: publicProcedure.query(() => {
      return TRIPO_STYLES.filter(s => s.value !== "default");
    }),
    
    // Apply texture/style transformation to existing model
    applyStyle: publicProcedure
      .input(z.object({
        projectId: z.number(),
        style: z.string(),
      }))
      .mutation(async ({ input }) => {
        const project = await getProjectById(input.projectId);
        if (!project) throw new Error("Project not found");
        if (!project.tripoTaskId) throw new Error("No model to transform");
        if (project.status !== "completed") throw new Error("Model must be completed first");
        
        // Find style prompt
        const styleConfig = TRIPO_STYLES.find(s => s.value === input.style);
        if (!styleConfig || !styleConfig.prompt) {
          throw new Error("Invalid style selected");
        }
        
        // Update status
        await updateProject(input.projectId, { 
          status: "generating_3d",
          tripoTaskStatus: "queued",
        });
        
        try {
          // Create texture transformation task
          const taskId = await createTextureModelTask(project.tripoTaskId, styleConfig.prompt);
          
          // Update with new task ID
          await updateProject(input.projectId, {
            tripoTaskId: taskId,
            tripoTaskStatus: "running",
          });
          
          // Start async polling
          pollAndSaveModel(input.projectId, taskId);
          
          return { success: true, taskId };
        } catch (error) {
          await updateProject(input.projectId, { status: "completed" });
          throw error;
        }
      }),
  }),

  orders: router({
    create: publicProcedure
      .input(z.object({
        projectId: z.number(),
        contactEmail: z.string().email(),
        contactPhone: z.string().optional(),
        designFeedback: z.string(),
      }))
      .mutation(async ({ input }) => {
        const orderId = await createOrder({
          projectId: input.projectId,
          contactEmail: input.contactEmail,
          contactPhone: input.contactPhone,
          modificationFeedback: input.designFeedback,
          paymentStatus: "pending",
        });
        
        await updateProject(input.projectId, { status: "ordered" });
        
        return { orderId };
      }),
  }),

  payment: router({
    createCheckoutSession: publicProcedure
      .input(z.object({
        projectId: z.number(),
        orderId: z.number(),
        contactEmail: z.string().email(),
        contactName: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const origin = ctx.req.headers.origin || `${ctx.req.protocol}://${ctx.req.get('host')}`;
        
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: PRODUCTS.FIGURINE_DEPOSIT.currency,
                product_data: {
                  name: PRODUCTS.FIGURINE_DEPOSIT.name,
                  description: PRODUCTS.FIGURINE_DEPOSIT.description,
                },
                unit_amount: PRODUCTS.FIGURINE_DEPOSIT.amount,
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/project/${input.projectId}`,
          customer_email: input.contactEmail,
          metadata: {
            order_id: input.orderId.toString(),
            project_id: input.projectId.toString(),
            customer_email: input.contactEmail,
            customer_name: input.contactName || "",
          },
          allow_promotion_codes: true,
        });
        
        return { sessionUrl: session.url };
      }),
    
    getOrderStatus: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await getOrderByProject(input.projectId);
      }),
  }),
});

export type AppRouter = typeof appRouter;

// Helper functions

async function uploadBase64Image(base64: string, sessionId: string): Promise<{ url: string; key: string }> {
  const base64Data = base64.split(',')[1] || base64;
  const buffer = Buffer.from(base64Data, 'base64');
  const mimeType = base64.match(/data:(.*?);/)?.[1] || 'image/png';
  const extension = mimeType.split('/')[1] || 'png';
  
  const key = `uploads/${sessionId}/${nanoid()}.${extension}`;
  const result = await storagePut(key, buffer, mimeType);
  
  return { url: result.url, key };
}

async function pollAndSaveModel(projectId: number, taskId: string): Promise<void> {
  try {
    console.log(`[3D Model] Starting poll for project ${projectId}, task ${taskId}`);
    
    await updateProject(projectId, { tripoTaskStatus: "running" });
    
    const result = await waitForTaskCompletion(taskId, 600);
    
    const modelUrl = getModelUrlFromResult(result);
    if (!modelUrl) {
      throw new Error("No model URL in result");
    }
    
    console.log(`[3D Model] Task completed, downloading GLB from:`, modelUrl);
    
    // Download GLB
    const glbResponse = await fetch(modelUrl);
    if (!glbResponse.ok) {
      throw new Error(`Failed to download GLB: ${glbResponse.status}`);
    }
    const glbBuffer = Buffer.from(await glbResponse.arrayBuffer());
    
    // Upload to S3
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const glbKey = `3d-models/${timestamp}-${randomStr}.glb`;
    
    const { url: savedUrl } = await storagePut(glbKey, glbBuffer, 'model/gltf-binary');
    
    console.log(`[3D Model] GLB saved to S3:`, savedUrl);
    
    await updateProject(projectId, {
      status: "completed",
      tripoTaskStatus: "success",
      modelUrl: savedUrl,
      modelKey: glbKey,
    });
    
    console.log(`[3D Model] Project ${projectId} completed successfully`);
  } catch (error) {
    console.error(`[3D Model] Error for project ${projectId}:`, error);
    await updateProject(projectId, {
      status: "draft",
      tripoTaskStatus: "failed",
    });
  }
}
