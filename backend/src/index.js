import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import authRoutes from './routes/auth.js';
import contentRoutes from './routes/content.js';
import attendanceRoutes from './routes/attendance.js';
import adminRoutes from './routes/admin.js';
import transportRoutes from './routes/transport.js';
import chatRoutes from './routes/chat.js';
import timetableRoutes from './routes/timetable.js';
import leaveRoutes from './routes/leave.js';
import feeRoutes from './routes/fees.js';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const chatRooms = new Map();

app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => res.json({ ok: true, service: 'schoolx-api' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/transport', transportRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/timetable', timetableRoutes);
app.use('/api/v1/leave', leaveRoutes);
app.use('/api/v1/fees', feeRoutes);

app.locals.broadcastChat = (threadId, payload) => {
  const room = chatRooms.get(threadId);
  if (!room) return;
  const data = JSON.stringify({ type: 'chat.message', payload });
  room.forEach((ws) => {
    if (ws.readyState === 1) ws.send(data);
  });
};

wss.on('connection', (ws, req) => {
  const url = new URL(req.url || '', 'http://localhost');
  const threadId = url.searchParams.get('threadId');
  if (!threadId) {
    ws.close();
    return;
  }
  if (!chatRooms.has(threadId)) chatRooms.set(threadId, new Set());
  chatRooms.get(threadId).add(ws);

  ws.on('close', () => {
    chatRooms.get(threadId)?.delete(ws);
  });
});

const port = process.env.PORT || 3000;
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Stop the other process:`);
    console.error(`  lsof -i :${port}   # find PID`);
    console.error(`  kill <PID>         # or: ./scripts/stop-api.sh`);
    process.exit(1);
  }
  throw err;
});
server.listen(port, () => {
  console.log(`SchoolX API running at http://localhost:${port}`);
  console.log(`WebSocket chat: ws://localhost:${port}/ws?threadId=<id>`);
});
