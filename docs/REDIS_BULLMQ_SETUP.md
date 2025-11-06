# Redis & BullMQ Setup Guide

## Overview
This setup includes Redis for caching and BullMQ for job queue management. The architecture supports separate deployment of API servers and worker servers for scalability.

## Architecture

```
┌──────────────────┐
│   API Server     │  (Handles HTTP requests, adds jobs to queue)
└──────────────────┘
         │
         ▼
┌──────────────────┐
│      Redis       │  DB 0: Cache | DB 1: Queue
└──────────────────┘
         │
         ▼
┌──────────────────┐
│  Worker Server   │  (Processes resume analysis jobs)
└──────────────────┘
```

## Prerequisites

### 1. Install Redis

#### macOS (using Homebrew):
```bash
brew install redis
brew services start redis
```

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```

#### Docker:
```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

### 2. Verify Redis Installation
```bash
redis-cli ping
# Should return: PONG
```

## Configuration

### Environment Variables (.env)
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_MAX_RETRIES=3

# Worker Configuration
WORKER_CONCURRENCY=5
```

For production, use:
- **REDIS_HOST**: Your Redis server hostname
- **REDIS_PASSWORD**: Strong password for Redis
- **WORKER_CONCURRENCY**: Number of parallel jobs (adjust based on CPU)

## Project Structure

```
config/
  └── redis.config.js           # Redis connection configuration

services/
  └── cache.service.js          # Cache operations wrapper

utils/
  └── cache-keys.js             # Standardized cache key patterns

queues/
  ├── index.js                  # Queue exports
  ├── resume-analysis.queue.js  # Resume analysis queue
  └── workers/
      └── resume-analysis.worker.js  # Worker process

routes/v1/
  └── health.route.js           # Health check endpoints
```

## Running the Application

### Development Mode

#### Terminal 1: Start API Server
```bash
pnpm dev
# Server runs on http://localhost:8000
```

#### Terminal 2: Start Worker Server
```bash
pnpm worker:dev
# Worker processes jobs from the queue
```

### Production Mode

#### API Server
```bash
NODE_ENV=production pnpm start
```

#### Worker Server (separate machine/container)
```bash
NODE_ENV=production WORKER_CONCURRENCY=10 pnpm worker
```

## Health Check Endpoints

### Check Redis Connection
```bash
curl http://localhost:8000/api/v1/health/redis
```

Response:
```json
{
  "success": true,
  "message": "Redis connections healthy",
  "data": {
    "cache": {
      "connected": true,
      "latency": 2
    },
    "queue": {
      "connected": true,
      "latency": 1
    }
  }
}
```

### Check Queue Statistics
```bash
curl http://localhost:8000/api/v1/health/queue
```

Response:
```json
{
  "success": true,
  "message": "Queue statistics retrieved",
  "data": {
    "waiting": 5,
    "active": 2,
    "completed": 150,
    "failed": 3,
    "delayed": 0,
    "total": 160
  }
}
```

### Check Cache Statistics
```bash
curl http://localhost:8000/api/v1/health/cache
```

### Full System Health Check
```bash
curl http://localhost:8000/api/v1/health/full
```

## Usage Examples

### 1. Using Cache Service

```javascript
import cacheService from './services/cache.service.js';
import { USER_KEYS, TTL } from './utils/cache-keys.js';

// Set cache
await cacheService.set(
  USER_KEYS.byId(userId), 
  userData, 
  TTL.HOUR_1
);

// Get cache
const user = await cacheService.get(USER_KEYS.byId(userId));

// Delete cache
await cacheService.delete(USER_KEYS.byId(userId));

// Delete pattern
await cacheService.deletePattern(USER_KEYS.all());
```

### 2. Adding Jobs to Queue

```javascript
import { addResumeAnalysisJob } from './queues/resume-analysis.queue.js';

