# Azure Blob Storage Upload Service

A comprehensive Azure Blob Storage integration service that provides secure, scalable file upload capabilities using pre-signed URLs for direct client-to-cloud uploads.

## 🎯 Overview

This service enables **direct client uploads** to Azure Blob Storage without consuming server bandwidth, providing better performance and scalability for file upload operations.

### Key Features
- ✅ **Pre-signed URL Generation** - Secure, time-limited upload URLs
- ✅ **File Validation** - Type, size, and security checks
- ✅ **Upload Verification** - Confirm successful uploads
- ✅ **Secure Access URLs** - Time-limited download URLs
- ✅ **File Management** - Delete and organize files
- ✅ **Organization Isolation** - Container-based file separation

## 📋 Prerequisites

### Environment Variables
```bash
AZURE_STORAGE_ACCOUNT_NAME=your_storage_account_name
AZURE_STORAGE_ACCOUNT_KEY=your_storage_account_key
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
```

### NPM Dependencies
```bash
npm install @azure/storage-blob
```

## 🚀 Quick Start

### 1. Import the Service
```javascript
import {
    generatePresignedUploadUrl,
    verifyUploadedFile,
    getFileAccessUrl,
    getContainerName,
    deleteFile
} from './services/Integration/uploadImage.js';
```

### 2. Generate Upload URL (Server-side)
```javascript
// API endpoint to generate upload URL
app.post('/api/upload/presigned-url', async (req, res) => {
    try {
        const { fileName, organizationId } = req.body;
        const containerName = getContainerName(organizationId);
        
        const uploadData = await generatePresignedUploadUrl(
            containerName,
            fileName,
            {
                expiryMinutes: 30,
                maxSizeInMB: 10,
                allowedExtensions: ['pdf', 'docx', 'jpg', 'png']
            }
        );
        
        res.json({
            success: true,
            data: uploadData
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
```

### 3. Upload File (Client-side)
```javascript
// Frontend JavaScript
async function uploadFile(file) {
    try {
        // 1. Get pre-signed URL from your API
        const response = await fetch('/api/upload/presigned-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fileName: file.name,
                organizationId: 123
            })
        });
        
        const { data: uploadData } = await response.json();
        
        // 2. Upload directly to Azure
        const uploadResponse = await fetch(uploadData.uploadUrl, {
            method: 'PUT',
            headers: {
                'x-ms-blob-type': 'BlockBlob',
                'Content-Type': file.type
            },
            body: file
        });
        
        if (uploadResponse.ok) {
            // 3. Verify upload with your API
            const verifyResponse = await fetch('/api/upload/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    containerName: uploadData.containerName,
                    fileName: uploadData.fileName
                })
            });
            
            const verification = await verifyResponse.json();
            console.log('Upload successful:', verification);
            return verification;
        }
    } catch (error) {
        console.error('Upload failed:', error);
    }
}
```

### 4. Verify Upload (Server-side)
```javascript
app.post('/api/upload/verify', async (req, res) => {
    try {
        const { containerName, fileName } = req.body;
        const verification = await verifyUploadedFile(containerName, fileName);
        res.json(verification);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
```

## 📚 API Reference

### `generatePresignedUploadUrl(containerName, fileName, options)`
Generates a secure, time-limited URL for direct client uploads.

**Parameters:**
- `containerName` (string) - Azure container name
- `fileName` (string) - Desired filename (will be sanitized)
- `options` (object) - Upload configuration

**Options:**
```javascript
{
    expiryMinutes: 60,           // URL expiry time (default: 60)
    maxSizeInMB: 8,              // Maximum file size (default: 8)
    allowedExtensions: ['pdf'],   // Allowed file types
    generateUniqueName: true     // Generate unique filename (default: true)
}
```

**Returns:**
```javascript
{
    uploadUrl: "https://...",     // Pre-signed upload URL
    fileUrl: "https://...",       // Final file URL
    fileName: "unique-file.pdf",  // Generated filename
    originalName: "file.pdf",     // Original filename
    containerName: "123-bucket",  // Container name
    expiresAt: "2025-11-12T...",  // Expiry timestamp
    maxSizeBytes: 8388608,        // Size limit in bytes
    allowedExtensions: ["pdf"],   // Allowed types
    uploadInstructions: {         // Client upload instructions
        method: "PUT",
        headers: { ... }
    }
}
```

### `verifyUploadedFile(containerName, fileName)`
Verifies if a file was successfully uploaded.

**Returns:**
```javascript
{
    success: true,
    fileName: "unique-file.pdf",
    size: 1024000,
    contentType: "application/pdf",
    lastModified: "2025-11-12T...",
    url: "https://..."
}
```

### `getFileAccessUrl(containerName, fileName, expiryMinutes)`
Generates a secure, time-limited URL for file access/download.

**Returns:** Secure download URL string

