import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

function formatContent(item) {
  return {
    id: item.id,
    type: item.type,
    tags: item.tags?.map((t) => t.tag) ?? [],
    title: item.title,
    body: item.body,
    status: item.status,
    publishAt: item.publishAt,
    dueAt: item.dueAt,
    examDate: item.examDate,
    subjectName: item.subjectName,
    authorName: item.author?.fullName,
    audienceLabel: item.audiences?.[0]
      ? `${item.audiences[0].audienceType}:${item.audiences[0].audienceId}`
      : null,
    createdAt: item.createdAt,
    submissionCount: item._count?.submissions,
  };
}

router.get('/', authRequired, async (req, res) => {
  const { type, tags, status, page = '1', limit = '20' } = req.query;
  const tagList = tags ? (Array.isArray(tags) ? tags : tags.split(',')) : undefined;

  const where = {
    organizationId: req.user.organizationId,
    ...(type && { type }),
    ...(status && { status }),
    ...(tagList?.length && { tags: { some: { tag: { in: tagList } } } }),
  };

  if (req.user.roles.includes('student') && req.user.studentId) {
    const student = await prisma.student.findUnique({
      where: { id: req.user.studentId },
      select: { currentSectionId: true, branchId: true },
    });

    if (!student) {
      return res.json({ data: [], page: Number(page) });
    }

    const audienceFilters = [
      { audiences: { some: { audienceType: 'branch', audienceId: student.branchId } } },
    ];
    if (student.currentSectionId) {
      audienceFilters.unshift({
        audiences: { some: { audienceType: 'section', audienceId: student.currentSectionId } },
      });
    }
    where.OR = audienceFilters;
    where.status = 'published';
  }

  const items = await prisma.contentItem.findMany({
    where,
    include: {
      tags: true,
      audiences: true,
      author: { select: { fullName: true } },
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: 'desc' },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });

  res.json({ data: items.map(formatContent), page: Number(page) });
});

router.get('/:id', authRequired, async (req, res) => {
  const item = await prisma.contentItem.findFirst({
    where: { id: req.params.id, organizationId: req.user.organizationId },
    include: {
      tags: true,
      audiences: true,
      author: { select: { fullName: true } },
      submissions: req.user.studentId
        ? { where: { studentId: req.user.studentId } }
        : { include: { student: { select: { firstName: true, lastName: true } } } },
    },
  });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ ...formatContent(item), body: item.body, submissions: item.submissions });
});

router.post('/', authRequired, async (req, res) => {
  const {
    branchId,
    type,
    tags = [],
    title,
    body = '',
    status = 'draft',
    dueAt,
    examDate,
    subjectName,
    audiences = [],
  } = req.body;

  if (!branchId || !type || !title) {
    return res.status(400).json({ error: 'branchId, type, title required' });
  }

  const tagList = (Array.isArray(tags) ? tags : [tags])
    .flat()
    .map((t) => (typeof t === 'string' ? t.trim() : ''))
    .filter(Boolean);

  if (tagList.length === 0) {
    return res.status(400).json({ error: 'At least one tag is required' });
  }

  try {
  const item = await prisma.contentItem.create({
    data: {
      organizationId: req.user.organizationId,
      branchId,
      type,
      title,
      body,
      status,
      dueAt: dueAt ? new Date(dueAt) : null,
      examDate: examDate ? new Date(examDate) : null,
      subjectName,
      publishAt: status === 'published' ? new Date() : null,
      createdById: req.user.sub,
      tags: { create: tagList.map((tag) => ({ tag })) },
      audiences: {
        create: audiences.map((a) => ({
          audienceType: a.audienceType,
          audienceId: a.audienceId,
        })),
      },
    },
    include: { tags: true, audiences: true, author: { select: { fullName: true } } },
  });

  res.status(201).json(formatContent(item));
  } catch (err) {
    console.error('Content create failed:', err);
    res.status(500).json({ error: err.message || 'Failed to create content' });
  }
});

router.post('/:id/submissions', authRequired, async (req, res) => {
  if (!req.user.studentId) return res.status(403).json({ error: 'Students only' });
  const { textAnswer } = req.body;

  const submission = await prisma.contentSubmission.upsert({
    where: {
      contentId_studentId: {
        contentId: req.params.id,
        studentId: req.user.studentId,
      },
    },
    create: {
      contentId: req.params.id,
      studentId: req.user.studentId,
      textAnswer: textAnswer ?? '',
    },
    update: { textAnswer: textAnswer ?? '', submittedAt: new Date() },
  });

  res.status(201).json(submission);
});

export default router;
