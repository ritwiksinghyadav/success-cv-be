# Redis Pub/Sub with SSE Integration

This document explains the Redis Pub/Sub and Server-Sent Events (SSE) implementation for real-time worker updates to the frontend.

## Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Worker    │─publish─▶│ Redis Pub/Sub│◀─subscribe─│  API Server │
│  Process    │         │              │         │   (SSE)     │
└─────────────┘         └──────────────┘         └─────────────┘
                                                        │
                                                        │ SSE Stream
                                                        ▼
                                                  ┌─────────────┐
                                                  │  Frontend   │
                                                  │   Browser   │
                                                  └─────────────┘
```

### Flow:
1. **Worker** processes jobs and publishes updates to Redis Pub/Sub channels
2. **API Server** subscribes to Redis channels and maintains SSE connections
3. **Frontend** connects via SSE and receives real-time updates

## Components

### 1. PubSub Service (`services/pubsub.service.js`)

Manages Redis Pub/Sub for real-time communication.

#### Key Features:
- Separate publisher and subscriber connections
- Channel subscription management
- Event-driven architecture
- Automatic reconnection handling
- Support for job, queue, and worker updates

#### API:

```javascript
import pubSubService from './services/pubsub.service.js';

// Initialize (done automatically in server.js)
await pubSubService.initialize(redisConfig);

// Publish updates
await pubSubService.publishJobUpdate(jobId, {
    status: 'in_progress',
    progress: 50,
    stage: 'processing',
    message: 'Processing data...'
});

await pubSubService.publishQueueUpdate(queueName, {
    waiting: 5,
    active: 2,
    completed: 100
});

await pubSubService.publishWorkerStatus(workerId, {
    status: 'active',
    currentJob: jobId
});

// Subscribe to updates
await pubSubService.subscribeToJob(jobId, (data) => {
    console.log('Job update:', data);
});

await pubSubService.subscribeToQueue(queueName, (data) => {
    console.log('Queue update:', data);
});

// Cleanup
await pubSubService.disconnect();
```

### 2. SSE Service (`services/sse.service.js`)

Manages Server-Sent Events connections for real-time frontend updates.

#### Key Features:
- Multiple concurrent SSE connections
- Automatic heartbeat (30 seconds)
- Subscription management per connection
- Connection lifecycle management
- Statistics and monitoring

#### API:

```javascript
import sseService from './services/sse.service.js';

// Create SSE connection (done via HTTP endpoint)
const connectionId = sseService.createConnection(connectionId, res, req);

// Subscribe client to updates
await sseService.subscribeToJob(connectionId, jobId);
await sseService.subscribeToQueue(connectionId, queueName);

// Send custom events
sseService.sendEvent(connectionId, 'custom_event', { data: 'value' });
sseService.broadcast('announcement', { message: 'System update' });

// Get statistics
const stats = sseService.getStats();

// Cleanup
await sseService.closeConnection(connectionId);
await sseService.closeAllConnections();
```

### 3. SSE Controller (`controllers/sse.controller.js`)

HTTP endpoints for SSE connections and subscriptions.

### 4. Worker Integration (`queues/workers/resume-analysis.worker.js`)

Workers automatically publish updates via PubSub.

## API Endpoints

### Connect to SSE Stream
```http
GET /api/v1/sse/connect
```

**Response**: SSE stream with events

**Events**:
- `connected`: Initial connection established
- `job_update`: Job status/progress updates
- `queue_update`: Queue statistics updates
- `subscribed`: Subscription confirmation
- `heartbeat`: Keep-alive ping (every 30s)

### Subscribe to Job Updates
```http
POST /api/v1/sse/:connectionId/subscribe/job/:jobId
```

### Subscribe to Queue Updates
```http
POST /api/v1/sse/:connectionId/subscribe/queue/:queueName
```

### Unsubscribe from Job Updates
```http
POST /api/v1/sse/:connectionId/unsubscribe/job/:jobId
```

### Unsubscribe from Queue Updates
```http
POST /api/v1/sse/:connectionId/unsubscribe/queue/:queueName
```

### Get SSE Statistics
```http
GET /api/v1/sse/stats
```

## Frontend Integration

### Vanilla JavaScript Example

```javascript
// 1. Connect to SSE
const eventSource = new EventSource('http://localhost:8000/api/v1/sse/connect');

