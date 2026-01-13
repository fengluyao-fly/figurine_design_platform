import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createProject, getProjectById, getProjectsBySession, updateProjectStatus, createOrder, getOrderByProject, createGeneration, getGenerationsByProject, markGenerationAsSelected, create3DModelGeneration, update3DModelGeneration, get3DModelByProject } from "./db";
import { createMultiviewTo3DTask, waitForTaskCompletion } from "./tripo";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { generateImageWithReplicate } from "./replicate-image.js";
import { generateThreeViews } from "./nano-banana.js";
import Stripe from "stripe";
import { PRODUCTS } from "./products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  projects: router({
    create: publicProcedure
      .input(z.object({
        description: z.string().min(20),
        sketchBase64: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Generate session ID from cookie or create new one
        const sessionId = ctx.req.cookies?.['figurine_session'] || nanoid();
        
        // Upload sketch to S3 if provided
        let sketchUrl: string | undefined;
        let sketchKey: string | undefined;
        
        if (input.sketchBase64) {
          const base64Data = input.sketchBase64.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          const mimeType = input.sketchBase64.match(/data:(.*?);/)?.[1] || 'image/png';
          const extension = mimeType.split('/')[1];
          
          sketchKey = `sketches/${sessionId}/${nanoid()}.${extension}`;
          const result = await storagePut(sketchKey, buffer, mimeType);
          sketchUrl = result.url;
        }
        
        const projectId = await createProject({
          sessionId,
          description: input.description,
          sketchUrl,
          sketchKey,
          status: 'draft',
        });
        
        // Set session cookie
        ctx.res.cookie('figurine_session', sessionId, {
          httpOnly: true,
          secure: ctx.req.protocol === 'https',
          sameSite: 'lax',
          maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        });
        
        return { projectId };
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getProjectById(input.id);
      }),
    
    getBySession: publicProcedure
      .query(async ({ ctx }) => {
        const sessionId = ctx.req.cookies?.['figurine_session'];
        if (!sessionId) return [];
        return await getProjectsBySession(sessionId);
      }),
  }),

  generations: router({
    generateThreeViews: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ input }) => {
        const project = await getProjectById(input.projectId);
        if (!project) throw new Error("Project not found");
        
        // Update project status
        await updateProjectStatus(input.projectId, "generating");
        
        // Generate 3 groups of three-view images
        const groups = [];
        
        // Generate 3 different design variations using Nano Banana Pro
        for (let groupNum = 1; groupNum <= 3; groupNum++) {
          // Build prompt for three-view generation
          let basePrompt = project.description && project.description.trim()
            ? project.description
            : "product design";
          
          // Add variation hint
          const fullPrompt = `${basePrompt}. Design variation ${groupNum}.`;
          
          try {
            console.log(`[Generations] Generating three-view for group ${groupNum}...`);
            
            // Use Nano Banana Pro to generate and split three views
            const threeViews = await generateThreeViews({
              prompt: fullPrompt,
              imageUrl: project.sketchUrl || undefined,
              resolution: "2K",
            });
            
            // Save generation to database with 3 separate image URLs
            const imageUrls = [
              threeViews.frontView,
              threeViews.sideView,
              threeViews.backView,
            ];
            
            await createGeneration({
              projectId: input.projectId,
              type: "three_view",
              groupNumber: groupNum,
              assetUrls: JSON.stringify(imageUrls),
              assetKeys: JSON.stringify(imageUrls.map(url => url.split('/').pop() || '')),
              isSelected: false,
              metadata: JSON.stringify({ 
                description: project.description,
                prompt: fullPrompt,
              }),
            });
            
            groups.push({ 
              groupNumber: groupNum, 
              imageUrls,
            });
            
            console.log(`[Generations] Group ${groupNum} completed with 3 views`);
            
          } catch (error) {
            console.error(`Failed to generate three-view for group ${groupNum}:`, error);
            throw new Error(`Image generation failed for design variation ${groupNum}`);
          }
        }
        
        // Update project status to completed
        await updateProjectStatus(input.projectId, "completed");
        
        return { groups };
      }),
    
    getByProject: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await getGenerationsByProject(input.projectId);
      }),
    
    selectGroup: publicProcedure
      .input(z.object({ 
        generationId: z.number(),
        projectId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await markGenerationAsSelected(input.generationId);
        
        // Start 3D model generation
        const generation = await getGenerationsByProject(input.projectId);
        const selected = generation.find(g => g.id === input.generationId);
        
        if (!selected) {
          throw new Error("Selected generation not found");
        }
        
        const imageUrls = JSON.parse(selected.assetUrls);
        
        // Create Tripo task
        const taskId = await createMultiviewTo3DTask(imageUrls);
        
        // Save 3D generation record
        const modelGenId = await create3DModelGeneration({
          projectId: input.projectId,
          tripoTaskId: taskId,
          status: "processing",
          sourceGenerationId: input.generationId,
        });
        
        // Start async polling (don't await - let it run in background)
        waitForTaskCompletion(taskId, 600).then(async (result) => {
          try {
            if (result.output?.pbr_model) {
              console.log('[3D Model] Task completed, downloading GLB file from Tripo AI...');
              console.log('[3D Model] GLB URL:', result.output.pbr_model);
              
              // Download GLB file from Tripo AI
              const glbResponse = await fetch(result.output.pbr_model);
              if (!glbResponse.ok) {
                throw new Error(`Failed to download GLB: ${glbResponse.status} ${glbResponse.statusText}`);
              }
              const glbBuffer = Buffer.from(await glbResponse.arrayBuffer());
              
              console.log('[3D Model] GLB file downloaded, size:', glbBuffer.length, 'bytes');
              
              // Upload to S3
              const timestamp = Date.now();
              const randomStr = Math.random().toString(36).substring(2, 8);
              const glbKey = `3d-models/${timestamp}-${randomStr}.glb`;
              
              console.log('[3D Model] Uploading to S3 with key:', glbKey);
              const { url: glbUrl } = await storagePut(glbKey, glbBuffer, 'model/gltf-binary');
              
              console.log('[3D Model] GLB uploaded to S3:', glbUrl);
              
              await update3DModelGeneration(modelGenId, {
                status: "completed",
                modelUrl: glbUrl,
                modelKey: glbKey,
              });
              
              console.log('[3D Model] Database updated successfully');
            } else {
              throw new Error('No pbr_model in result.output');
            }
          } catch (error) {
            console.error('[3D Model] Error in processing:', error);
            console.error('[3D Model] Error stack:', error instanceof Error ? error.stack : 'No stack');
            throw error;
          }
        }).catch(async (error) => {
          console.error("[3D Model] 3D generation failed:", error);
          console.error("[3D Model] Error details:", error instanceof Error ? error.message : String(error));
          await update3DModelGeneration(modelGenId, {
            status: "failed",
          });
        });
        
        return { success: true, modelGenerationId: modelGenId };
      }),
  }),

  model3d: router({
    getByProject: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await get3DModelByProject(input.projectId);
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
        
        // Update project status
        await updateProjectStatus(input.projectId, "ordered");
        
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
          cancel_url: `${origin}/generate/${input.projectId}`,
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
