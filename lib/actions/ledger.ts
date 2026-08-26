'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { profiles, pointTransactions } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import type { PointTransaction } from '@/types/database.types'

export async function getMyTransactions(limit = 50): Promise<PointTransaction[]> {
  const session = await auth()
  if (!session?.user?.id) return []

  const processor = alias(profiles, 'processor')

  const rows = await db
    .select({
      id: pointTransactions.id,
      userId: pointTransactions.userId,
      amount: pointTransactions.amount,
      balanceAfter: pointTransactions.balanceAfter,
      reason: pointTransactions.reason,
      description: pointTransactions.description,
      createdAt: pointTransactions.createdAt,
      processorName: processor.name,
      processorRole: processor.role,
    })
    .from(pointTransactions)
    .leftJoin(processor, eq(pointTransactions.processedBy, processor.id))
    .where(eq(pointTransactions.userId, session.user.id))
    .orderBy(desc(pointTransactions.createdAt))
    .limit(limit)

  return rows.map((row) => ({
    id: row.id,
    user_id: row.userId,
    amount: row.amount,
    balance_after: row.balanceAfter,
    reason: row.reason,
    description: row.description,
    processed_by: row.processorRole === 'super_admin' || row.processorRole === 'staff'
      ? `스태프 ${row.processorName ?? ''}`
      : '시스템',
    created_at: row.createdAt.toISOString(),
  }))
}
