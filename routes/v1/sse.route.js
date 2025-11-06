import { Router } from 'express';
import {
    connect,
    subscribeToJob,
    subscribeToQueue,
    unsubscribeFromJob,
    unsubscribeFromQueue,
    getStats
} from '../../controllers/sse.controller.js';

const router = Router();

// SSE Routes
router.get('/connect', connect);
router.post('/:connectionId/subscribe/job/:jobId', subscribeToJob);
router.post('/:connectionId/subscribe/queue/:queueName', subscribeToQueue);
router.post('/:connectionId/unsubscribe/job/:jobId', unsubscribeFromJob);
router.post('/:connectionId/unsubscribe/queue/:queueName', unsubscribeFromQueue);
router.get('/stats', getStats);

export default router;
