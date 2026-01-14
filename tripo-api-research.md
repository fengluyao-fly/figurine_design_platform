# Tripo API Research

## Endpoint
POST https://api.tripo3d.ai/v2/openapi/task

## Generation Types

### 1. Image to Model (`image_to_model`)
- **Input**: Single image via `file_token`, `url`, or `object`
- **Resolution**: 20x20 to 6000x6000px (suggested >256x256)
- **Options**:
  - `model_version`: v2.5-20250123 (default), v3.0-20250812, Turbo-v1.0-20250506
  - `texture`: boolean (default true)
  - `pbr`: boolean (default true) - if true, texture is ignored
  - `face_limit`: 1000-20000 (adaptive if not set)
  - `texture_quality`: standard (default), detailed
  - `geometry_quality`: standard (default), detailed (v3.0+ only)
  - `auto_size`: boolean (default false) - scale to real-world dimensions

### 2. Text to Image (`text_to_image`)
- **Input**: Text prompt (max 1024 chars)
- **Options**:
  - `negative_prompt`: What to avoid
  - `image_seed`: Random seed for reproducibility
  - `model_version`: default, v2.0-20240612

### 3. Advanced Generate Image (`advanced_generate_image`)
- **Input**: Text prompt + optional reference image
- **Options**:
  - `prompt`: Text description
  - `file`: Reference image (optional)
  - `negative_prompt`: What to avoid
  - `image_seed`: Random seed

### 4. Text to Model (`text_to_model`)
- **Input**: Text prompt
- **Options**:
  - Same as image_to_model (texture, pbr, face_limit, etc.)
  - `pose`: Specify pose for character models

### 5. Multiview to Model (`multiview_to_model`)
- **Input**: Multiple images (front, back, left, right views)
- **Options**:
  - `files`: Array of images with `type` indicating view position
  - View types: `front`, `back`, `left`, `right`
  - Same generation options as image_to_model

## Texture API (Separate Endpoint)
- Used to enhance/change texture on existing model
- `type`: `refine_model` or similar

## Key Findings for Our Platform

### Input Options to Support:
1. **Text only** → text_to_model
2. **Single image** → image_to_model
3. **Single image + generate views** → advanced_generate_image → multiview_to_model
4. **Multiple images (1-4)** → multiview_to_model

### Recommended Settings (Speed Priority):
- `texture_quality`: standard (NOT detailed)
- `geometry_quality`: standard (NOT detailed)
- `pbr`: true (for better visual quality)
- `model_version`: v2.5-20250123 or Turbo-v1.0-20250506 for speed

### View Orientation (Important!):
- Need to verify left/right orientation matches Tripo's expectations
- May need to swap left/right labels when sending to API

## Next Steps:
1. Check multiview_to_model documentation for exact view requirements
2. Understand the "refine_model" texture options
3. Design simplified UI flow


## Multiview to Model - Detailed Documentation

### Request Parameters:
- `type`: Must be `multiview_to_model`
- `model_version`: v3.0-20250812, v2.5-20250123 (default), v2.0-20240919, v1.4-20240625 (deprecated)

### Files Input:
- `files`: Array of exactly 4 items in order: **[front, left, back, right]**
- **IMPORTANT**: Front input cannot be omitted, but you may omit certain input files by omitting the `file_token`
- Do not use less than 2 images to generate
- Resolution: 20x20 to 6000x6000px (suggested >256x256)

### File Object Structure:
```json
{
  "type": "jpg",  // or "png"
  "file_token": "xxx"  // from upload API, or use "url" instead
}
```

### View Order: [front, left, back, right]
- Index 0: Front view (REQUIRED)
- Index 1: Left view (optional)
- Index 2: Back view (optional)
- Index 3: Right view (optional)

### Other Options (same as image_to_model):
- `face_limit`: 1000-20000
- `texture`: boolean (default true)
- `pbr`: boolean (default true)
- `texture_seed`: integer
- `texture_alignment`: original_image (default), geometry
- `texture_quality`: standard (default), detailed
- `auto_size`: boolean (default false)
- `orientation`: default, align_image
- `quad`: boolean (default false)
- `smart_low_poly`: boolean (default false)
- `geometry_quality`: standard (default), detailed (v3.0+ only)

### Key Finding - View Orientation Issue:
The order is **[front, left, back, right]** - this might explain the "front face on back of head" issue!
If we were sending views in wrong order, the model would be generated incorrectly.

Need to verify our current code sends views in correct order.


