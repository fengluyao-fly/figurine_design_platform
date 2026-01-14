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
