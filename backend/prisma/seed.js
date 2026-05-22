import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PASSWORD = 'password123';

const permissions = [
  { code: 'content.publish', name: 'Publish content' },
  { code: 'content.view', name: 'View content' },
  { code: 'attendance.mark', name: 'Mark attendance' },
  { code: 'attendance.view', name: 'View attendance' },
  { code: 'admin.dashboard', name: 'Admin dashboard' },
];

const roles = [
  { code: 'org_admin', name: 'Organization Admin', perms: ['content.publish', 'content.view', 'attendance.mark', 'attendance.view', 'admin.dashboard'] },
  { code: 'branch_admin', name: 'Branch Admin', perms: ['content.publish', 'content.view', 'attendance.mark', 'attendance.view', 'admin.dashboard'] },
  { code: 'teacher', name: 'Teacher', perms: ['content.publish', 'content.view', 'attendance.mark', 'attendance.view'] },
  { code: 'student', name: 'Student', perms: ['content.view', 'attendance.view'] },
];

async function main() {
  console.log('Seeding SchoolX...');
  const hash = await bcrypt.hash(PASSWORD, 10);

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { code: p.code },
      create: p,
      update: {},
    });
  }

  const roleMap = {};
  for (const r of roles) {
    const role = await prisma.role.upsert({
      where: { code: r.code },
      create: { code: r.code, name: r.name },
      update: {},
    });
    roleMap[r.code] = role;
    for (const code of r.perms) {
      const perm = await prisma.permission.findUnique({ where: { code } });
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        create: { roleId: role.id, permissionId: perm.id },
        update: {},
      });
    }
  }

  await prisma.chatMessage.deleteMany();
  await prisma.chatParticipant.deleteMany();
  await prisma.chatThread.deleteMany();
  await prisma.contentSubmission.deleteMany();
  await prisma.contentAudience.deleteMany();
  await prisma.contentTag.deleteMany();
  await prisma.contentItem.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.feeInvoice.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.parentStudentLink.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.userBranchRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.section.deleteMany();
  await prisma.class.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.busRoute.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.organization.deleteMany();

  const org = await prisma.organization.create({
    data: { name: 'Greenwood International', slug: 'greenwood', timezone: 'Asia/Kolkata' },
  });

  const branchMain = await prisma.branch.create({
    data: { organizationId: org.id, name: 'Main Campus', code: 'MAIN' },
  });
  const branchEast = await prisma.branch.create({
    data: { organizationId: org.id, name: 'East Campus', code: 'EAST' },
  });

  const year = await prisma.academicYear.create({
    data: { organizationId: org.id, name: '2025-26', isCurrent: true },
  });

  const class5 = await prisma.class.create({
    data: { branchId: branchMain.id, academicYearId: year.id, name: 'Grade 5', gradeLevel: 5 },
  });
  const sectionA = await prisma.section.create({
    data: { classId: class5.id, name: 'A' },
  });

  async function createUser({ email, fullName, roleCode, branchId, teacher, student }) {
    const user = await prisma.user.create({
      data: {
        organizationId: org.id,
        email,
        fullName,
        passwordHash: hash,
        phone: '9999999999',
        branchRoles: {
          create: { branchId, roleId: roleMap[roleCode].id },
        },
        ...(teacher && { teacher: { create: { employeeCode: teacher } } }),
        ...(student && {
          student: {
            create: {
              organizationId: org.id,
              branchId: branchMain.id,
              admissionNo: student.admissionNo,
              firstName: student.firstName,
              lastName: student.lastName,
              currentSectionId: sectionA.id,
              busNumber: student.busNumber || 'MH12AB1234',
            },
          },
        }),
      },
      include: { teacher: true, student: true },
    });
    return user;
  }

  const admin = await createUser({
    email: 'admin@greenwood.edu',
    fullName: 'School Admin',
    roleCode: 'org_admin',
    branchId: branchMain.id,
  });

  const teacher = await createUser({
    email: 'teacher@greenwood.edu',
    fullName: 'Mr. Rajesh Sharma',
    roleCode: 'teacher',
    branchId: branchMain.id,
    teacher: 'T001',
  });

  const studentUser = await createUser({
    email: 'student@greenwood.edu',
    fullName: 'Aarav Patel',
    roleCode: 'student',
    branchId: branchMain.id,
    student: { admissionNo: 'STU1001', firstName: 'Aarav', lastName: 'Patel', busNumber: 'MH12AB1234' },
  });

  const students = [studentUser.student];
  const names = [
    ['Isha', 'Mehta'],
    ['Vihaan', 'Shah'],
    ['Ananya', 'Desai'],
    ['Kabir', 'Joshi'],
  ];
  for (let i = 0; i < names.length; i++) {
    const s = await prisma.student.create({
      data: {
        organizationId: org.id,
        branchId: branchMain.id,
        admissionNo: `STU100${i + 2}`,
        firstName: names[i][0],
        lastName: names[i][1],
        currentSectionId: sectionA.id,
      },
    });
    students.push(s);
  }

  await prisma.busRoute.create({
    data: {
      organizationId: org.id,
      busNumber: 'MH12AB1234',
      routeName: 'Main Campus Route 1',
      latitude: 18.5204,
      longitude: 73.8567,
      speed: 35,
    },
  });

  const homework = await prisma.contentItem.create({
    data: {
      organizationId: org.id,
      branchId: branchMain.id,
      type: 'ASSIGNMENT',
      title: 'Math Exercise 5.2',
      body: 'Complete exercises 1-10 from chapter 5. Show all working.',
      status: 'published',
      publishAt: new Date(),
      dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      subjectName: 'Mathematics',
      createdById: teacher.id,
      tags: { create: [{ tag: 'HOMEWORK' }] },
      audiences: { create: [{ audienceType: 'section', audienceId: sectionA.id }] },
    },
  });

  await prisma.contentItem.create({
    data: {
      organizationId: org.id,
      branchId: branchMain.id,
      type: 'BROADCAST',
      title: 'Parent-Teacher Meeting',
      body: 'PTM scheduled for Saturday 10 AM in the auditorium.',
      status: 'published',
      publishAt: new Date(),
      createdById: admin.id,
      tags: { create: [{ tag: 'ANNOUNCEMENT' }] },
      audiences: { create: [{ audienceType: 'branch', audienceId: branchMain.id }] },
    },
  });

  await prisma.contentItem.create({
    data: {
      organizationId: org.id,
      branchId: branchMain.id,
      type: 'BROADCAST',
      title: 'Holiday Notice',
      body: 'School closed on Friday for maintenance.',
      status: 'published',
      publishAt: new Date(),
      createdById: admin.id,
      tags: { create: [{ tag: 'NOTICE' }] },
      audiences: { create: [{ audienceType: 'branch', audienceId: branchMain.id }] },
    },
  });

  await prisma.contentItem.create({
    data: {
      organizationId: org.id,
      branchId: branchMain.id,
      type: 'ASSESSMENT',
      title: 'Unit Test — Science',
      body: 'Chapters 1-3 included. Bring geometry box.',
      status: 'published',
      publishAt: new Date(),
      examDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      subjectName: 'Science',
      createdById: teacher.id,
      tags: { create: [{ tag: 'UNIT_TEST' }] },
      audiences: { create: [{ audienceType: 'section', audienceId: sectionA.id }] },
    },
  });

  const session = await prisma.attendanceSession.create({
    data: {
      branchId: branchMain.id,
      sectionId: sectionA.id,
      date: new Date(),
      takenById: teacher.id,
      records: {
        create: students.map((s, i) => ({
          studentId: s.id,
          status: i === 2 ? 'absent' : 'present',
        })),
      },
    },
  });

  for (let day = 1; day <= 5; day++) {
    await prisma.timetableSlot.createMany({
      data: [
        { sectionId: sectionA.id, dayOfWeek: day, period: 1, subject: 'Mathematics', teacher: 'Mr. Sharma', startTime: '08:00', endTime: '08:45' },
        { sectionId: sectionA.id, dayOfWeek: day, period: 2, subject: 'English', teacher: 'Ms. Rao', startTime: '08:50', endTime: '09:35' },
        { sectionId: sectionA.id, dayOfWeek: day, period: 3, subject: 'Science', teacher: 'Dr. Iyer', startTime: '09:50', endTime: '10:35' },
      ],
    });
  }

  await prisma.feeInvoice.create({
    data: {
      studentId: students[0].id,
      title: 'Term 2 Tuition',
      amount: 25000,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'pending',
    },
  });

  const chatThread = await prisma.chatThread.create({
    data: {
      title: 'Grade 5 A — Class Chat',
      sectionId: sectionA.id,
      participants: {
        create: [{ userId: teacher.id }, { userId: studentUser.id }],
      },
      messages: {
        create: [
          { userId: teacher.id, body: 'Welcome to class chat. Ask questions here.' },
          { userId: studentUser.id, body: 'Thank you sir!' },
        ],
      },
    },
  });

  console.log('\n✅ Seed complete!\n');
  console.log('Organization slug: greenwood');
  console.log('Password (all users): password123\n');
  console.log('Admin:   admin@greenwood.edu');
  console.log('Teacher: teacher@greenwood.edu');
  console.log('Student: student@greenwood.edu');
  console.log(`\nChat thread ID: ${chatThread.id}`);
  console.log(`Homework content ID: ${homework.id}`);
  console.log(`Section ID: ${sectionA.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
