import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from project root
dotenv.config({ path: join(__dirname, '../../.env') });

import { Worker } from 'bullmq';
import logger from '../../middleware/logger.js';

// Dynamic import to ensure env vars are loaded before redis config
const { bullMQConnection } = await import('../../config/redis.config.js');
const pubSubService = (await import('../../services/pubsub.service.js')).default;

// Debug: Log Redis configuration
logger.info('Worker starting with Redis config', {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    clusterMode: process.env.REDIS_CLUSTER_MODE,
    hasPassword: !!process.env.REDIS_PASSWORD,
    actualConnection: bullMQConnection
});

/**
 * Resume Analysis Worker
 * This file should be run on a separate server/process dedicated to processing jobs
 * 
 * To run: node queues/workers/resume-analysis.worker.js
 * Or set NODE_ENV=worker and start the server
 */

/**
 * Process resume analysis job
 * @param {Object} job - BullMQ job object
 * @returns {Promise<Object>} Analysis result
 */
async function processResumeAnalysis(job) {
    const { resumeId, candidateId, organisationId, fileUrl, fileName, mimeType } = job.data;

    try {
        logger.info('Processing resume analysis', { 
            jobId: job.id, 
            resumeId, 
            candidateId,
            fileName 
        });

        // Publish job started event
        await pubSubService.publishJobUpdate(job.id, {
            status: 'started',
            progress: 0,
            resumeId,
            candidateId,
            message: 'Resume analysis started'
        });

        // Update progress
        await job.updateProgress(10);
        await pubSubService.publishJobUpdate(job.id, {
            status: 'in_progress',
            progress: 10,
            stage: 'initializing',
            message: 'Initializing resume analysis'
        });

        // Step 1: Download/fetch the resume file (placeholder)
        logger.info('Fetching resume file', { resumeId, fileUrl });
        await job.updateProgress(20);
        await pubSubService.publishJobUpdate(job.id, {
            status: 'in_progress',
            progress: 20,
            stage: 'fetching',
            message: 'Fetching resume file'
        });
        
        // TODO: Implement file fetching from Azure Blob Storage or local storage
        // const fileBuffer = await fetchResumeFile(fileUrl);

        // Step 2: Parse the resume based on file type (placeholder)
        logger.info('Parsing resume', { resumeId, mimeType });
        await job.updateProgress(40);
        await pubSubService.publishJobUpdate(job.id, {
            status: 'in_progress',
            progress: 40,
            stage: 'parsing',
            message: 'Parsing resume content'
        });
        
        // TODO: Implement parsing logic
        // - PDF: Use pdf-parse or pdfjs-dist
        // - DOCX: Use mammoth or docx-parser
        // const parsedData = await parseResume(fileBuffer, mimeType);

        // Placeholder parsed data
        const parsedData = {
            text: 'Sample resume text content...',
            metadata: {
                fileName,
                mimeType,
                parsedAt: new Date().toISOString()
            }
        };

        // Step 3: Extract structured information (placeholder)
        logger.info('Extracting resume information', { resumeId });
        await job.updateProgress(60);
        await pubSubService.publishJobUpdate(job.id, {
            status: 'in_progress',
            progress: 60,
            stage: 'extracting',
            message: 'Extracting structured information'
        });
        
        // TODO: Implement extraction logic
        // - Extract name, email, phone
        // - Extract education
        // - Extract work experience
        // - Extract skills
        // - Extract certifications
        // const extractedInfo = await extractInformation(parsedData.text);

        // Placeholder extracted info
        const extractedInfo = {
            personalInfo: {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+1234567890',
            },
            education: [
                {
                    degree: 'Bachelor of Science',
                    field: 'Computer Science',
                    institution: 'University Name',
                    year: '2020'
                }
            ],
            experience: [
                {
                    title: 'Software Engineer',
                    company: 'Tech Company',
                    duration: '2020-2023',
                    description: 'Developed web applications...'
                }
            ],
            skills: ['JavaScript', 'Node.js', 'React', 'PostgreSQL'],
            certifications: []
        };

        // Step 4: Analyze and score resume (placeholder)
        logger.info('Analyzing resume quality', { resumeId });
        await job.updateProgress(80);
        await pubSubService.publishJobUpdate(job.id, {
            status: 'in_progress',
            progress: 80,
            stage: 'analyzing',
            message: 'Analyzing resume quality and scoring'
        });
        
        // TODO: Implement analysis logic
        // - Calculate ATS score
        // - Check for keywords
        // - Assess formatting
        // - Evaluate completeness
        // const analysis = await analyzeResume(extractedInfo, parsedData.text);

        // Placeholder analysis
        const analysis = {
            atsScore: 85,
            completeness: 90,
            keywordMatch: 75,
            suggestions: [
                'Add more quantifiable achievements',
                'Include relevant certifications',
                'Expand technical skills section'
            ],
            strengths: [
                'Clear work experience',
                'Relevant education',
                'Good skill set'
            ],
            weaknesses: [
                'Missing contact information',
                'Could add more detail to projects'
            ]
        };

        // Step 5: Store results (placeholder)
        logger.info('Storing analysis results', { resumeId });
        await job.updateProgress(90);
        await pubSubService.publishJobUpdate(job.id, {
            status: 'in_progress',
            progress: 90,
            stage: 'storing',
            message: 'Storing analysis results'
        });
        
        // TODO: Implement storage logic
        // - Save parsed data to database
        // - Save analysis results to database
        // - Cache results in Redis
        // - Update resume status
        // await saveResumeAnalysis(resumeId, { parsedData, extractedInfo, analysis });

        // Final result
        await job.updateProgress(100);

        const result = {
            resumeId,
            candidateId,
            organisationId,
            status: 'completed',
            parsedData,
            extractedInfo,
            analysis,
            completedAt: new Date().toISOString()
        };

        logger.info('Resume analysis completed', { 
            jobId: job.id, 
            resumeId,
            atsScore: analysis.atsScore 
        });

        // Publish job completed event
        await pubSubService.publishJobUpdate(job.id, {
            status: 'completed',
            progress: 100,
            message: 'Resume analysis completed successfully',
            result: {
                resumeId,
                atsScore: analysis.atsScore,
                completeness: analysis.completeness,
                keywordMatch: analysis.keywordMatch
            }
        });

        return result;

    } catch (error) {
        logger.error('Resume analysis failed', { 
            jobId: job.id, 
            resumeId, 
            error: error.message,
            stack: error.stack 
        });

        // Publish job failed event
        await pubSubService.publishJobUpdate(job.id, {
            status: 'failed',
            progress: job.progress || 0,
            message: 'Resume analysis failed',
            error: error.message
        });

        throw error;
    }
}

