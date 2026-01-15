# Figurine Design Platform TODO

## Database & Schema
- [x] Design database schema for projects, generations, orders
- [x] Add projects table (user session, description, sketch upload)
- [x] Add generations table (store generated images and 3D models)
- [x] Add orders table (payment status, contact info, design feedback)
- [x] Push database schema changes

## UI Design & Core Pages
- [x] Design elegant color palette with tech + art aesthetic
- [x] Create landing page with hero section and workflow explanation
- [x] Build project creation page (text input + sketch upload)
- [x] Build three-view generation display page (3 groups x 3 images)
- [x] Build 3D model preview page with viewer
- [x] Build order submission page (feedback + contact + payment)
- [x] Build history page (view past projects and downloads)

## API Integration
- [x] Integrate Stripe payment gateway
- [x] Set up Stripe checkout for $20 deposit
- [x] Integrate image generation API (Manus built-in)
- [x] Implement text-to-image generation
- [x] Implement image-to-image generation (sketch enhancement)
- [x] Generate 3 groups of three-view images (9 total)
- [x] Integrate 3D model generation API (Tripo AI)
- [x] Convert selected three-view images to 3D model## File Storage & Management
- [x] Set up S3 storage for generated images
- [x] Set up S3 storage for 3D model files
- [x] Implement file download functionalityches
- [ ] Implement download functionality for images
- [ ] Implement download functionality for 3D models

## Order & Notification System
- [x] Create order submission flow
- [x] Store user contact information (email/phone)
- [x] Store user modification feedback
- [ ] Send notification to designer when order is placed
- [x] Link order to generated assets (images + 3D model)

## History & Session Management
- [x] Implement anonymous session tracking
- [x] Store generation history per session
- [x] Build history viewing interface
- [x] Enable file downloads from history

## Testing & Validation
- [x] Write vitest tests for database operations
- [x] Write vitest tests for API integrations (Tripo)
- [ ] Write vitest tests for payment flow
- [ ] Test complete user workflow end-to-end
- [ ] Verify file storage and retrieval

## Deployment & Documentation
- [x] Create checkpoint for deployment
- [x] Write user guide for platform usage
- [x] Document API configuration requirements

## Bug Fixes
- [x] Add interactive 3D model viewer to Model3D page
- [x] Replace placeholder with real model-viewer component
- [x] Test 3D model display with GLB files

## Bug Fixes - Image Generation
- [x] Debug image generation failure (Manus API quota exhausted)
- [x] Integrate Replicate API as alternative (available if needed)
- [x] Restored to use Manus built-in API
- [ ] User needs to contact Manus support for quota/billing: https://help.manus.im

## Bug Fixes - 3D Model Texture Enhancement
- [x] Investigate why texture enhancement never executes
- [x] Fix field name check (pbr_model → model for initial generation)
- [x] Add detailed debug logging to /tmp/texture_debug.log
- [x] Verify API parameters match Tripo documentation
- [ ] Test texture enhancement once Tripo API 502 error is resolved
- [ ] Monitor /tmp/texture_debug.log for complete API response

## Bug Fixes - 403 Error on Generate Page
- [x] Investigate 403 error on /generate/450001 page
- [x] Fix API mutation authentication/permission issue (Tripo API key expired)
- [x] Request and validate new Tripo API key
- [x] Test fix and verify error is resolved
## Bug Fixes - Project 480003 Issues

- [ ] Fix four-view generation: left/right side views have reversed foot/head orientation in Group 1
- [ ] Fix image cropping: Group 3 has incomplete images with cropping issues
- [x] Attempt to enforce strict adherence to input sketch (enhanced Nano Banana prompt with stronger constraints)
- [ ] Nano Banana API still ignores constraints - need alternative solution (post-processing or different API)
- [ ] Fix 3D model generation failure for project 480003
- [x] Add detailed debug logging for Tripo API responses
- [ ] Investigate Tripo API response format (waiting for test generation to complete)

## Bug Fixes - API Returns HTML Instead of JSON (Project 480008)
- [x] Investigate "Unexpected token '<'" error on /generate/480008
- [x] Error occurs when four-view generation takes too long (timeout)
- [x] Fix server timeout handling to return JSON error instead of HTML
- [x] Add proper error handling for Nano Banana API timeouts (wrapped in try-catch)
- [ ] Test fix and verify API returns valid JSON even on timeout

## Bug Fixes - Project 480009 Issues
- [ ] Fix Group 2 four-view cropping issue (cropped into the image itself)
- [ ] Fix Group 3 generation issue (only clothes, missing face and body)
- [ ] Investigate why Nano Banana generates incomplete or incorrectly cropped images
- [ ] Fix 3D model generation failure (Tripo API succeeds but model download/transfer fails)
- [ ] Investigate model download from Tripo or upload to S3 failure
- [x] Confirmed: Tripo API consumes credits (generation succeeds) but transfer fails


## Summary - Root Cause of 3D Generation Failures

**Problem**: All 3D model generation attempts fail with "generation failed" error

