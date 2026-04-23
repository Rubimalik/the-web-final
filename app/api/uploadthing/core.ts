import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  productImageUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 8,
    },
  })
    .middleware(async ({ req }) => {
      return { uploadedBy: "admin" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const url = file.ufsUrl;
      console.log("Upload complete:", { url, key: file.key });
      return { url, key: file.key };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;