## Texture Model API (`texture_model`)

### Purpose:
Apply or change texture on an existing model (generated from text_to_model, image_to_model, multiview_to_model, or previous texture_model)

### Request Parameters:
- `type`: `texture_model`
- `original_model_task_id`: Task ID of previous model generation
- `texture_prompt` (optional if model was generated via Tripo API):
  - `text`: Text prompt for texture
  - `style_image`: Reference image for artistic style
  - `image`: Prompt image for texture (required if original task wasn't from Tripo)
- `texture`: boolean (default true)
- `pbr`: boolean (default true)
- `texture_seed`: integer for reproducibility
- `texture_alignment`: original_image (default), geometry
- `texture_quality`: standard (default), detailed
  - `detailed` with texture=false, pbr=false → upscale to 4K (v3.0+ only)
  - `detailed` with texture=false, pbr=true → generate PBR with current texture
  - `detailed` with texture=true, pbr=false → regenerate HD texture without PBR
  - `detailed` with texture=true, pbr=true → regenerate HD texture with PBR
- `model_version`: v2.5-20250123 (default), v3.0-20250812

### Key Insight:
The texture_model API is for POST-PROCESSING an existing model. It's NOT needed for initial generation since image_to_model and multiview_to_model already support texture options.

### Recommended Approach for Our Platform:
1. Use `image_to_model` or `multiview_to_model` with `texture=true, pbr=true, texture_quality=standard`
2. Only use `texture_model` if user wants to CHANGE texture after initial generation
3. This simplifies the flow and reduces API calls

## Style Options for Users:
Based on the API, we can offer:
1. **Texture Quality**: Standard (fast) vs Detailed (slow, higher quality)
2. **PBR**: Enable/disable physically-based rendering
3. **Texture Alignment**: Original image vs Geometry
4. **Style Image**: Optional reference for artistic style (in texture_model)

## Simplified Platform Design

### Input Options:
1. **Text Description** → `text_to_model`
2. **Single Image** → `image_to_model`
3. **Multiple Images (1-4)** → `multiview_to_model` (with front required)

### Generation Settings (User-Facing):
- Model Quality: Standard (default, fast) / High (detailed, slow)
- Texture: On (default) / Off (base mesh only)
- Auto-size: On / Off (scale to real-world dimensions)

### Post-Generation Options:
- Change Texture (via `texture_model`)
- Download GLB
- Submit Order


## Confirmed: Multiview Image Order

Based on the official Tripo API documentation:

**The `files` array must contain exactly 4 items in the order: [front, left, back, right]**

This is a **linear array**, NOT a grid layout. The API expects:
- Index 0: Front view (REQUIRED, cannot be omitted)
- Index 1: Left view (can be omitted by not providing file_token)
- Index 2: Back view (can be omitted)
- Index 3: Right view (can be omitted)

### Important Notes:
1. The front input CANNOT be omitted
2. You can omit other views by not providing the file_token
3. Do not use less than 2 images to generate
4. Resolution: 20x20 to 6000x6000px (suggested >256x256)

### Regarding "Left" and "Right":
- **Left view**: The character's LEFT side (viewer sees the right side of the character when looking at it)
- **Right view**: The character's RIGHT side (viewer sees the left side of the character when looking at it)

This is from the CHARACTER'S perspective, not the viewer's perspective!

### Potential Issue with Current Implementation:
If our current code labels views from the VIEWER's perspective instead of the CHARACTER's perspective, the left and right views would be swapped, causing the "front face on back of head" issue.

### Fix Required:
Verify that when we generate four views, we label them correctly:
- "Left View" should show the character's LEFT side (their left arm visible)
- "Right View" should show the character's RIGHT side (their right arm visible)

## Tripo Text Editing for 3D Models

After reviewing the Tripo API documentation, there is NO direct "text edit 3D model" feature.

Available options for modifying a 3D model:
1. **texture_model**: Change/enhance texture using text prompt or style image
2. **refine_model**: Improve model quality
3. **Mesh Editing**: Manual mesh operations (not text-based)

**Conclusion**: Tripo does NOT support text-based editing of 3D model geometry. 
The only text-based modification is for TEXTURE, not shape/geometry.

### Recommendation for Our Platform:
Since Tripo doesn't support text editing of 3D models:
1. Remove "Edit with Text" feature for 3D models
2. Allow users to regenerate with different input if unsatisfied
3. Keep the feedback field for human designers to manually adjust
