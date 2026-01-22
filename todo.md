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


## Bug Fixes - User Feedback Round 3

- [x] Fix: After uploading image and clicking generate, should auto-start 3D generation (not require second click)
- [x] Fix: Project page has two generation boxes overlapping
- [x] Simplify flow: Create project → Auto-start 3D generation → Show result


## Bug Fixes - User Feedback Round 5

- [x] Fix: Still two dialog boxes during 3D generation ("Generating" and "Creating")
  - Verified: Project.tsx now uses single-column layout when isGenerating=true (lines 216-294)
  - Only ONE centered status card displays during generation
- [x] Fix: Text description not applied to 3D model when uploading single image with text
  - Tripo's image_to_model API does NOT support text prompts (only text_to_model does)
  - Added UI note: "For image-based generation, this description is saved for order reference and designer notes only"
  - Text description is saved in project.textPrompt for order/designer reference


## UI/UX Improvements - User Feedback Round 6

### Brand Update
- [x] Change brand name from "Figurine Studio" to "Maker Mart"
- [x] Update logo and brand colors throughout the site

### Navigation Updates
- [x] Add "Contact Us" button in header - links to contact page
- [x] Add "My Account" / "Sign Up" button in header
- [x] Logged-in users see "My Account" with access to saved models
- [x] Non-logged-in users see "Sign Up" / "Login" option

### New Feature: Upload Existing Model
- [x] Add "Upload Your Model" option on homepage
- [x] Support GLB, STL, and other 3D file formats
- [x] After upload, redirect to contact form submission page
- [x] Backend notification when user submits their own model
- [x] Create new project type: "user_uploaded" for existing models

### Simplify Image Upload Flow
- [x] Remove text description input for single image upload
- [x] Keep modification feedback only in 3D model preview page (after generation)
- [x] Clarify two paths: 1) AI-generated model, 2) User-uploaded model

### Contact Page
- [x] Create Contact Us page with company contact information
- [x] Include email, phone, and business address

## Bug Fixes & Features - User Feedback Round 7

### Homepage Upload Model Entry
- [x] Fix: "Already have a 3D model?" button not visible on homepage
  - Verified: Button is correctly displayed on homepage (element 7/8 in viewport)
- [x] Ensure the button is prominently displayed below feature highlights

### Backend Notification System
- [x] Add email notification when user uploads existing model
  - Added notifyModelUpload() in notification.ts
  - Called from uploadExistingModel endpoint
- [x] Add email notification when user submits order
  - Added notifyNewOrder() in notification.ts
  - Called from orders.create and uploadExistingModel endpoints
- [x] Configure notification to send to admin email
  - Added notifyPaymentReceived() for payment webhooks
  - All notifications logged to console (can be extended to email service)

### Database Storage Verification
- [x] Verify user registration data is saved correctly
  - users table has openId, name, email, loginMethod, role fields
- [x] Verify uploaded model data is stored in database
  - projects table stores modelUrl, modelKey, inputType (including user_uploaded)
- [x] Verify order information is properly linked to projects
  - orders table has projectId foreign key, contactEmail, contactPhone, modificationFeedback

## UI/UX Improvements - User Feedback Round 8

### Homepage Layout Redesign
- [x] Redesign "Already have a model" entry to be more prominent
  - Created two side-by-side cards: "No 3D Model?" vs "Have a 3D Model?"
- [x] Create comparison layout: "Have a model? Upload" vs "No model? Create"
  - Both options now displayed as equal-weight cards with clear visual distinction
- [x] Place both options together for clear user choice
  - Grid layout with md:grid-cols-2 for side-by-side comparison
- [x] Remove the left-side button, integrate into main card area
  - Upload option now in dedicated card with checkmarks for features

### Portfolio/Case Studies Section
- [x] Add showcase section with figurine examples
  - Added anime-figurine.webp, collectible-figurine.jpg, custom-figurine.jpg
- [x] Add industrial product examples (simple designs)
  - Added industrial-product.webp
- [x] Display on homepage below the main creation area
  - "Our Work" section with 4 showcase cards

## Navigation & About Us - User Feedback Round 9

### Navigation Bar Update
- [x] Update navigation to 4 items: About Us, Make Your Product, Contact Us, My Account/Sign Up
- [x] Apply consistent navigation across all pages
  - Updated: Home, About, Contact, Project, History, UploadModel, OrderSuccess

### About Us Page
- [x] Create About Us page with company introduction
- [x] Include AI-in-manufacture company description
- [x] Explain value proposition for small batch production (100-20,000 units)
  - Visual comparison: <100 (3D print), 100-20K (Maker Mart sweet spot), >20K (direct factory)
- [x] Highlight Maker Mart's role in bridging design and manufacturing

## Promotion Phase Adjustments - User Feedback Round 10

### Save Model Requires Login
- [x] Verify save model requires user registration/login
  - Server: throws LOGIN_REQUIRED error if not authenticated
  - Client: redirects to login page and stores pending project ID
- [x] Ensure proper redirect to login when saving without account
- [x] Support email, Google, phone authentication methods (via OAuth)

### Remove Payment Flow (Promotion Phase)
- [x] Remove Stripe payment requirement for order submission
  - orders.create now sets paymentStatus to "paid" directly
- [x] Change "Pay & Submit" to "Submit Order (Free)" with promotion banner
- [x] Send order notification email to admin: 1125019809@qq.com
- [x] Include all order details in email (project info, contact, model URL)

### Email Notification Setup
- [x] Configure email service for sending notifications
  - Using Resend API with RESEND_API_KEY
- [x] Send email when user submits order (AI-generated model)
- [x] Send email when user uploads existing model
- [x] Include project details, contact info, and model download link
  - HTML email with styled sections for order details, contact, feedback

### Domain Preparation
- [x] Update website configuration for makermart.art domain
  - notification.ts uses makermart.art as site URL
- [ ] Purchase domain and publish website (user action required)


## Contact Page & Email Update - User Feedback Round 11

### Notification Email Update
- [x] Change admin notification email from 1125019809@qq.com to fengluyao1@hotmail.com

### Contact Page Simplification
- [x] Remove Office address section
- [x] Remove Business Hours section
- [x] Keep Email only (fengluyao1@hotmail.com)
- [x] Add WhatsApp placeholder (Coming soon)
- [x] Add WeChat placeholder (Coming soon)
- [x] Remove Phone section for now


## Contact Info Update - User Feedback Round 12

- [x] Update email to makermartart@gmail.com
- [x] Add phone number: +86 137 0190 2181
- [x] Add WhatsApp: +86 137 0190 2181 (with direct chat link)
- [x] Add WeChat: +86 137 0190 2181
