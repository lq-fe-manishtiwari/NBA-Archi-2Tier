// src/screens/pages/NEWNBA/Components/S3UploadHelper.jsx
import { nbaDashboardService } from "../Services/NBA-dashboard.service";

/**
 * Uploads a single file to S3 and returns the S3 info
 * @param {Object} fileObj - { file: File, description?: string }
 * @returns {Promise<{file: File, description: string, s3Url: string, filename: string}>}
 */
export async function uploadFileToS3(fileObj) {
  console.log("uploadFileToS3() INPUT:", fileObj);

  const { file, description } = fileObj;

  if (!file || !(file instanceof File)) {
    console.error("❌ uploadFileToS3 received INVALID file:", file);
    throw new Error("Invalid file");
  }

  const formData = new FormData();
  formData.append("file", file);

  const desc = (description || "").trim();
  if (desc) {
    formData.append("description", desc);
  }

  console.log("FormData content:", {
    fileName: file.name,
    fileType: file.type,
    description: desc
  });

  console.log("Calling nbaDashboardService.uploadFile()...");

  const res = await nbaDashboardService.uploadFile(formData);

  console.log("uploadFileToS3() RESPONSE:", res);

  return {
    file,
    description: desc,
    s3Url: res?.url || "",
    filename: res?.filename || file.name,
    uploading: false,
  };
}


