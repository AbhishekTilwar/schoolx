import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.post('/sessions', authRequired, async (req, res) => {
  const { sectionId, date, records } = req.body;
  if (!sectionId || !date || !records?.length) {
    return res.status(400).json({ error: 'sectionId, date, records required' });
  }

  const dateObj = new Date(date);
  let session = await prisma.attendanceSession.findUnique({
    where: { sectionId_date: { sectionId, date: dateObj } },
  });

  if (!session) {
    session = await prisma.attendanceSession.create({
      data: {
        branchId: req.body.branchId || req.user.branchIds[0],
        sectionId,
        date: dateObj,
        takenById: req.user.sub,
      },
    });
  }

  await prisma.attendanceRecord.deleteMany({ where: { sessionId: session.id } });
  await prisma.attendanceRecord.createMany({
    data: records.map((r) => ({
      sessionId: session.id,
      studentId: r.studentId,
      status: r.status,
    })),
  });

  const updated = await prisma.attendanceSession.findUnique({
    where: { id: session.id },
    include: { records: { include: { student: true } } },
  });

  res.json(updated);
});

router.get('/me', authRequired, async (req, res) => {
  if (!req.user.studentId) return res.status(403).json({ error: 'Students only' });

  const records = await prisma.attendanceRecord.findMany({
    where: { studentId: req.user.studentId },
    include: { session: true },
    orderBy: { session: { date: 'desc' } },
    take: 30,
  });

  const present = records.filter((r) => r.status === 'present').length;
  const total = records.length;
  res.json({
    summary: { present, total, percentage: total ? Math.round((present / total) * 100) : 0 },
    records: records.map((r) => ({
      date: r.session.date,
      status: r.status,
    })),
  });
});

router.get('/sections/:sectionId/students', authRequired, async (req, res) => {
  const students = await prisma.student.findMany({
    where: { currentSectionId: req.params.sectionId },
    orderBy: { firstName: 'asc' },
  });
  res.json(students);
});

export default router;
