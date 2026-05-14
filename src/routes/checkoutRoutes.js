import express from 'express';
import { createSession } from '../controllers/checkoutController.js';

const router = express.Router();

router.post('/create-session', createSession);

export default router;