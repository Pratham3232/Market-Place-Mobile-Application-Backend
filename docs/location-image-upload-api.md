# Image Upload API with RabbitMQ Queue Processing

## Overview
This API provides queue-based image upload functionality for both user profile images and location provider images using RabbitMQ for efficient background processing.

## Architecture
1. **API Endpoints**: Receive file uploads and queue them for processing
2. **Storage Service**: Processes queued jobs, uploads files to Azure storage, and updates database
3. **RabbitMQ**: Handles message queues between services for scalable processing

## User Profile Image Upload

### Upload Profile Image
**POST** `/storage/upload`

**Request Format**: `multipart/form-data`

**Parameters**:
- `file` (required): Image file (max 20MB)
- `user_id` (required): User ID as string

**Example Request**:
```bash
curl -X POST http://localhost:3002/storage/upload \
  -F "file=@profile.jpg" \
  -F "user_id=123"
```

**Response**:
```json
{
  "success": true,
  "message": "Profile image queued for upload and processing"
}
```

### Get User Profile Image
**GET** `/storage/user/:userId/profile-image`

**Response**:
```json
{
  "success": true,
  "data": {
    "userId": 123,
    "name": "John Doe",
    "profileImage": "https://storage.azure.com/profile-images/user/123/profile.jpg"
  }
}
```

## Location Provider Images

### Upload Multiple Location Images
**POST** `/location/:id/images`

**Request Format**: `multipart/form-data`

**Parameters**:
- `files` (required): Array of image files (max 10 files, 20MB each)
- `imageTypes` (required): JSON array with classification for each file

**Example Request**:
```bash
curl -X POST http://localhost:3001/location/1/images \
  -F "files=@indoor1.jpg" \
  -F "files=@outdoor1.jpg" \
  -F 'imageTypes=[{"indoorOutdoorType":"INDOOR"},{"indoorOutdoorType":"OUTDOOR"}]'
```

**Response**:
```json
{
  "success": true,
  "message": "Queued 2 images for upload and processing",
  "queuedCount": 2
}
```

### Get Location Images
**GET** `/location/:id/images`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "locationProviderId": 1,
      "bucket": "location-images",
      "url": "https://storage.azure.com/...",
      "indoorOutdoorType": "INDOOR",
      "createdAt": "2025-09-21T02:33:53.000Z",
      "updatedAt": "2025-09-21T02:33:53.000Z"
    }
  ],
  "count": 1
}
```

## Queue Processing
- All images are uploaded asynchronously via RabbitMQ queues
- The storage service handles actual file uploads to Azure
- Database entries are created/updated after successful upload
- Failed uploads are logged but don't block the API response
- Profile images update the User.profileImage field
- Location images create new LocationImage records

## Classification Types (Location Images)
- `INDOOR`: Images taken inside the location
- `OUTDOOR`: Images taken outside the location

## Queue Names
- `user_profile_image_upload`: For user profile images
- `location_image_upload`: For location provider images