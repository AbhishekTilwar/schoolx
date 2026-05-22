import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/me', authRequired, async (req, res) => {
  if (!req.user.studentId) return res.status(403).json({ error: 'Students only' });
  const items = await prisma.feeInvoice.findMany({
    where: { studentId: req.user.studentId },
    orderBy: { dueDate: 'desc' },
  });
  res.json(items);
});

export default router;
