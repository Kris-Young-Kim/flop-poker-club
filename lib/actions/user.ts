'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { Profile } from '@/types/database.types'

function mapProfile(row: typeof profiles.$inferSelect): Profile {
  return {
    id: row.id,
    email: row.email,
    name: row.name ?? '',
    nickname: row.nickname ?? '',
    phone: row.phone ?? '',
    role: row.role,
    tier: row.tier,
    qr_token: row.qrToken,
    total_points: row.totalPoints,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  }
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const session = await auth()
  if (!session?.user?.id) return null

  const row = await db.query.profiles.findFirst({
    where: eq(profiles.id, session.user.id),
  })

  return row ? mapProfile(row) : null
}
