import { Queue } from 'bullmq';
import { bullMQConnection } from '../config/redis.config.js';
import logger from '../middleware/logger.js';

/**
 * Queue Service
 * Centralized service for managing multiple queues and jobs
 * Designed to support multiple workers and dynamic queue creation
 */

class QueueService {
    constructor() {
        this.queues = new Map(); // Store all registered queues
        this.defaultJobOptions = {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
            removeOnComplete: {
                age: 86400, // 24 hours
                count: 1000,
            },
            removeOnFail: {
                age: 604800, // 7 days
            },
        };
    }

    /**
     * Register a new queue
     * @param {string} queueName - Name of the queue
     * @param {Object} options - Queue configuration options
     * @returns {Queue} - BullMQ Queue instance
     */
    registerQueue(queueName, options = {}) {
        if (this.queues.has(queueName)) {
            logger.warn(`Queue '${queueName}' already registered`, { queueName });
            return this.queues.get(queueName);
        }

        const queueOptions = {
            connection: bullMQConnection,
            defaultJobOptions: {
                ...this.defaultJobOptions,
                ...options.defaultJobOptions,
            },
            ...options,
        };

        const queue = new Queue(queueName, queueOptions);
        
        // Set up event listeners for the queue
        this.setupQueueListeners(queue, queueName);
        
        this.queues.set(queueName, queue);
        logger.info(`Queue '${queueName}' registered successfully`, { queueName });
        
        return queue;
    }

    /**
     * Get a queue by name
     * @param {string} queueName - Name of the queue
     * @returns {Queue|null} - Queue instance or null if not found
     */
    getQueue(queueName) {
        return this.queues.get(queueName) || null;
    }

    /**
     * Add a job to a queue
     * @param {string} queueName - Name of the queue
     * @param {string} jobName - Name/type of the job
     * @param {Object} data - Job data
     * @param {Object} options - Job-specific options
     * @returns {Promise<Job>}
     */
    async addJob(queueName, jobName, data, options = {}) {
        try {
            let queue = this.getQueue(queueName);
            
            // Auto-register queue if it doesn't exist
            if (!queue) {
                logger.warn(`Queue '${queueName}' not registered, auto-registering`, { queueName });
                queue = this.registerQueue(queueName);
            }

            const jobOptions = {
                priority: options.priority || 10,
                delay: options.delay || 0,
                jobId: options.jobId || `${queueName}-${jobName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                ...options,
            };

            const job = await queue.add(jobName, data, jobOptions);

            logger.info('Job added to queue', { 
                queueName,
                jobName,
                jobId: job.id,
                priority: jobOptions.priority
            });

            return job;
        } catch (error) {
            logger.error('Failed to add job to queue', { 
                queueName,
                jobName,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    /**
     * Add multiple jobs to a queue in bulk
     * @param {string} queueName - Name of the queue
     * @param {Array<Object>} jobs - Array of job objects { name, data, options }
     * @returns {Promise<Array<Job>>}
     */
    async addBulkJobs(queueName, jobs) {
        try {
            let queue = this.getQueue(queueName);
            
            if (!queue) {
                logger.warn(`Queue '${queueName}' not registered, auto-registering`, { queueName });
                queue = this.registerQueue(queueName);
            }

            const bulkJobs = jobs.map(({ name, data, options = {} }) => ({
                name,
                data,
                opts: {
                    priority: options.priority || 10,
                    delay: options.delay || 0,
                    jobId: options.jobId || `${queueName}-${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    ...options,
                }
            }));

            const addedJobs = await queue.addBulk(bulkJobs);

            logger.info('Bulk jobs added to queue', { 
                queueName,
                count: addedJobs.length
            });

