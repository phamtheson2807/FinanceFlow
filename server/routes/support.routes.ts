// src/routes/support.routes.ts
import express from 'express';
import { SupportController } from '../controllers/support.controller';
import { authMiddleware } from '../middleware/auth'; // Đã đúng

const router = express.Router();

router.get('/chat/:userId', authMiddleware, async (req, res, next) => {
    try {
        await SupportController.getChatHistory(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/sessions', authMiddleware, async (req, res, next) => {
    try {
        await SupportController.getAllSessions(req, res);
    } catch (error) {
        next(error);
    }
});

router.post('/message', authMiddleware, async (req, res, next) => {
    try {
        await SupportController.saveMessage(req, res);
    } catch (error) {
        next(error);
    }
});

router.patch('/session/:sessionId', authMiddleware, async (req, res, next) => {
    try {
        await SupportController.updateSession(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;