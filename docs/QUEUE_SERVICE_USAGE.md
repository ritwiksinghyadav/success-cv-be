# Queue Service Usage Guide

The Queue Service provides a centralized, scalable way to manage multiple BullMQ queues and jobs in the application. It's designed to support multiple workers and dynamic queue creation.

## Table of Contents
- [Core Concepts](#core-concepts)
- [Basic Usage](#basic-usage)
- [Queue Management](#queue-management)
- [Job Management](#job-management)
- [Multiple Queues Example](#multiple-queues-example)
- [Worker Setup](#worker-setup)

## Core Concepts

### Singleton Pattern
The queue service is a singleton, ensuring a single instance manages all queues across the application.

```javascript
import queueService from '../services/queue.service.js';
```

### Auto-Registration
Queues can be auto-registered when adding jobs if they don't exist yet, making it easy to add new queues dynamically.

### Multiple Workers Support
The service is designed to work with multiple worker processes on different servers, all connecting to the same Redis instance.

## Basic Usage

### 1. Register a Queue

```javascript
import queueService from '../services/queue.service.js';

// Register a new queue with custom options
const emailQueue = queueService.registerQueue('email-notifications', {
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: 'exponential',
            delay: 3000,
        },
        removeOnComplete: {
            age: 3600, // 1 hour
            count: 500,
        },
        removeOnFail: {
            age: 86400, // 24 hours
        },
    },
});
```

### 2. Add a Job to a Queue

```javascript
// Add a single job
const job = await queueService.addJob(
    'email-notifications',  // Queue name
    'send-welcome-email',   // Job type/name
    {                       // Job data
        userId: '12345',
        email: 'user@example.com',
        template: 'welcome'
    },
    {                       // Job options (optional)
        priority: 1,        // Higher priority (lower number = higher priority)
        delay: 5000,        // Delay 5 seconds before processing
    }
);

console.log(`Job added: ${job.id}`);
```

### 3. Add Multiple Jobs in Bulk

```javascript
const jobs = await queueService.addBulkJobs('email-notifications', [
    {
        name: 'send-welcome-email',
        data: { userId: '1', email: 'user1@example.com' },
        options: { priority: 1 }
    },
    {
        name: 'send-notification-email',
        data: { userId: '2', email: 'user2@example.com' },
        options: { priority: 5 }
    },
    {
        name: 'send-reminder-email',
        data: { userId: '3', email: 'user3@example.com' },
        options: { delay: 60000 } // Send in 1 minute
    }
]);

console.log(`${jobs.length} jobs added`);
```

### 4. Remove a Job

```javascript
// Remove a single job
await queueService.removeJob('email-notifications', jobId);

// Remove multiple jobs
const results = await queueService.removeBulkJobs('email-notifications', [
    'job-id-1',
    'job-id-2',
    'job-id-3'
]);
```

### 5. Check Job Status

```javascript
// Get single job status
const status = await queueService.getJobStatus('email-notifications', jobId);

console.log(status);
// Output:
// {
//   queueName: 'email-notifications',
//   jobId: 'job-123',
//   status: 'completed', // or 'waiting', 'active', 'failed', 'delayed'
//   progress: 100,
//   result: { success: true, emailSent: true },
//   data: { userId: '12345', ... },
//   attemptsMade: 1,
//   processedOn: 1699267200000,
//   finishedOn: 1699267205000
// }

// Get multiple job statuses
const statuses = await queueService.getJobStatuses('email-notifications', [
    'job-id-1',
    'job-id-2',
    'job-id-3'
]);
```

## Queue Management

### Get Queue Statistics

```javascript
// Get stats for a single queue
const stats = await queueService.getQueueStats('email-notifications');

console.log(stats);
// Output:
// {
//   queueName: 'email-notifications',
//   waiting: 5,
//   active: 2,
//   completed: 150,
//   failed: 3,
//   delayed: 10,
//   paused: false,
//   total: 170
// }

// Get stats for all queues
const allStats = await queueService.getAllQueueStats();
```

### Pause/Resume Queue

```javascript
// Pause processing
await queueService.pauseQueue('email-notifications');

// Resume processing
await queueService.resumeQueue('email-notifications');
```

### Clean Old Jobs

```javascript
// Clean completed jobs older than 1 hour
const completedJobIds = await queueService.cleanQueue(
    'email-notifications',
    3600000, // 1 hour in milliseconds
    'completed'
);

// Clean failed jobs older than 24 hours
const failedJobIds = await queueService.cleanQueue(
    'email-notifications',
    86400000, // 24 hours
    'failed'
);
```

### Drain Queue (Remove All Jobs)

```javascript
// Remove all waiting jobs
await queueService.drainQueue('email-notifications', false);

// Remove all jobs including delayed
await queueService.drainQueue('email-notifications', true);
```

### Get Jobs by Status

```javascript
// Get waiting jobs (first 100)
const waitingJobs = await queueService.getJobs('email-notifications', 'waiting', 0, 100);

// Get failed jobs
const failedJobs = await queueService.getJobs('email-notifications', 'failed', 0, 50);

// Get active jobs
const activeJobs = await queueService.getJobs('email-notifications', 'active', 0, 10);
```

### Retry Failed Job

```javascript
await queueService.retryJob('email-notifications', jobId);
```

## Job Management

### Get All Registered Queues

```javascript
const queueNames = queueService.getRegisteredQueues();
console.log(queueNames); // ['email-notifications', 'resume-analysis', 'data-export']
```

### Close Specific Queue

```javascript
await queueService.closeQueue('email-notifications');
```

### Close All Queues

```javascript
// Usually called on server shutdown
await queueService.closeAllQueues();
```

## Multiple Queues Example

Here's a complete example showing how to work with multiple queues:

```javascript
import queueService from '../services/queue.service.js';

// Register multiple queues
const emailQueue = queueService.registerQueue('email-notifications');
const resumeQueue = queueService.registerQueue('resume-analysis');
const reportQueue = queueService.registerQueue('report-generation', {
    defaultJobOptions: {
        attempts: 2,
        priority: 1, // Higher priority than default
    }
});

// Add jobs to different queues
async function processUserSignup(userId, email) {
    try {
        // Add welcome email job
        await queueService.addJob('email-notifications', 'send-welcome', {
            userId,
            email,
            template: 'welcome'
        }, { priority: 1 });

        // Add analytics job
        await queueService.addJob('analytics', 'track-signup', {
            userId,
            event: 'user_signup'
        });

        // Add delayed follow-up email (24 hours later)
        await queueService.addJob('email-notifications', 'send-followup', {
            userId,
            email,
            template: 'day-1-followup'
        }, { 
            delay: 86400000, // 24 hours
            priority: 5 
        });

    } catch (error) {
        console.error('Failed to process signup:', error);
    }
}

// Monitor all queues
async function monitorQueues() {
    const allStats = await queueService.getAllQueueStats();
    
    for (const stats of allStats) {
        console.log(`Queue: ${stats.queueName}`);
        console.log(`  Waiting: ${stats.waiting}`);
        console.log(`  Active: ${stats.active}`);
        console.log(`  Failed: ${stats.failed}`);
        console.log(`  Total: ${stats.total}`);
    }
}

// Cleanup old jobs from all queues
async function cleanupAllQueues() {
    const queueNames = queueService.getRegisteredQueues();
    
    for (const queueName of queueNames) {
        // Clean completed jobs older than 1 hour
        await queueService.cleanQueue(queueName, 3600000, 'completed');
        
        // Clean failed jobs older than 7 days
        await queueService.cleanQueue(queueName, 604800000, 'failed');
    }
}
```

## Worker Setup

### Creating a Worker for Any Queue

```javascript
// workers/email-worker.js
import { Worker } from 'bullmq';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

// Dynamic import to ensure env vars are loaded first
const { bullMQConnection } = await import('../config/redis.config.js');
import logger from '../middleware/logger.js';

// Process email jobs
async function processEmailJob(job) {
    const { userId, email, template } = job.data;
    
    logger.info('Processing email job', { 
        jobId: job.id, 
        template,
        email 
    });

    try {
        // Update progress
        await job.updateProgress(10);

        // Send email logic here
        await sendEmail(email, template, job.data);

        await job.updateProgress(100);

        return { 
            success: true, 
            emailSent: true,
            timestamp: Date.now()
        };
    } catch (error) {
        logger.error('Email job failed', { 
            jobId: job.id, 
            error: error.message 
        });
        throw error;
    }
}

// Create worker
const emailWorker = new Worker(
    'email-notifications',
    processEmailJob,
    {
        connection: bullMQConnection,
        concurrency: 10, // Process 10 jobs simultaneously
    }
);

// Event listeners
emailWorker.on('completed', (job) => {
    logger.info('Email job completed', { jobId: job.id });
});

emailWorker.on('failed', (job, error) => {
    logger.error('Email job failed', { 
        jobId: job?.id, 
        error: error.message 
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    logger.info('Shutting down email worker...');
    await emailWorker.close();
    process.exit(0);
});

logger.info('Email worker started');
```

### Running Multiple Workers

You can run multiple workers on different servers, all processing jobs from the same queue:

```bash
# Server 1: Run email worker
node workers/email-worker.js

# Server 2: Run another email worker (scales horizontally)
node workers/email-worker.js

# Server 3: Run resume analysis worker
node workers/resume-analysis-worker.js

# Server 4: Run report generation worker
node workers/report-worker.js
```

## Best Practices

1. **Queue Names**: Use descriptive, lowercase names with hyphens (e.g., `email-notifications`, `resume-analysis`)

2. **Job Names**: Use action-oriented names (e.g., `send-welcome-email`, `analyze-resume`)

3. **Priority**: Lower numbers = higher priority (1 is highest, 10 is default)

4. **Error Handling**: Always wrap queue operations in try-catch blocks

5. **Cleanup**: Regularly clean old completed/failed jobs to prevent Redis memory issues

6. **Monitoring**: Use `getAllQueueStats()` to monitor queue health

7. **Graceful Shutdown**: Always close queues on server shutdown

8. **Job Data**: Keep job data small and avoid storing large files directly in jobs

9. **Retries**: Configure appropriate retry strategies based on job type

10. **Logging**: Use structured logging for better debugging and monitoring

## API Reference

See `services/queue.service.js` for complete API documentation with JSDoc comments.