// 2. Listen for connection event
eventSource.addEventListener('connected', (e) => {
    const data = JSON.parse(e.data);
    const connectionId = data.connectionId;
    console.log('Connected:', connectionId);
    
    // 3. Subscribe to job updates
    subscribeToJob(connectionId, 'job-123');
});

// 4. Listen for job updates
eventSource.addEventListener('job_update', (e) => {
    const data = JSON.parse(e.data);
    console.log('Job Update:', data);
    
    // Update UI with progress
    updateProgressBar(data.progress);
    updateStatusMessage(data.message);
});

// 5. Listen for heartbeat
eventSource.addEventListener('heartbeat', (e) => {
    console.log('Heartbeat received');
});

// 6. Handle errors
eventSource.onerror = (error) => {
    console.error('SSE error:', error);
    eventSource.close();
};

// 7. Subscribe to job
async function subscribeToJob(connectionId, jobId) {
    await fetch(`http://localhost:8000/api/v1/sse/${connectionId}/subscribe/job/${jobId}`, {
        method: 'POST'
    });
}

// 8. Cleanup on page unload
window.addEventListener('beforeunload', () => {
    eventSource.close();
});
```

### React Example

```javascript
import { useEffect, useState } from 'react';

function JobProgress({ jobId }) {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const [connectionId, setConnectionId] = useState(null);

    useEffect(() => {
        // Connect to SSE
        const eventSource = new EventSource('http://localhost:8000/api/v1/sse/connect');

        eventSource.addEventListener('connected', async (e) => {
            const data = JSON.parse(e.data);
            setConnectionId(data.connectionId);
            
            // Subscribe to job
            await fetch(
                `http://localhost:8000/api/v1/sse/${data.connectionId}/subscribe/job/${jobId}`,
                { method: 'POST' }
            );
        });

        eventSource.addEventListener('job_update', (e) => {
            const data = JSON.parse(e.data);
            setProgress(data.progress);
            setStatus(data.message);
        });

        eventSource.onerror = (error) => {
            console.error('SSE error:', error);
        };

        // Cleanup
        return () => {
            if (connectionId) {
                fetch(
                    `http://localhost:8000/api/v1/sse/${connectionId}/unsubscribe/job/${jobId}`,
                    { method: 'POST' }
                );
            }
            eventSource.close();
        };
    }, [jobId]);

    return (
        <div>
            <div className="progress-bar">
                <div style={{ width: `${progress}%` }}>{progress}%</div>
            </div>
            <p>{status}</p>
        </div>
    );
}
```

### Vue Example

```javascript
export default {
    data() {
        return {
            progress: 0,
            status: '',
            connectionId: null,
            eventSource: null
        };
    },
    mounted() {
        this.connectSSE();
    },
    beforeUnmount() {
        this.disconnectSSE();
    },
    methods: {
        async connectSSE() {
            this.eventSource = new EventSource('http://localhost:8000/api/v1/sse/connect');
            
            this.eventSource.addEventListener('connected', async (e) => {
                const data = JSON.parse(e.data);
                this.connectionId = data.connectionId;
                
                await this.subscribeToJob(this.jobId);
            });
            
            this.eventSource.addEventListener('job_update', (e) => {
                const data = JSON.parse(e.data);
                this.progress = data.progress;
                this.status = data.message;
            });
        },
        async subscribeToJob(jobId) {
            await fetch(
                `http://localhost:8000/api/v1/sse/${this.connectionId}/subscribe/job/${jobId}`,
                { method: 'POST' }
            );
        },
        async disconnectSSE() {
            if (this.connectionId && this.jobId) {
                await fetch(
                    `http://localhost:8000/api/v1/sse/${this.connectionId}/unsubscribe/job/${this.jobId}`,
                    { method: 'POST' }
                );
            }
            if (this.eventSource) {
                this.eventSource.close();
            }
        }
    }
};
```

## Event Formats

### Job Update Event
```javascript
{
    type: 'job_update',
    jobId: 'resume-123-1699267200000',
    timestamp: 1699267200000,
    status: 'in_progress',  // 'started', 'in_progress', 'completed', 'failed'
    progress: 50,           // 0-100
    stage: 'parsing',       // 'initializing', 'fetching', 'parsing', 'extracting', 'analyzing', 'storing'
    message: 'Parsing resume content',
    resumeId: 'resume-123',
    candidateId: 'candidate-456',
    // Additional data for completed/failed
    result: { ... },        // When completed
    error: 'Error message'  // When failed
}
```

### Queue Update Event
```javascript
{
    type: 'queue_update',
    queueName: 'resume-analysis',
    timestamp: 1699267200000,
    waiting: 5,
    active: 2,
    completed: 100,
    failed: 3,
    delayed: 1
}
```

### Worker Status Event
```javascript
{
    type: 'worker_status',
    workerId: 'worker-1',
    timestamp: 1699267200000,
    status: 'active',  // 'active', 'idle', 'paused'
    currentJob: 'job-123',
    concurrency: 5
}
```

## Testing

### 1. Using the Test HTML Page
Open `docs/sse-test.html` in your browser:
```bash
open docs/sse-test.html
```

### 2. Using curl
```bash
# Connect to SSE (keep running)
curl -N http://localhost:8000/api/v1/sse/connect

