import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/me', authRequired, async (req, res) => {
  const items = await prisma.leaveRequest.findMany({
    where: { requesterId: req.user.sub },
    orderBy: { createdAt: 'desc' },
  });
  res.json(items);
});

router.post('/', authRequired, async (req, res) => {
  const { fromDate, toDate, reason, studentId } = req.body;
  const item = await prisma.leaveRequest.create({
    data: {
      requesterId: req.user.sub,
      studentId: studentId || req.user.studentId || null,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      reason,
    },
  });
  res.status(201).json(item);
});

router.patch('/:id/status', authRequired, async (req, res) => {
  const { status } = req.body;
  const item = await prisma.leaveRequest.update({
    where: { id: req.params.id },
    data: { status },
  });
  res.json(item);
});

export default router;