### `deleteFile(containerName, fileName)`
Deletes a file from Azure Blob Storage.

**Returns:** Boolean indicating success

### `getContainerName(organizationId)`
Generates a container name based on organization ID.

**Returns:** Container name string (e.g., "123-bucket")

## 🛡️ Security Features

### File Validation
- **File Type Checking** - Extensions and MIME types
- **Size Limits** - Configurable maximum file size
- **Filename Sanitization** - Prevents directory traversal

### Access Control
- **Time-Limited URLs** - Configurable expiry times
- **Organization Isolation** - Separate containers per organization
- **Read-Only Downloads** - Secure file access

### Default Security Settings
```javascript
{
    allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png', 'docx'],
    maxSizeInMB: 8,
    expiryMinutes: 60
}
```

## 🔧 Configuration Examples

### Resume Upload Configuration
```javascript
const resumeUploadConfig = {
    expiryMinutes: 30,
    maxSizeInMB: 10,
    allowedExtensions: ['pdf', 'docx'],
    generateUniqueName: true
};
```

### Image Upload Configuration
```javascript
const imageUploadConfig = {
    expiryMinutes: 15,
    maxSizeInMB: 5,
    allowedExtensions: ['jpg', 'jpeg', 'png'],
    generateUniqueName: true
};
```

### Document Upload Configuration
```javascript
const documentUploadConfig = {
    expiryMinutes: 60,
    maxSizeInMB: 25,
    allowedExtensions: ['pdf', 'docx', 'txt', 'md'],
    generateUniqueName: false
};
```

## 🏗️ Architecture Flow

```
┌─────────────┐    1. Request Upload URL    ┌─────────────┐
│   Client    │ ──────────────────────────→ │   Server    │
│ (Frontend)  │                             │ (Your API)  │
└─────────────┘                             └─────────────┘
       │                                           │
       │        2. Pre-signed URL                  │
       │ ←─────────────────────────────────────────│
       │                                           │
       │        3. Direct Upload                   │
       │ ──────────────────────────────────────────┼──→ ┌─────────────┐
       │                                           │    │   Azure     │
       │        4. Verify Upload                   │    │ Blob Storage│
       │ ──────────────────────────────────────────┤    └─────────────┘
       │                                           │
       │        5. Confirmation                    │
       │ ←─────────────────────────────────────────│
```

## 🚨 Error Handling

### Common Errors
```javascript
// File type not allowed
throw new Error("File type not allowed. Allowed types: pdf, docx, jpg, png");

// File size exceeded
throw new Error("File size exceeds 8MB limit.");

// File not found
throw new Error("File not found: filename.pdf");

// Azure configuration error
throw new Error("Azure Blob Storage environment variables are not set properly.");
```

### Best Practices
```javascript
try {
    const uploadData = await generatePresignedUploadUrl(container, fileName, options);
    // Handle success
} catch (error) {
    if (error.message.includes('File type not allowed')) {
        // Handle validation error
    } else if (error.message.includes('environment variables')) {
        // Handle configuration error
    } else {
        // Handle other errors
    }
}
```

## 📊 Performance Benefits

| Metric | Server Upload | Pre-signed URL |
|--------|---------------|----------------|
| **Server Bandwidth** | High usage | Zero usage |
| **Upload Speed** | Slower | Faster |
| **Scalability** | Limited | Unlimited |
| **Cost** | Higher | Lower |
| **Server Load** | High | Minimal |

## 🧪 Testing

### Test Upload Flow
```javascript
// Test pre-signed URL generation
const uploadData = await generatePresignedUploadUrl(
    'test-container',
    'test-file.pdf',
    { expiryMinutes: 5 }
);

console.log('Upload URL generated:', uploadData.uploadUrl);

// Simulate file upload (you would use actual file upload in real tests)
// ... upload logic ...

// Verify upload
const verification = await verifyUploadedFile(
    'test-container', 
    uploadData.fileName
);

console.log('Upload verified:', verification.success);
```

## 🔄 Migration from Server Upload

If migrating from server-side uploads:

1. **Replace upload endpoints** with pre-signed URL generation
2. **Update client code** to upload directly to Azure
3. **Add verification step** after client upload
4. **Update file access** to use secure URLs

## 📝 Changelog

### v2.0.0 (Current)
- ✅ Removed server-side upload methods
- ✅ Focused on pre-signed URL workflow
- ✅ Improved security and performance
- ✅ Cleaner, smaller codebase

### v1.0.0 (Legacy)
- Server-side upload methods
- Bulk upload functionality
- Mixed upload approaches

## 📄 License

This service is part of the Success-CV Backend project.

## 🤝 Contributing

When contributing:
1. Follow the existing code style
2. Add tests for new functionality
3. Update documentation
4. Ensure security best practices

---

**Built for scalable, secure file uploads with Azure Blob Storage** 🚀