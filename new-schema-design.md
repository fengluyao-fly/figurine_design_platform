# New Simplified Schema Design

## Design Principles
1. Remove Nano Banana related fields
2. Support multiple input types: text, single image, multi-view images
3. Store Tripo task IDs for tracking
4. Simplify the flow: Input → 3D Model → Order

## New Projects Table

```sql
projects:
  id: int (PK)
  sessionId: varchar(128) - anonymous session tracking
  
  -- Input type and content
  inputType: enum('text', 'single_image', 'multi_view') - what user provided
  textPrompt: text - text description (for text input)
  
  -- Uploaded images (1-4 images)
  imageUrls: text (JSON array) - S3 URLs of uploaded images
  imageKeys: text (JSON array) - S3 keys of uploaded images
  
  -- Tripo task tracking
  tripoTaskId: varchar(128) - main generation task ID
  tripoTaskStatus: enum('pending', 'queued', 'running', 'success', 'failed')
  
  -- Generated 3D model
  modelUrl: varchar(512) - S3 URL of GLB file
  modelKey: varchar(512) - S3 key of GLB file
  
  -- Generation settings
  settings: text (JSON) - {texture: true, pbr: true, quality: 'standard'}
  
  -- Status
  status: enum('draft', 'generating', 'completed', 'ordered')
  
  createdAt, updatedAt: timestamp
```

## Simplified Flow

### User Journey:
1. **Input**: User provides text OR uploads 1-4 images
2. **Generate**: Click "Generate 3D Model"
3. **Preview**: View 3D model with rotation/zoom
4. **Order**: Fill contact info, pay deposit, submit

### API Endpoints:
1. `createProject` - Create project with input type and content
2. `uploadImage` - Upload image(s) to S3
3. `generate3DModel` - Start Tripo generation
4. `getProjectStatus` - Poll for completion
5. `createOrder` - Submit order with payment

## Changes from Current Schema

### Remove:
- `generations` table (no longer needed - no multi-group images)
- `groupNumber` field
- `isSelected` field
- Nano Banana related metadata

### Simplify:
- Merge image storage into projects table
- Single 3D model per project (no groups)
- Direct Tripo task tracking in projects

## Migration Strategy

1. Keep existing tables for backward compatibility
2. Add new fields to projects table
3. Deprecate generations table for new projects
4. Old projects continue to work with old flow