**Evidence**:
1. Tripo API consumes credits (generation succeeds on their end)
2. waitForTaskCompletion returns status="success"
3. But result.output.model field is empty/null/undefined
4. Code throws: "No model URL in result.output"

**Potential Causes**:
1. Tripo API response format changed or inconsistent
2. Model file generation succeeds but CDN upload fails
3. API timeout before model URL becomes available
4. Multiview images not suitable for 3D generation

**Investigation Status**:
- Added detailed debug logging to capture full Tripo API response
- Waiting for test generation (project 480010) to complete
- Need to review complete Tripo API response format

**Recommended Fixes**:
1. Implement retry logic with exponential backoff (3 attempts)
2. Add fallback: if 3D fails, use placeholder or previous model
3. Contact Tripo support for API response format clarification
4. Consider alternative 3D generation API if Tripo proves unreliable


## Bug Fixes - Project 480011 Image Generation Failure
- [x] Investigate "Image generation failed for design variation 3" error
- [x] Root cause: E005 content moderation error from Nano Banana API
- [x] Fix: Changed Promise.all to Promise.allSettled for partial success
- [x] Now allows 1-2 groups to succeed even if others fail
- [x] Returns partial success with information about failed groups
- [ ] Test fix with new project to verify partial success works


## Bug Fixes - Project 480012 3D Generation Failed (Tripo API charged)
- [ ] Investigate 3D generation failure - Tripo API charged but model not received
- [ ] Check server logs for complete Tripo API response
- [ ] Fix model download/transfer issue
- [ ] Add retry mechanism for model download


## Bug Fixes - Project 480013 3D Generation Fixed ✅
- [x] Diagnosed root cause: Tripo API returns `pbr_model` instead of `model` when pbr=true
- [x] Old CDN image URLs return 403 (expired), but new images work correctly
- [x] Fixed routers.ts to use `pbr_model || model` for model URL extraction
- [x] Tested with project 480013 - 3D model generated successfully!
- [x] 3D model viewer displays correctly with interactive rotation
- [x] Download GLB button works
- [x] Order submission form displays correctly


## Major Refactoring - Tripo-Only Architecture (Project 540001 Feedback)

### Issues Identified
- [ ] Text editing after four-view generation causes cropping issues (cuts into character image)
- [ ] 3D model has front face on back of head (suspected left/right view reversal with Tripo)
- [ ] Tripo texture generation takes too long (base model is fast, texture is slow)

### Architecture Changes
- [x] Remove Nano Banana API completely - delete all related code
- [x] Use Tripo AI for ALL image-to-3D generation (maintain consistency)
- [x] Support multiple input types: text, single image, 1-4 multi-view images
- [x] Single image upload option: generate four-view first, then 3D model
- [ ] Add texture and style selection in 3D model preview (per Tripo options)
- [x] Do NOT use high-definition or ultra-clear precision/textures (speed priority)
- [x] Clean up all unrelated legacy code for clarity

### Research Tripo API
- [x] Study Tripo text-to-3D generation API
- [x] Study Tripo image-to-3D generation API
- [x] Study Tripo multi-view-to-3D generation API
- [x] Document available texture and style options
- [x] Understand left/right view orientation requirements (from CHARACTER's perspective, not viewer's)

### Frontend Refactoring
- [x] New upload interface supporting text/single-image/multi-view input
- [x] Option to generate four-view from single image before 3D
- [x] 3D model viewer with texture/style selection (basic implementation)
- [x] Model interaction: rotate, zoom, pan

### Backend Refactoring
- [x] Implement Tripo text-to-3D endpoint
- [x] Implement Tripo image-to-3D endpoint
- [x] Implement Tripo multi-view-to-3D endpoint
- [x] Remove Nano Banana integration code
- [x] Simplify database schema


### Testing Progress
- [x] Text-to-3D generation flow tested (project 570003 - pink bunny)
- [ ] Image-to-3D generation flow
- [ ] Multi-view-to-3D generation flow
- [ ] Regeneration feature
- [ ] Order submission with Stripe
- [ ] History page session tracking

### Bug Fixes Applied
- [x] Fixed Tripo API response parsing (result.pbr_model.url nested structure)
- [x] Fixed getModelUrlFromResult to handle both legacy and new API formats
- [x] Fixed routers.ts to pass full result object instead of just output


## New Features - User Feedback Round 2

### Bug Fixes
- [x] Fix 3D model display speed: Tripo API succeeds but UI doesn't show model
- [x] Fix UI layout: Two generation boxes overlapping on project page

### New Features
- [x] Single image: Removed four-view generation (user decision - simplified flow)
- [x] Add Tripo texture/style selection after 3D model generation
- [x] Add one-click texture/style transformation
- [x] Trial mode: Allow unregistered users to try, require registration to save
- [x] Keep order flow: contact info + modification feedback + deposit payment


### Updated Requirements (User Feedback)
- [x] Image upload: allow text description alongside image for better 3D generation
- [x] Remove four-view generation option (user decision - simplify flow)