// Add resume analysis job
const job = await addResumeAnalysisJob({
  resumeId: '123',
  candidateId: '456',
  organisationId: '789',
  fileUrl: 'https://storage.com/resume.pdf',
  fileName: 'john_doe_resume.pdf',
  mimeType: 'application/pdf'
});

console.log('Job added:', job.id);
```

### 3. Checking Job Status

```javascript
import { getJobStatus } from './queues/resume-analysis.queue.js';

const status = await getJobStatus(jobId);
console.log(status);
// {
//   status: 'completed',
//   progress: 100,
//   result: { ... },
//   data: { ... }
// }
```

## Cache Key Patterns

All cache keys follow standardized patterns defined in `utils/cache-keys.js`:

```javascript
// User cache
USER_KEYS.byId(userId)           // user:123
USER_KEYS.profile(userId)        // user:123:profile
USER_KEYS.organisations(userId)  // user:123:organisations

// Resume cache
RESUME_KEYS.byId(resumeId)       // resume:456
RESUME_KEYS.analysis(resumeId)   // resume:456:analysis

// Auth cache
AUTH_KEYS.blacklist(token)       // auth:blacklist:token123
AUTH_KEYS.refreshToken(token)    // auth:refresh:abc123
```

## Deployment

### Option 1: Single Server (Development)
- Run both API and worker on the same server
- Good for low traffic

### Option 2: Separate Servers (Production)
- **API Server(s)**: Handle HTTP requests, add jobs to queue
- **Worker Server(s)**: Process jobs from queue
- **Redis Server**: Separate Redis instance or managed service

### Option 3: Cloud (Recommended)
- **API**: AWS ECS, Google Cloud Run, or Heroku
- **Worker**: AWS ECS, Google Cloud Run
- **Redis**: Redis Cloud, AWS ElastiCache, or DigitalOcean Managed Redis

## Scaling Strategy

### Horizontal Scaling

#### Scale API Servers
```bash
# Add more API server instances behind load balancer
# No code changes needed - stateless architecture
```

#### Scale Workers
```bash
# Add more worker instances
# Each worker will process jobs from the same queue
# Adjust WORKER_CONCURRENCY based on server capacity
```

### Monitoring

Monitor these metrics:
- Queue size (waiting jobs)
- Job processing time
- Redis memory usage
- Cache hit/miss ratio
- Worker CPU/memory usage

## Troubleshooting

### Redis Connection Failed
```bash
# Check if Redis is running
redis-cli ping

# Check Redis logs
tail -f /usr/local/var/log/redis.log  # macOS
sudo journalctl -u redis  # Linux
```

### Queue Not Processing Jobs
1. Ensure worker is running: `pnpm worker:dev`
2. Check Redis connection in worker logs
3. Verify queue stats: `curl http://localhost:8000/api/v1/health/queue`

### High Memory Usage
```bash
# Check Redis memory
redis-cli info memory

# Clear all cache (development only)
redis-cli -n 0 FLUSHDB

# Clear queue database
redis-cli -n 1 FLUSHDB
```

## Production Checklist

- [ ] Set strong Redis password
- [ ] Enable Redis persistence (AOF or RDB)
- [ ] Set up Redis monitoring (memory, connections)
- [ ] Configure Redis max memory policy
- [ ] Set appropriate TTL for cached data
- [ ] Monitor queue size and set alerts
- [ ] Configure worker concurrency based on load
- [ ] Set up Redis backup strategy
- [ ] Enable Redis SSL/TLS in production
- [ ] Set up queue job retention policies
- [ ] Configure worker auto-scaling rules

## Next Steps

1. ✅ Redis and BullMQ setup complete
2. 🔄 Implement resume parsing logic (PDF, DOCX)
3. 🔄 Implement resume analysis/scoring
4. 🔄 Integrate with database to store results
5. 🔄 Add WebSocket for real-time job progress updates
6. 🔄 Implement rate limiting using Redis
7. 🔄 Add session management with Redis

## Resources

- [Redis Documentation](https://redis.io/documentation)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [ioredis Documentation](https://github.com/redis/ioredis)
