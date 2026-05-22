import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/buses', authRequired, async (req, res) => {
  const buses = await prisma.busRoute.findMany({
    where: { organizationId: req.user.organizationId },
    orderBy: { busNumber: 'asc' },
  });
  res.json(buses);
});

router.get('/location', authRequired, async (req, res) => {
  const { busNumber } = req.query;
  if (!busNumber) return res.status(400).json({ error: 'busNumber required' });

  const bus = await prisma.busRoute.findFirst({
    where: {
      organizationId: req.user.organizationId,
      busNumber: String(busNumber).toUpperCase(),
    },
  });

  if (!bus) {
    return res.status(404).json({ error: 'Bus not found. Add it in the database first.' });
  }

  const updated = await prisma.busRoute.update({
    where: { id: bus.id },
    data: {
      latitude: bus.latitude + (Math.random() - 0.5) * 0.002,
      longitude: bus.longitude + (Math.random() - 0.5) * 0.002,
      speed: Math.floor(20 + Math.random() * 40),
    },
  });

  res.json({
    busNumber: updated.busNumber,
    routeName: updated.routeName,
    latitude: updated.latitude,
    longitude: updated.longitude,
    speed: updated.speed,
    recordedAt: new Date().toISOString(),
  });
});

export default router;
