import queueService from '../services/queue.service.js';
import logger from '../middleware/logger.js';

/**
 * Resume Analysis Queue
 * Handles asynchronous resume parsing and analysis jobs
 */

// Register the resume analysis queue
export const resumeAnalysisQueue = queueService.registerQueue('resume-analysis', {
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000, // Start with 2 seconds, then 4s, 8s
        },
        removeOnComplete: {
            age: 86400, // Keep completed jobs for 24 hours
            count: 1000, // Keep max 1000 completed jobs
        },
        removeOnFail: {
            age: 604800, // Keep failed jobs for 7 days
        },
    },
});

/**
 * Add a resume analysis job to the queue
 * @param {Object} data - Job data
 * @param {string} data.resumeId - Resume ID
 * @param {string} data.candidateId - Candidate ID
 * @param {string} data.organisationId - Organisation ID
 * @param {string} data.fileUrl - Resume file URL
 * @param {string} data.fileName - Original file name
 * @param {string} data.mimeType - File MIME type
 * @param {Object} options - Job options (optional)
 * @returns {Promise<Job>}
 */
export async function addResumeAnalysisJob(data, options = {}) {
    return queueService.addJob('resume-analysis', 'analyze-resume', data, {
        priority: options.priority || 10,
        jobId: options.jobId || `resume-${data.resumeId}-${Date.now()}`,
        ...options,
    });
}

/**
 * Remove a resume analysis job
 * @param {string} jobId - Job ID to remove
 * @returns {Promise<void>}
 */
export async function removeResumeAnalysisJob(jobId) {
    return queueService.removeJob('resume-analysis', jobId);
}

/**
 * Get job status by job ID
 * @param {string} jobId - Job ID
 * @returns {Promise<Object>}
 */
export async function getJobStatus(jobId) {
    return queueService.getJobStatus('resume-analysis', jobId);
}

/**
 * Get queue statistics
 * @returns {Promise<Object>}
 */
export async function getQueueStats() {
    return queueService.getQueueStats('resume-analysis');
}

/**
 * Remove a job from the queue
 * @param {string} jobId - Job ID
 * @returns {Promise<boolean>}
 */
export async function removeJob(jobId) {
    return queueService.removeJob('resume-analysis', jobId);
}

/**
 * Retry a failed job
 * @param {string} jobId - Job ID
 * @returns {Promise<boolean>}
 */
export async function retryJob(jobId) {
    return queueService.retryJob('resume-analysis', jobId);
}

/**
 * Clean old completed/failed jobs from the queue
 * @param {number} grace - Grace period in milliseconds (default: 24 hours)
 * @returns {Promise<Array>}
 */
export async function cleanQueue(grace = 86400000) {
    const [completedIds, failedIds] = await Promise.all([
        queueService.cleanQueue('resume-analysis', grace, 'completed'),
        queueService.cleanQueue('resume-analysis', grace * 7, 'failed'),
    ]);

    return [completedIds, failedIds];
}

/**
 * Pause the queue
 * @returns {Promise<void>}
 */
export async function pauseQueue() {
    return queueService.pauseQueue('resume-analysis');
}

/**
 * Resume the queue
 * @returns {Promise<void>}
 */
export async function resumeQueue() {
    return queueService.resumeQueue('resume-analysis');
}

/**
 * Close the queue connection
 * @returns {Promise<void>}
 */
export async function closeQueue() {
    return queueService.closeQueue('resume-analysis');
}

export default {
    resumeAnalysisQueue,
    addResumeAnalysisJob,
    removeResumeAnalysisJob,
    getJobStatus,
    getQueueStats,
    removeJob,
    retryJob,
    cleanQueue,
    pauseQueue,
    resumeQueue,
    closeQueue,
};

