import queueService from '../services/queue.service.js';
import { resumeAnalysisQueue } from './resume-analysis.queue.js';

/**
 * Central export for all queues
 */

// Export queue service for centralized queue management
export { default as queueService } from '../services/queue.service.js';

// Export resume analysis queue functions
export {
    // Resume Analysis Queue
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
    closeQueue
} from './resume-analysis.queue.js';

// Queue registry
export const queues = {
    resumeAnalysis: resumeAnalysisQueue,
};

// Close all queues using the queue service
export async function closeAllQueues() {
    return queueService.closeAllQueues();
}

export default {
    queues,
    queueService,
    closeAllQueues,
};
