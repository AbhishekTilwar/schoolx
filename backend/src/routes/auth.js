import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password, orgSlug } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    let organization = null;
    if (orgSlug) {
      organization = await prisma.organization.findUnique({ where: { slug: orgSlug } });
      if (!organization) return res.status(404).json({ error: 'Organization not found' });
    }

    const user = await prisma.user.findFirst({
      where: organization
        ? { email: email.toLowerCase(), organizationId: organization.id }
        : { email: email.toLowerCase() },
      include: {
        branchRoles: { include: { role: true, branch: true } },
        teacher: true,
        student: { include: { section: { include: { class: true } } } },
        parent: { include: { links: { include: { student: true } } } },
        organization: true,
      },
    });

    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const roles = [...new Set(user.branchRoles.map((br) => br.role.code))];
    const branchIds = [...new Set(user.branchRoles.map((br) => br.branchId))];

    const payload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      organizationId: user.organizationId,
      orgSlug: user.organization.slug,
      roles,
      branchIds,
      teacherId: user.teacher?.id || null,
      studentId: user.student?.id || null,
      parentId: user.parent?.id || null,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles,
        branchIds,
        organization: { id: user.organization.id, name: user.organization.name, slug: user.organization.slug },
        student: user.student
          ? {
              id: user.student.id,
              section: user.student.section
                ? `${user.student.section.class.name} ${user.student.section.name}`
                : null,
              busNumber: user.student.busNumber,
            }
          : null,
        teacher: user.teacher ? { id: user.teacher.id } : null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authRequired, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.sub },
    include: {
      branchRoles: { include: { role: { include: { permissions: { include: { permission: true } } } }, branch: true } },
      teacher: true,
      student: { include: { section: { include: { class: true } } } },
      organization: true,
    },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const permissions = [
    ...new Set(
      user.branchRoles.flatMap((br) => br.role.permissions.map((rp) => rp.permission.code))
    ),
  ];

  res.json({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    roles: req.user.roles,
    permissions,
    branchIds: req.user.branchIds,
    organization: user.organization,
    student: user.student,
    teacher: user.teacher,
  });
});

export default router;
