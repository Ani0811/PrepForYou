#!/usr/bin/env node
import 'dotenv/config'
import { prisma } from '../db/prisma'

async function promoteFirstActiveUser() {
  try {
    const activeCount = await prisma.user.count({ where: { isActive: true } });
    console.log('Active users count:', activeCount);

    if (activeCount > 0) {
      console.log('Active users exist; no action taken.');
      return process.exit(0);
    }

    // Pick the earliest created user (could be soft-deleted)
    const candidate = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
    if (!candidate) {
      console.log('No users found in database. Nothing to promote.');
      return process.exit(0);
    }

    const updated = await prisma.user.update({
      where: { id: candidate.id },
      data: { isActive: true, role: 'owner' },
    });

    console.log(`Promoted user ${updated.id} <${updated.email}> to owner and reactivated.`);
    return process.exit(0);
  } catch (err: any) {
    console.error('Error promoting first user:', err?.message || err);
    return process.exit(1);
  }
}

promoteFirstActiveUser();