            return addedJobs;
        } catch (error) {
            logger.error('Failed to add bulk jobs to queue', { 
                queueName,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Remove a job from a queue
     * @param {string} queueName - Name of the queue
     * @param {string} jobId - Job ID to remove
     * @returns {Promise<void>}
     */
    async removeJob(queueName, jobId) {
        try {
            const queue = this.getQueue(queueName);
            
            if (!queue) {
                throw new Error(`Queue '${queueName}' not found`);
            }

            const job = await queue.getJob(jobId);
            
            if (!job) {
                logger.warn('Job not found for removal', { queueName, jobId });
                return;
            }

            await job.remove();

            logger.info('Job removed from queue', { 
                queueName,
                jobId
            });
        } catch (error) {
            logger.error('Failed to remove job from queue', { 
                queueName,
                jobId,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Remove multiple jobs from a queue
     * @param {string} queueName - Name of the queue
     * @param {Array<string>} jobIds - Array of job IDs to remove
     * @returns {Promise<Array<Object>>} - Results of removal operations
     */
    async removeBulkJobs(queueName, jobIds) {
        const results = await Promise.allSettled(
            jobIds.map(jobId => this.removeJob(queueName, jobId))
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        logger.info('Bulk job removal completed', { 
            queueName,
            total: jobIds.length,
            successful,
            failed
        });

        return results;
    }

    /**
     * Get job status by job ID
     * @param {string} queueName - Name of the queue
     * @param {string} jobId - Job ID
     * @returns {Promise<Object>}
     */
    async getJobStatus(queueName, jobId) {
        try {
            const queue = this.getQueue(queueName);
            
            if (!queue) {
                throw new Error(`Queue '${queueName}' not found`);
            }

            const job = await queue.getJob(jobId);
            
            if (!job) {
                return { 
                    queueName,
                    jobId,
                    status: 'not_found' 
                };
            }

            const state = await job.getState();
            const progress = job.progress;
            const result = job.returnvalue;
            const failedReason = job.failedReason;

            return {
                queueName,
                jobId: job.id,
                status: state,
                progress,
                result,
                failedReason,
                data: job.data,
                attemptsMade: job.attemptsMade,
                timestamp: job.timestamp,
                processedOn: job.processedOn,
                finishedOn: job.finishedOn,
            };
        } catch (error) {
            logger.error('Failed to get job status', { 
                queueName,
                jobId, 
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Get multiple job statuses
     * @param {string} queueName - Name of the queue
     * @param {Array<string>} jobIds - Array of job IDs
     * @returns {Promise<Array<Object>>}
     */
    async getJobStatuses(queueName, jobIds) {
        const statuses = await Promise.all(
            jobIds.map(jobId => this.getJobStatus(queueName, jobId).catch(error => ({
                queueName,
                jobId,
                status: 'error',
                error: error.message
            })))
        );

        return statuses;
    }

    /**
     * Retry a failed job
     * @param {string} queueName - Name of the queue
     * @param {string} jobId - Job ID to retry
     * @returns {Promise<void>}
     */
    async retryJob(queueName, jobId) {
        try {
            const queue = this.getQueue(queueName);
            
            if (!queue) {
                throw new Error(`Queue '${queueName}' not found`);
            }

            const job = await queue.getJob(jobId);
            
            if (!job) {
                throw new Error(`Job '${jobId}' not found in queue '${queueName}'`);
            }

            await job.retry();

            logger.info('Job retried', { 
                queueName,
                jobId
            });
        } catch (error) {
            logger.error('Failed to retry job', { 
                queueName,
                jobId,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Get queue statistics
     * @param {string} queueName - Name of the queue
     * @returns {Promise<Object>}
     */
    async getQueueStats(queueName) {
        try {
            const queue = this.getQueue(queueName);
            
            if (!queue) {
                throw new Error(`Queue '${queueName}' not found`);
            }

            const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
                queue.getWaitingCount(),
                queue.getActiveCount(),
                queue.getCompletedCount(),
                queue.getFailedCount(),
                queue.getDelayedCount(),
                queue.isPaused(),
            ]);

            return {
                queueName,
                waiting,
                active,
                completed,
                failed,
                delayed,
                paused,
                total: waiting + active + completed + failed + delayed,
            };
        } catch (error) {
            logger.error('Failed to get queue stats', { 
                queueName,
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Get statistics for all registered queues
     * @returns {Promise<Array<Object>>}
     */
    async getAllQueueStats() {
        const queueNames = Array.from(this.queues.keys());
        
        const stats = await Promise.all(
            queueNames.map(queueName => 
                this.getQueueStats(queueName).catch(error => ({
                    queueName,
                    error: error.message
                }))
            )
        );

        return stats;
    }

    /**
     * Pause a queue
     * @param {string} queueName - Name of the queue
     * @returns {Promise<void>}
     */
    async pauseQueue(queueName) {
        try {
            const queue = this.getQueue(queueName);
            
            if (!queue) {
                throw new Error(`Queue '${queueName}' not found`);
            }

            await queue.pause();
            logger.info('Queue paused', { queueName });
        } catch (error) {
            logger.error('Failed to pause queue', { 
                queueName,
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Resume a paused queue
     * @param {string} queueName - Name of the queue
     * @returns {Promise<void>}
     */
    async resumeQueue(queueName) {
        try {
            const queue = this.getQueue(queueName);
            
            if (!queue) {
                throw new Error(`Queue '${queueName}' not found`);
            }

            await queue.resume();
            logger.info('Queue resumed', { queueName });
        } catch (error) {
            logger.error('Failed to resume queue', { 
                queueName,
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Clean completed/failed jobs from a queue
     * @param {string} queueName - Name of the queue
     * @param {number} grace - Grace period in milliseconds
     * @param {string} status - Job status to clean ('completed' or 'failed')
     * @returns {Promise<Array<string>>}
     */
    async cleanQueue(queueName, grace = 0, status = 'completed') {
        try {
            const queue = this.getQueue(queueName);
            
            if (!queue) {
                throw new Error(`Queue '${queueName}' not found`);
            }

            const jobIds = await queue.clean(grace, 1000, status);
            
            logger.info('Queue cleaned', { 
                queueName,
                status,
                count: jobIds.length
            });

            return jobIds;
        } catch (error) {
            logger.error('Failed to clean queue', { 
                queueName,
                status,
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Drain a queue (remove all jobs)
     * @param {string} queueName - Name of the queue
     * @param {boolean} delayed - Whether to drain delayed jobs
     * @returns {Promise<void>}
     */
    async drainQueue(queueName, delayed = false) {
        try {
            const queue = this.getQueue(queueName);
            
            if (!queue) {
                throw new Error(`Queue '${queueName}' not found`);
            }

            await queue.drain(delayed);
            logger.info('Queue drained', { queueName, delayed });
        } catch (error) {
            logger.error('Failed to drain queue', { 
                queueName,
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Get jobs from a queue by status
     * @param {string} queueName - Name of the queue
     * @param {string} status - Job status ('waiting', 'active', 'completed', 'failed', 'delayed')
     * @param {number} start - Start index
     * @param {number} end - End index
     * @returns {Promise<Array<Job>>}
     */
    async getJobs(queueName, status = 'waiting', start = 0, end = 100) {
        try {
            const queue = this.getQueue(queueName);
            
            if (!queue) {
                throw new Error(`Queue '${queueName}' not found`);
            }

            const jobs = await queue.getJobs(status, start, end);
            
            return jobs;
        } catch (error) {
            logger.error('Failed to get jobs', { 
                queueName,
                status,
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Setup event listeners for a queue
     * @param {Queue} queue - Queue instance
     * @param {string} queueName - Name of the queue
     */
    setupQueueListeners(queue, queueName) {
        queue.on('error', (error) => {
            logger.error(`Queue '${queueName}': Error`, { 
                queueName,
                error: error.message 
            });
        });

        queue.on('waiting', ({ jobId }) => {
            logger.debug(`Queue '${queueName}': Job waiting`, { 
                queueName,
                jobId 
            });
        });

        queue.on('active', ({ jobId }) => {
            logger.info(`Queue '${queueName}': Job active`, { 
                queueName,
                jobId 
            });
        });

        queue.on('completed', ({ jobId, returnvalue }) => {
            logger.info(`Queue '${queueName}': Job completed`, { 
                queueName,
                jobId,
                hasResult: !!returnvalue
            });
        });

        queue.on('failed', ({ jobId, failedReason }) => {
            logger.error(`Queue '${queueName}': Job failed`, { 
                queueName,
                jobId,
                reason: failedReason
            });
        });

        queue.on('stalled', ({ jobId }) => {
            logger.warn(`Queue '${queueName}': Job stalled`, { 
                queueName,
                jobId 
            });
        });

        queue.on('progress', ({ jobId, data }) => {
            logger.debug(`Queue '${queueName}': Job progress`, { 
                queueName,
                jobId,
                progress: data
            });
        });
    }

    /**
     * Close a specific queue
     * @param {string} queueName - Name of the queue
     * @returns {Promise<void>}
     */
    async closeQueue(queueName) {
        try {
            const queue = this.getQueue(queueName);
            
            if (!queue) {
                logger.warn(`Queue '${queueName}' not found, cannot close`, { queueName });
                return;
            }

            await queue.close();
            this.queues.delete(queueName);
            
            logger.info('Queue closed', { queueName });
        } catch (error) {
            logger.error('Failed to close queue', { 
                queueName,
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Close all registered queues
     * @returns {Promise<void>}
     */
    async closeAllQueues() {
        const queueNames = Array.from(this.queues.keys());
        
        logger.info('Closing all queues', { count: queueNames.length });

        await Promise.all(
            queueNames.map(queueName => this.closeQueue(queueName))
        );

        logger.info('All queues closed');
    }

    /**
     * Get list of all registered queue names
     * @returns {Array<string>}
     */
    getRegisteredQueues() {
        return Array.from(this.queues.keys());
    }
}

// Export singleton instance
const queueService = new QueueService();

export default queueService;
