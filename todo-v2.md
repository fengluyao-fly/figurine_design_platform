# Maker Mart Platform Redesign TODO

## Branding & Content Updates
- [x] Change logo/brand name to "Maker Mart"
- [x] Update all "FigurineForge" references to "Maker Mart" (in Home page)
- [x] Change "figurines" to "manufactured products" throughout
- [x] Update homepage hero section copy
- [ ] Update meta tags and page titles
- [ ] Research and recommend domain names
- [ ] Update other pages (History, Model3D, etc.)

## Homepage Interaction Redesign
- [x] Remove separate "Create Project" page navigation
- [x] Add direct input form on homepage
- [x] Implement unified input: text + optional image upload
- [x] Handle three input modes: text-only, image-only, text+image
- [ ] Backend: If both text and image, use img2img mode

## Image Generation Logic Overhaul
- [x] Generate 3 groups of 3 separate images (9 total)
- [x] Each group = 3 independent images (front, side, back views)
- [x] Display 9 images in 3 columns, grouped visually
- [x] User selects ONE group (3 images)
- [x] After selection: option to "Edit with Text" or "Generate 3D Model"

## Text-based Editing Feature
- [x] Add "Edit with Text" button after group selection
- [x] Show text input for modification prompt
- [ ] Backend: Generate ONLY 1 new group (3 images) based on edit
- [ ] Backend: Replace previous selection with new group
- [ ] Allow multiple iterations of text editing

## API Integration Updates
- [ ] Ensure Replicate API ready for text-to-image
- [ ] Ensure Replicate API supports img2img (text + image input)
- [ ] Update generation logic to handle edit mode (1 group only)
- [ ] Test all three input scenarios

## Testing & Validation
- [ ] Test text-only input → 9 images
- [ ] Test image-only input → 9 images  
- [ ] Test text+image input → 9 images (img2img)
- [ ] Test group selection → edit flow → 3 new images
- [ ] Test complete flow: input → select → edit → 3D model → payment

## UI Adjustments
- [x] Swap order: Upload Reference Image (primary) above Describe Your Product (optional)
- [x] Update labels and placeholders to reflect new priority

## Image Generation Logic Fixes
- [x] Fix: Generated images should closely reference user's uploaded image (img2img mode)
- [x] Fix: Each group should generate exactly 3 images (front, side, back views)
- [x] Ensure organic combination of text + image input (not separate generation)
- [ ] Test with uploaded image to verify similarity

## Replicate API Integration
- [x] Store Replicate API key in environment
- [x] Update image generation to use Replicate instead of Manus API
- [x] Implement img2img mode for all groups (use uploaded image as reference)
- [ ] Test generation with uploaded image

## Bug Fixes - Image Generation Error (2026-01-12)
- [x] Investigate "Image generation failed for front view" error (429 rate limit due to low balance)
- [x] Check server logs for detailed error messages (Replicate balance < $5)
- [x] Fix Replicate API call issues (User recharged account)
- [x] Test image generation with different inputs (API working normally)

## Critical Fix - Three-View Generation (FINAL SOLUTION)
- [x] Integrate Google Nano Banana Pro for three-view generation
- [x] Generate 3 design variations using Nano Banana Pro
- [x] Each variation: 1 image containing front/side/back views in a single sheet
- [x] Implement automatic image splitting to extract 3 separate files from each sheet
- [x] Use sharp library for precise image cropping
- [x] Ensure text description modifies the reference image (img2img mode)
- [x] Pass all 3 split images to Tripo AI for 3D model generation
- [ ] Test with user's example: "Make the whole body of this 3 year old boy. Wearing white socks in black sneakers."
- [x] Cost: $0.15 per variation (2K resolution)

## Retry Logic for Rate Limiting
- [x] Implement smart retry logic for Replicate API 429 errors
- [x] Auto-detect retry_after from error response
- [x] Add intelligent wait time with buffer
- [x] Max 5 retries before failing
- [x] Test with rate-limited scenarios
- [x] Fix retry logic counter increment order

## Download Retry Logic
- [x] Implement download retry logic for image fetching
- [x] Add 30-second timeout for each download attempt
- [x] Max 3 retries with 5-second delay between attempts
- [x] Successfully tested with Nano Banana Pro generated images
- [x] All images uploaded to S3/CloudFront successfully
