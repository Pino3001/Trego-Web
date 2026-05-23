
export type UploadState = "idle" | "uploading" | "done" | "error";

export interface ImageField {
  file: File | null;
  previewUrl: string | null;
  uploadState: UploadState;
  cloudUrl: string | null;
}