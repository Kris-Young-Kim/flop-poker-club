'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { profiles, pointTransactions } from '@/lib/db/schema'
import { eq, and, ne } from 'drizzle-orm'

export async function checkNicknameAvailable(nickname: string): Promise<boolean> {
  if (!nickname.trim()) return false
  const session = await auth()

  const existing = await db.query.profiles.findFirst({
    where: session?.user?.id
      ? and(eq(profiles.nickname, nickname), ne(profiles.id, session.user.id))
      : eq(profiles.nickname, nickname),
    columns: { id: true },
  })

  return !existing
}

export async function saveProfile(data: {
  name: string
  nickname: string
  phone: string
}): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: '인증이 필요합니다.' }

  const userId = session.user.id

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(profiles)
        .set({
          name: data.name,
          nickname: data.nickname,
          phone: data.phone,
          totalPoints: 5000,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, userId))

      await tx.insert(pointTransactions).values({
        userId,
        amount: 5000,
        balanceAfter: 5000,
        reason: 'EVENT_BONUS',
        description: '신규 멤버십 웰컴 보너스',
        processedBy: userId,
      })
    })

    return { success: true }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('unique') || (e as { code?: string })?.code === '23505') {
      if (msg.includes('nickname')) return { success: false, error: '이미 사용 중인 닉네임입니다.' }
      if (msg.includes('phone')) return { success: false, error: '이미 등록된 전화번호입니다.' }
    }
    return { success: false, error: '저장에 실패했습니다. 다시 시도해 주세요.' }
  }
}
