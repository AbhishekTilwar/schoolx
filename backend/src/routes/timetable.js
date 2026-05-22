import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/me', authRequired, async (req, res) => {
  let sectionId = req.query.sectionId;

  if (req.user.studentId && !sectionId) {
    const student = await prisma.student.findUnique({
      where: { id: req.user.studentId },
      select: { currentSectionId: true },
    });
    sectionId = student?.currentSectionId;
  }

  if (!sectionId) return res.json([]);

  const slots = await prisma.timetableSlot.findMany({
    where: { sectionId },
    orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }],
  });
  res.json(slots);
});

export default router;
