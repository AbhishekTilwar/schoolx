import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authRequired, requireRoles } from '../middleware/auth.js';

const router = Router();
router.use(authRequired);

router.get('/dashboard', requireRoles('org_admin', 'branch_admin'), async (req, res) => {
  const orgId = req.user.organizationId;
  const branchFilter = req.query.branchId ? { branchId: req.query.branchId } : {};

  const [students, teachers, contentCount, leavePending] = await Promise.all([
    prisma.student.count({ where: { organizationId: orgId, ...branchFilter } }),
    prisma.user.count({
      where: {
        organizationId: orgId,
        teacher: { isNot: null },
      },
    }),
    prisma.contentItem.count({
      where: {
        organizationId: orgId,
        status: 'published',
        ...(req.query.branchId && { branchId: req.query.branchId }),
      },
    }),
    prisma.leaveRequest.count({ where: { status: 'pending' } }),
  ]);

  res.json({ students, teachers, contentCount, leavePending });
});

router.get('/branches', async (req, res) => {
  const branches = await prisma.branch.findMany({
    where: { organizationId: req.user.organizationId },
    orderBy: { name: 'asc' },
  });
  res.json(branches);
});

router.get('/students', async (req, res) => {
  const { branchId } = req.query;
  const students = await prisma.student.findMany({
    where: {
      organizationId: req.user.organizationId,
      ...(branchId && { branchId }),
    },
    include: { section: { include: { class: true } }, branch: true },
    orderBy: { firstName: 'asc' },
  });
  res.json(
    students.map((s) => ({
      id: s.id,
      admissionNo: s.admissionNo,
      name: `${s.firstName} ${s.lastName}`,
      branch: s.branch.name,
      section: s.section ? `${s.section.class.name} ${s.section.name}` : '—',
      busNumber: s.busNumber,
    }))
  );
});

router.get('/teachers', async (req, res) => {
  const teachers = await prisma.teacher.findMany({
    where: { user: { organizationId: req.user.organizationId } },
    include: { user: true },
  });
  res.json(
    teachers.map((t) => ({
      id: t.id,
      name: t.user.fullName,
      email: t.user.email,
      employeeCode: t.employeeCode,
    }))
  );
});

router.get('/sections', async (req, res) => {
  const { branchId } = req.query;
  const sections = await prisma.section.findMany({
    where: branchId ? { class: { branchId } } : {},
    include: { class: { include: { branch: true } } },
    orderBy: { name: 'asc' },
  });
  res.json(
    sections.map((s) => ({
      id: s.id,
      label: `${s.class.branch.name} · ${s.class.name} ${s.name}`,
      branchId: s.class.branchId,
      className: s.class.name,
      name: s.name,
    }))
  );
});

router.get('/leave', async (req, res) => {
  const items = await prisma.leaveRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json(items);
});

router.get('/fees', async (req, res) => {
  const items = await prisma.feeInvoice.findMany({ orderBy: { dueDate: 'desc' }, take: 50 });
  res.json(items);
});

export default router;
