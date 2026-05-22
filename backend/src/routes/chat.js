import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/threads', authRequired, async (req, res) => {
  const threads = await prisma.chatThread.findMany({
    include: {
      messages: { orderBy: { createdAt: 'desc' }, take: 1, include: { user: { select: { fullName: true } } } },
    },
    orderBy: { id: 'asc' },
  });
  res.json(
    threads.map((t) => ({
      id: t.id,
      title: t.title,
      lastMessage: t.messages[0]
        ? { body: t.messages[0].body, author: t.messages[0].user.fullName, at: t.messages[0].createdAt }
        : null,
    }))
  );
});

router.get('/threads/:id/messages', authRequired, async (req, res) => {
  const messages = await prisma.chatMessage.findMany({
    where: { threadId: req.params.id },
    include: { user: { select: { fullName: true } } },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });
  res.json(
    messages.map((m) => ({
      id: m.id,
      body: m.body,
      authorName: m.user.fullName,
      userId: m.userId,
      createdAt: m.createdAt,
    }))
  );
});

router.post('/threads/:id/messages', authRequired, async (req, res) => {
  const { body } = req.body;
  if (!body?.trim()) return res.status(400).json({ error: 'Message body required' });

  const message = await prisma.chatMessage.create({
    data: { threadId: req.params.id, userId: req.user.sub, body: body.trim() },
    include: { user: { select: { fullName: true } } },
  });

  const payload = {
    id: message.id,
    threadId: req.params.id,
    body: message.body,
    authorName: message.user.fullName,
    userId: message.userId,
    createdAt: message.createdAt,
  };

  req.app.locals.broadcastChat?.(req.params.id, payload);
  res.status(201).json(payload);
});

export default router;
