/**
 * File Content Extraction Utility
 * Extracts text content from uploaded files using external parser API
 */

/**
 * Extract text content from file URL using external parser
 * @param {string} fileUrl - URL to the file
 * @returns {Promise<string>} Extracted text content
 */
export async function extractFileContent(fileUrl) {
    try {
        const { FormData, File } = await import('formdata-node');
        const fetch = (await import('node-fetch')).default;
        
        console.log('[FILE_EXTRACTION] Starting file download from:', fileUrl);
        
        // Download the file first
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to download file: ${response.status}`);
        }

        console.log('[FILE_EXTRACTION] File download response status:', response.status);
        
        const fileArrayBuffer = await response.arrayBuffer();
        const fileBuffer = Buffer.from(fileArrayBuffer);
        
        // Get content type and determine file extension
        const contentType = response.headers.get('content-type') || 'application/pdf';
        const extension = contentType.includes('pdf') ? '.pdf' : 
                         contentType.includes('word') ? '.docx' : 
                         contentType.includes('document') ? '.docx' : '.txt';
        const filename = `resume${extension}`;
        
        console.log('[FILE_EXTRACTION] File details:', { 
            contentType, 
            extension, 
            filename,
            sizeBytes: fileBuffer.length 
        });
        
        // Create form data for parser API using formdata-node File class
        const formData = new FormData();
        // Use File class from formdata-node which properly handles filename and content type
        const file = new File([fileBuffer], filename, { type: contentType });
        formData.append('files', file);
        formData.append('strategy', 'fast'); // Use fast strategy for text extraction
        
        const parserUrl = process.env.RESUME_PARSER_URL;
        if (!parserUrl) {
            throw new Error('RESUME_PARSER_URL environment variable not set');
        }
        
        console.log('[FILE_EXTRACTION] Calling parser API:', parserUrl);
        
        // Call external parser API
        const parserResponse = await fetch(parserUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                ...(process.env.UNSTRUCTURED_API_KEY && { 
                    'unstructured-api-key': process.env.UNSTRUCTURED_API_KEY 
                })
            }
        });
        
        console.log('[FILE_EXTRACTION] Parser API response status:', parserResponse.status);
        
        if (!parserResponse.ok) {
            const errorText = await parserResponse.text();
            console.error('[FILE_EXTRACTION] Parser API error:', errorText);
            throw new Error(`Parser API failed: ${parserResponse.status} - ${errorText}`);
        }
       
        const result = await parserResponse.json();
        console.log('[FILE_EXTRACTION] Parser API returned', result.length, 'elements');
        
        // Extract text content from parser response
        const textContent = result.map(element => element.text).join('\n');
        
        if (!textContent || textContent.trim().length === 0) {
            throw new Error('Extracted content is empty');
        }
        
        console.log('[FILE_EXTRACTION] ✅ Successfully extracted', textContent.length, 'characters');
        
        return textContent;
        
    } catch (error) {
        console.error('[FILE_EXTRACTION] ❌ Extraction failed:', error.message);
        throw new Error(`File content extraction failed: ${error.message}`);
    }
}
