export interface UserProfileImageUploadJob {
  userId: string;
  file: {
    fileBuffer: Buffer;
    fileName: string;
    mimeType: string;
  };
}