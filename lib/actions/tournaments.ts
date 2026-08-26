'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { profiles, tournaments, tournamentParticipants, pointTransactions } from '@/lib/db/schema'
import { eq, and, count, sql, desc } from 'drizzle-orm'
import type { Tournament, TournamentParticipant } from '@/types/database.types'

function mapTournament(
  row: typeof tournaments.$inferSelect & { current_players: number }
): Tournament {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    start_time: row.startTime.toISOString(),
    entry_point_cost: row.entryPointCost,
    total_prize_points: row.totalPrizePoints,
    max_players: row.maxPlayers ?? 30,
    status: row.status,
    current_players: row.current_players,
    created_at: row.createdAt.toISOString(),
  }
}

export async function getTournaments(): Promise<Tournament[]> {
  const rows = await db
    .select({
      id: tournaments.id,
      title: tournaments.title,
      description: tournaments.description,
      startTime: tournaments.startTime,
      entryPointCost: tournaments.entryPointCost,
      totalPrizePoints: tournaments.totalPrizePoints,
      maxPlayers: tournaments.maxPlayers,
      status: tournaments.status,
      createdAt: tournaments.createdAt,
      current_players: count(tournamentParticipants.id),
    })
    .from(tournaments)
    .leftJoin(tournamentParticipants, eq(tournaments.id, tournamentParticipants.tournamentId))
    .groupBy(tournaments.id)
    .orderBy(desc(tournaments.startTime))

  return rows.map((row) =>
    mapTournament({ ...row, current_players: Number(row.current_players) })
  )
}

export async function getMyRegistrations(): Promise<TournamentParticipant[]> {
  const session = await auth()
  if (!session?.user?.id) return []

  const rows = await db.query.tournamentParticipants.findMany({
    where: eq(tournamentParticipants.userId, session.user.id),
    with: { tournament: false } as never,
  })

  return rows.map((row) => ({
    id: row.id,
    tournament_id: row.tournamentId,
    user_id: row.userId,
    final_rank: row.finalRank,
    prize_points_awarded: row.prizePointsAwarded ?? 0,
    registered_at: row.registeredAt.toISOString(),
  }))
}

export async function registerForTournament(
  tournamentId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: '인증이 필요합니다.' }

  const userId = session.user.id

  try {
    await db.transaction(async (tx) => {
      // Lock user profile and read balance
      const [profile] = await tx
        .select({ totalPoints: profiles.totalPoints })
        .from(profiles)
        .where(eq(profiles.id, userId))
        .for('update')

      if (!profile) throw new Error('PROFILE_NOT_FOUND')

      // Read tournament info
      const [tourney] = await tx
        .select({
          entryPointCost: tournaments.entryPointCost,
          maxPlayers: tournaments.maxPlayers,
          status: tournaments.status,
        })
        .from(tournaments)
        .where(eq(tournaments.id, tournamentId))

      if (!tourney) throw new Error('TOURNAMENT_NOT_FOUND')
      if (tourney.status !== 'REGISTRATION') throw new Error('NOT_OPEN')

      // Check current participant count
      const [{ cnt }] = await tx
        .select({ cnt: count(tournamentParticipants.id) })
        .from(tournamentParticipants)
        .where(eq(tournamentParticipants.tournamentId, tournamentId))

      if (Number(cnt) >= (tourney.maxPlayers ?? 30)) throw new Error('FULL')

      // Check existing registration
      const existing = await tx
        .select({ id: tournamentParticipants.id })
        .from(tournamentParticipants)
        .where(
          and(
            eq(tournamentParticipants.tournamentId, tournamentId),
            eq(tournamentParticipants.userId, userId)
          )
        )
      if (existing.length > 0) throw new Error('ALREADY_REGISTERED')

      // Check balance
      if (profile.totalPoints < tourney.entryPointCost) throw new Error('INSUFFICIENT_POINTS')

      const newBalance = profile.totalPoints - tourney.entryPointCost

      // Deduct points
      await tx
        .update(profiles)
        .set({ totalPoints: newBalance, updatedAt: new Date() })
        .where(eq(profiles.id, userId))

      // Insert ledger entry
      await tx.insert(pointTransactions).values({
        userId,
        amount: -tourney.entryPointCost,
        balanceAfter: newBalance,
        reason: 'TOURNAMENT_BUYIN',
        description: '토너먼트 참가 신청',
        processedBy: userId,
      })

      // Register participant
      await tx.insert(tournamentParticipants).values({
        tournamentId,
        userId,
      })
    })

    return { success: true }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    const errorMap: Record<string, string> = {
      PROFILE_NOT_FOUND: '회원 정보를 찾을 수 없습니다.',
      TOURNAMENT_NOT_FOUND: '대회를 찾을 수 없습니다.',
      NOT_OPEN: '현재 신청 접수 중인 대회가 아닙니다.',
      FULL: '대회 정원이 마감되었습니다.',
      ALREADY_REGISTERED: '이미 신청한 대회입니다.',
      INSUFFICIENT_POINTS: '포인트가 부족합니다.',
    }
    return { success: false, error: errorMap[msg] ?? '신청에 실패했습니다. 다시 시도해 주세요.' }
  }
}

export async function cancelRegistration(
  tournamentId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: '인증이 필요합니다.' }

  const userId = session.user.id

  try {
    await db.transaction(async (tx) => {
      // 1) 프로필 락 선취득 — 이후 모든 잔액 계산의 기준
      const [profile] = await tx
        .select({ totalPoints: profiles.totalPoints })
        .from(profiles)
        .where(eq(profiles.id, userId))
        .for('update')

      if (!profile) throw new Error('PROFILE_NOT_FOUND')

      // 2) 토너먼트 상태 확인
      const [tourney] = await tx
        .select({ entryPointCost: tournaments.entryPointCost, status: tournaments.status })
        .from(tournaments)
        .where(eq(tournaments.id, tournamentId))

      if (!tourney) throw new Error('TOURNAMENT_NOT_FOUND')
      if (tourney.status !== 'REGISTRATION' && tourney.status !== 'UPCOMING') {
        throw new Error('CANNOT_CANCEL')
      }

      // 3) 참가 기록 삭제
      const deleted = await tx
        .delete(tournamentParticipants)
        .where(
          and(
            eq(tournamentParticipants.tournamentId, tournamentId),
            eq(tournamentParticipants.userId, userId)
          )
        )
        .returning({ id: tournamentParticipants.id })

      if (deleted.length === 0) throw new Error('NOT_REGISTERED')

      // 4) 환불
      const newBalance = profile.totalPoints + tourney.entryPointCost

      await tx
        .update(profiles)
        .set({ totalPoints: newBalance, updatedAt: new Date() })
        .where(eq(profiles.id, userId))

      await tx.insert(pointTransactions).values({
        userId,
        amount: tourney.entryPointCost,
        balanceAfter: newBalance,
        reason: 'ADMIN_ADJUSTMENT',
        description: '토너먼트 신청 취소 환불',
        processedBy: userId,
      })
    })

    return { success: true }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    const errorMap: Record<string, string> = {
      PROFILE_NOT_FOUND: '회원 정보를 찾을 수 없습니다.',
      TOURNAMENT_NOT_FOUND: '대회를 찾을 수 없습니다.',
      CANNOT_CANCEL: '진행 중이거나 완료된 대회는 취소할 수 없습니다.',
      NOT_REGISTERED: '신청 내역을 찾을 수 없습니다.',
    }
    return { success: false, error: errorMap[msg] ?? '취소에 실패했습니다. 다시 시도해 주세요.' }
  }
}
