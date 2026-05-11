import { createUploadthing } from "uploadthing/next";
import { UploadThingError, type FileRouter } from "uploadthing/server";
import { getApprovedAdmin } from "@/lib/admin-auth";

const f = createUploadthing();

export const ourFileRouter = {
  productImageUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 8,
    },
  })
    .middleware(async () => {
      const auth = await getApprovedAdmin();
      if (!auth?.user?.id) {
        throw new UploadThingError("Unauthorized");
      }

      return { uploadedBy: auth.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      const url = file.ufsUrl;
      console.log("Upload complete:", { url, key: file.key });
      return { url, key: file.key };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