/**
 * Create and start the worker
 */
export function createResumeAnalysisWorker(concurrency = 5) {
    const worker = new Worker('resume-analysis', processResumeAnalysis, {
        connection: bullMQConnection,
        concurrency, // Number of jobs to process in parallel
        limiter: {
            max: 10, // Max 10 jobs
            duration: 1000, // per 1 second
        },
    });

    // Worker event listeners
    worker.on('completed', (job) => {
        logger.info('Worker: Job completed', { 
            jobId: job.id, 
            resumeId: job.data.resumeId 
        });
    });

    worker.on('failed', (job, error) => {
        logger.error('Worker: Job failed', { 
            jobId: job?.id, 
            resumeId: job?.data?.resumeId,
            error: error.message 
        });
    });

    worker.on('error', (error) => {
        logger.error('Worker: Error', { error: error.message });
    });

    worker.on('stalled', (jobId) => {
        logger.warn('Worker: Job stalled', { jobId });
    });

    worker.on('active', (job) => {
        logger.info('Worker: Job active', { 
            jobId: job.id, 
            resumeId: job.data.resumeId 
        });
    });

    logger.info('Resume analysis worker started', { 
        concurrency,
        queue: 'resume-analysis' 
    });

    return worker;
}

/**
 * Graceful shutdown
 */
export async function shutdownWorker(worker) {
    try {
        logger.info('Shutting down worker...');
        await worker.close();
        logger.info('Worker shut down gracefully');
    } catch (error) {
        logger.error('Error shutting down worker', { error: error.message });
        throw error;
    }
}

// If this file is run directly, start the worker
if (import.meta.url === `file://${process.argv[1]}`) {
    logger.info('Starting resume analysis worker process...');
    
    const worker = createResumeAnalysisWorker(
        parseInt(process.env.WORKER_CONCURRENCY || '5')
    );

    // Graceful shutdown on signals
    process.on('SIGTERM', async () => {
        logger.info('SIGTERM received, shutting down worker...');
        await shutdownWorker(worker);
        process.exit(0);
    });

    process.on('SIGINT', async () => {
        logger.info('SIGINT received, shutting down worker...');
        await shutdownWorker(worker);
        process.exit(0);
    });

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
        logger.error('Uncaught exception in worker', { error: error.message, stack: error.stack });
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled rejection in worker', { reason, promise });
        process.exit(1);
    });
}

export default {
    createResumeAnalysisWorker,
    shutdownWorker,
};