# In another terminal, trigger a job
curl -X POST http://localhost:8000/api/v1/queue/add \
  -H "Content-Type: application/json" \
  -d '{
    "queueName": "resume-analysis",
    "jobName": "analyze-resume",
    "data": {
      "resumeId": "test-123",
      "candidateId": "candidate-456",
      "organisationId": "org-789",
      "fileUrl": "https://example.com/resume.pdf",
      "fileName": "resume.pdf",
      "mimeType": "application/pdf"
    }
  }'
```

### 3. Using Postman
1. Create a new request: `GET http://localhost:8000/api/v1/sse/connect`
2. Click "Send"
3. Watch events stream in real-time

## Best Practices

### 1. Connection Management
- Always close connections on page unload
- Handle reconnection on errors
- Implement exponential backoff for reconnects
- Monitor connection health via heartbeat

### 2. Subscription Management
- Subscribe only to needed updates
- Unsubscribe when component unmounts
- Batch subscribe operations when possible
- Clean up subscriptions on errors

### 3. Error Handling
- Implement error event listeners
- Show user-friendly error messages
- Retry failed subscriptions
- Log errors for debugging

### 4. Performance
- Limit number of concurrent subscriptions
- Implement event throttling for high-frequency updates
- Use connection pooling for multiple components
- Clean up old event listeners

### 5. Security
- Implement authentication for SSE connections
- Validate connection IDs
- Rate limit connections per user
- Sanitize event data before sending

## Monitoring

### Get SSE Statistics
```javascript
const response = await fetch('http://localhost:8000/api/v1/sse/stats');
const stats = await response.json();

console.log(stats);
// {
//   totalConnections: 5,
//   totalJobSubscriptions: 10,
//   totalQueueSubscriptions: 5,
//   connections: [...]
// }
```

### Redis Pub/Sub Monitoring
```javascript
// Get active subscriptions
const channels = pubSubService.getActiveSubscriptions();
console.log('Active channels:', channels);

// Get subscription count
const count = pubSubService.getSubscriptionCount('job:123');
console.log('Subscribers:', count);
```

## Troubleshooting

### SSE Connection Fails
- Check CORS settings
- Verify Redis is running
- Check PubSub service initialization
- Review network tab in browser dev tools

### No Events Received
- Verify subscription was successful
- Check worker is publishing events
- Monitor Redis Pub/Sub channels
- Check SSE connection is still open

### High Memory Usage
- Limit event history in frontend
- Clean up old subscriptions
- Monitor connection leaks
- Implement event pruning

### Performance Issues
- Reduce heartbeat frequency
- Batch updates when possible
- Implement event throttling
- Use Redis clustering

## Production Considerations

1. **Load Balancing**: Use sticky sessions or Redis for SSE state
2. **Scaling**: Deploy multiple API servers and workers
3. **Monitoring**: Track connection counts, event rates, error rates
4. **Security**: Implement authentication and authorization
5. **Rate Limiting**: Limit connections and subscriptions per user
6. **Cleanup**: Implement automatic cleanup of stale connections
7. **Logging**: Log all SSE events for debugging
8. **Alerts**: Set up alerts for connection failures

## See Also
- [Queue Service Usage](./QUEUE_SERVICE_USAGE.md)
- [Redis BullMQ Setup](./REDIS_BULLMQ_SETUP.md)
- [SSE Test Page](./sse-test.html)
