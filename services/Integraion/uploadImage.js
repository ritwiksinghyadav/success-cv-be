import {
    BlobServiceClient,
    StorageSharedKeyCredential,
    generateBlobSASQueryParameters,
    ContainerSASPermissions,
} from "@azure/storage-blob";
import crypto from "crypto";
import path from "path";

// Environment variable checks for production safety
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!accountName || !accountKey || !connectionString) {
    throw new Error(
        "Azure Blob Storage environment variables are not set properly."
    );
}

// Initialize Azure Blob Storage client
const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey
);

/**
 * Sanitizes a filename to prevent directory traversal and other security issues
 * @param {string} filename - The original filename
 * @returns {string} - Sanitized filename
 */
function sanitizeFileName(filename) {
    // Remove any path components
    const sanitized = path.basename(filename);
    // Replace any potentially dangerous characters
    return sanitized.replace(/[^a-zA-Z0-9_.-]/g, "_");
}

/**
 * Generates a unique filename with timestamp and random string
 * @param {string} originalFilename - The original filename
 * @returns {string} - Unique filename
 */
function generateUniqueFilename(originalFilename) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString("hex");
    const ext = path.extname(originalFilename);
    const baseName = path.basename(originalFilename, ext);
    return `${baseName}-${timestamp}-${randomString}${ext}`;
}

/**
 * Validates file type against allowed extensions
 * @param {string} filename - The filename to validate
 * @param {Array<string>} allowedExtensions - List of allowed file extensions
 * @returns {boolean} - Whether the file type is allowed
 */
function validateFileType(
    filename,
    allowedExtensions = ["pdf", "jpg", "jpeg", "png", "docx"]
) {
    const ext = path.extname(filename).toLowerCase().substring(1);
    return allowedExtensions.includes(ext);
}

/**
 * Creates a container name based on organization ID
 * @param {number|string} organizationId - The organization ID
 * @returns {string} - Container name
 */
function getContainerName(organizationId) {
    return `${organizationId}-bucket`;
}

/**
 * Deletes a file from Azure Blob Storage
 * @param {string} containerName - The container name
 * @param {string} blobName - The blob name to delete
 * @returns {Promise<boolean>} - Whether deletion was successful
 */
async function deleteFile(containerName, blobName) {
    try {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.delete();
        return true;
    } catch (error) {
        console.error("Error deleting file:", error);
        return false;
    }
}

/**
 * Generates a secure, time-limited SAS URL for accessing a file
 * @param {string} containerName - The container name
 * @param {string} blobName - The blob name to access
 * @param {number} expiryMinutes - Minutes until the URL expires (default: 10)
 * @returns {Promise<string>} - The secure access URL
 */
async function getFileAccessUrl(containerName, blobName, expiryMinutes = 60) {
    try {
        if (!blobName) {
            throw new Error("Blob name is required");
        }

        // Check if the blob exists before generating URL
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blobClient = containerClient.getBlobClient(blobName);

        // Check if the blob exists
        const exists = await blobClient.exists();
        if (!exists) {
            console.error(
                `Blob not found: ${blobName} in container ${containerName}`
            );
            throw new Error(`File not found: ${blobName}`);
        }

        const expiresOn = new Date(
            new Date().valueOf() + expiryMinutes * 60 * 1000
        );

        const sasToken = generateBlobSASQueryParameters(
            {
                containerName,
                blobName,
                permissions: ContainerSASPermissions.parse("r"), // read-only
                expiresOn,
            },
            sharedKeyCredential
        ).toString();

        const readonlyUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
        return readonlyUrl;
    } catch (error) {
        console.error("Error generating file access URL:", error);
        throw error;
    }
}

/**
 * Generates a pre-signed URL for direct client upload to Azure Blob Storage
 * @param {string} containerName - The container name
 * @param {string} fileName - The desired filename (will be sanitized and made unique)
 * @param {object} options - Upload options
 * @returns {Promise<object>} - Pre-signed upload URL and metadata
 */
async function generatePresignedUploadUrl(containerName, fileName, options = {}) {
    const {
        expiryMinutes = 60,
        maxSizeInMB = 8,
        allowedExtensions = ["pdf", "jpg", "jpeg", "png", "docx"],
        generateUniqueName = true,
    } = options;

    try {
        // Validate and sanitize filename
        const safeFileName = sanitizeFileName(fileName);
        if (!validateFileType(safeFileName, allowedExtensions)) {
            throw new Error(
                `File type not allowed. Allowed types: ${allowedExtensions.join(", ")}`
            );
        }

        // Generate unique filename
        const blobName = generateUniqueName
            ? generateUniqueFilename(safeFileName)
            : `${Date.now()}-${safeFileName}`;

        // Ensure container exists
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const exists = await containerClient.exists();
        if (!exists) {
            await containerClient.create();
            console.info(`Created container: ${containerName}`);
        }

        // Set expiry time
        const expiresOn = new Date(
            new Date().valueOf() + expiryMinutes * 60 * 1000
        );

        // Generate SAS token with write permissions
        const sasToken = generateBlobSASQueryParameters(
            {
                containerName,
                blobName,
                permissions: ContainerSASPermissions.parse("w"), // write permission
                expiresOn,
            },
            sharedKeyCredential
        ).toString();

        // Construct the pre-signed upload URL
        const uploadUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;

        // Final file URL (after successful upload)
        const fileUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;

        console.info(
            `[PRESIGNED] Generated upload URL for: ${blobName} in ${containerName}, expires: ${expiresOn.toISOString()}`
        );

        return {
            uploadUrl,
            fileUrl,
            fileName: blobName,
            originalName: fileName,
            containerName,
            expiresAt: expiresOn.toISOString(),
            maxSizeBytes: maxSizeInMB * 1024 * 1024,
            allowedExtensions,
            uploadInstructions: {
                method: "PUT",
                headers: {
                    "x-ms-blob-type": "BlockBlob",
                    "Content-Type": "application/octet-stream", // Client should set proper content type
                },
                note: "Use PUT method to upload file directly to uploadUrl",
            }
        };
    } catch (error) {
        console.error("Error generating pre-signed upload URL:", error);
        throw error;
    }
}

/**
 * Verifies if a file was successfully uploaded using the pre-signed URL
 * @param {string} containerName - The container name
 * @param {string} blobName - The blob name to verify
 * @returns {Promise<object>} - Verification result with file metadata
 */
async function verifyUploadedFile(containerName, blobName) {
    try {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blobClient = containerClient.getBlobClient(blobName);

        // Check if the blob exists
        const exists = await blobClient.exists();
        if (!exists) {
            return {
                success: false,
                message: "File not found after upload",
            };
        }

        // Get blob properties
        const properties = await blobClient.getProperties();

        console.info(
            `[VERIFY] File verified: ${blobName} (${properties.contentLength} bytes) in ${containerName}`
        );

        return {
            success: true,
            fileName: blobName,
            size: properties.contentLength,
            contentType: properties.contentType,
            lastModified: properties.lastModified,
            url: `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`,
        };
    } catch (error) {
        console.error("Error verifying uploaded file:", error);
        throw error;
    }
}

export {
    getContainerName,
    deleteFile,
    sanitizeFileName,
    validateFileType,
    getFileAccessUrl,
    generatePresignedUploadUrl,
    verifyUploadedFile,
};
