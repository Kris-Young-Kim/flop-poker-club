'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import {
  profiles,
  pointTransactions,
  tournaments,
  tournamentParticipants,
  noticesEvents,
  adminAuditLogs,
} from '@/lib/db/schema'
import { eq, and, or, sql, desc, gte, ilike, count, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import type {
  Profile,
  PointTransaction,
  Tournament,
  TournamentParticipant,
  NoticeEvent,
  UserRole,
  UserTier,
  PointReason,
  TourneyStatus,
  NoticeCategory,
} from '@/types/database.types'

/**
 * Staff / Admin 권한 검증 헬퍼
 */
async function requireStaffSession() {
  const session = await auth()
  if (!session?.user?.id) {
    // 개발 모드이거나 비인가 시 에러
    throw new Error('인증이 필요합니다. 다시 로그인해주세요.')
  }

  const [caller] = await db
    .select({
      id: profiles.id,
      name: profiles.name,
      nickname: profiles.nickname,
      role: profiles.role,
    })
    .from(profiles)
    .where(eq(profiles.id, session.user.id))

  if (!caller || (caller.role !== 'staff' && caller.role !== 'super_admin')) {
    throw new Error('관리자/스태프 권한이 필요합니다.')
  }

  return caller
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. 대시보드 통계 & 감사 로그
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminStats {
  todayVisits: number
  todayPointsIssued: number
  todayPointsDeducted: number
  activeTournaments: number
  totalMembers: number
  recentTransactions: PointTransaction[]
}

export async function getAdminDashboardStats(): Promise<AdminStats> {
  try {
    await requireStaffSession()

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    // 1) 오늘 트랜잭션 집계
    const todayTxs = await db
      .select({
        amount: pointTransactions.amount,
      })
      .from(pointTransactions)
      .where(gte(pointTransactions.createdAt, todayStart))

    let todayPointsIssued = 0
    let todayPointsDeducted = 0
    todayTxs.forEach((t) => {
      if (t.amount > 0) todayPointsIssued += t.amount
      else if (t.amount < 0) todayPointsDeducted += Math.abs(t.amount)
    })

    // 2) 진행 중 / 등록 중인 토너먼트 수
    const [{ activeTourneyCount }] = await db
      .select({ activeTourneyCount: count(tournaments.id) })
      .from(tournaments)
      .where(or(eq(tournaments.status, 'LIVE'), eq(tournaments.status, 'REGISTRATION')))

    // 3) 전체 회원 수
    const [{ memberCount }] = await db
      .select({ memberCount: count(profiles.id) })
      .from(profiles)

    // 4) 최근 포인트 트랜잭션 10건 (처리자/회원 정보 조인)
    const recentTxRows = await db
      .select({
        id: pointTransactions.id,
        userId: pointTransactions.userId,
        amount: pointTransactions.amount,
        balanceAfter: pointTransactions.balanceAfter,
        reason: pointTransactions.reason,
        description: pointTransactions.description,
        processedBy: pointTransactions.processedBy,
        createdAt: pointTransactions.createdAt,
        userName: profiles.name,
        userNickname: profiles.nickname,
      })
      .from(pointTransactions)
      .leftJoin(profiles, eq(pointTransactions.userId, profiles.id))
      .orderBy(desc(pointTransactions.createdAt))
      .limit(10)

    const recentTransactions: PointTransaction[] = recentTxRows.map((row) => ({
      id: row.id,
      user_id: row.userId,
      amount: row.amount,
      balance_after: row.balanceAfter,
      reason: row.reason,
      description: row.description || (row.userNickname ? `${row.userNickname} 회원` : '회원 포인트 변동'),
      processed_by: row.processedBy,
      created_at: row.createdAt.toISOString(),
    }))

    return {
      todayVisits: todayTxs.length,
      todayPointsIssued,
      todayPointsDeducted,
      activeTournaments: Number(activeTourneyCount),
      totalMembers: Number(memberCount),
      recentTransactions,
    }
  } catch (error) {
    console.error('getAdminDashboardStats error:', error)
    return {
      todayVisits: 0,
      todayPointsIssued: 0,
      todayPointsDeducted: 0,
      activeTournaments: 0,
      totalMembers: 0,
      recentTransactions: [],
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. 회원 QR 조회 & 검색
// ─────────────────────────────────────────────────────────────────────────────

export async function searchMemberByQr(query: string): Promise<Profile | null> {
  try {
    await requireStaffSession()

    const cleanQuery = query.trim()
    if (!cleanQuery) return null

    // UUID 포맷이면 qrToken 또는 id로 검색
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanQuery)

    let rows
    if (isUuid) {
      rows = await db
        .select()
        .from(profiles)
        .where(or(eq(profiles.qrToken, cleanQuery), eq(profiles.id, cleanQuery)))
        .limit(1)
    } else {
      // 닉네임, 이름, 또는 전화번호 부분 일치
      rows = await db
        .select()
        .from(profiles)
        .where(
          or(
            ilike(profiles.nickname, `%${cleanQuery}%`),
            ilike(profiles.name, `%${cleanQuery}%`),
            ilike(profiles.phone, `%${cleanQuery}%`)
          )
        )
        .limit(1)
    }

    if (!rows || rows.length === 0) return null

    const row = rows[0]
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
  } catch (error) {
    console.error('searchMemberByQr error:', error)
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. 직원 원터치 포인트 지급 / 차감 트랜잭션
// ─────────────────────────────────────────────────────────────────────────────

export interface ProcessPointParams {
  targetUserId: string
  amount: number
  reason: PointReason
  description?: string
  idempotencyKey?: string
}

export async function processStaffPointAction(
  params: ProcessPointParams
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    const caller = await requireStaffSession()
    const { targetUserId, amount, reason, description, idempotencyKey } = params

    if (!targetUserId) return { success: false, error: '대상 회원 정보가 없습니다.' }
    if (amount === 0) return { success: false, error: '포인트 금액이 0일 수 없습니다.' }

    let updatedBalance = 0

    await db.transaction(async (tx) => {
      // 0) idempotency 체크 — 트랜잭션 내부에서 수행해 TOCTOU 방지
      if (idempotencyKey) {
        const existing = await tx
          .select({ id: pointTransactions.id })
          .from(pointTransactions)
          .where(eq(pointTransactions.description, `[KEY:${idempotencyKey}]`))
          .limit(1)
        if (existing.length > 0) throw new Error('DUPLICATE_REQUEST')
      }

      // 1) 비관적 락으로 대상 회원 잔액 조회
      const [targetProfile] = await tx
        .select({
          id: profiles.id,
          totalPoints: profiles.totalPoints,
          nickname: profiles.nickname,
        })
        .from(profiles)
        .where(eq(profiles.id, targetUserId))
        .for('update')

      if (!targetProfile) {
        throw new Error('TARGET_NOT_FOUND')
      }

      const calculatedBalance = targetProfile.totalPoints + amount
      if (calculatedBalance < 0) {
        throw new Error('INSUFFICIENT_POINTS')
      }

      updatedBalance = calculatedBalance

      // 2) 프로필 잔액 업데이트
      await tx
        .update(profiles)
        .set({
          totalPoints: calculatedBalance,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, targetUserId))

      // 3) 포인트 원장 (point_transactions) 불변 레코드 삽입
      const txDescription = idempotencyKey
        ? `[KEY:${idempotencyKey}] ${description || ''}`
        : (description || `Staff ${caller.name || caller.nickname || '관리자'} 지급`)

      await tx.insert(pointTransactions).values({
        userId: targetUserId,
        amount,
        balanceAfter: calculatedBalance,
        reason,
        description: txDescription,
        processedBy: caller.id,
      })

      // 4) 관리자 감사 로그 기록
      await tx.insert(adminAuditLogs).values({
        adminId: caller.id,
        targetUserId,
        action: 'POINT_ADJUSTMENT',
        payload: {
          amount,
          reason,
          description,
          previousBalance: targetProfile.totalPoints,
          balanceAfter: calculatedBalance,
        },
      })
    })

    revalidatePath('/admin')
    revalidatePath('/admin/scanner')
    revalidatePath('/admin/members')
    revalidatePath('/ledger')

    return { success: true, newBalance: updatedBalance }
  } catch (error: unknown) {
    console.error('processStaffPointAction error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    if (msg === 'DUPLICATE_REQUEST') return { success: false, error: '이미 처리된 요청입니다. (중복 방지)' }
    if (msg === 'TARGET_NOT_FOUND') return { success: false, error: '회원 정보를 찾을 수 없습니다.' }
    if (msg === 'INSUFFICIENT_POINTS') return { success: false, error: '차감할 포인트가 부족합니다. (잔액 부족)' }
    return { success: false, error: msg || '포인트 처리에 실패했습니다.' }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. 회원 관리 (목록 조회 & 등급 변경)
// ─────────────────────────────────────────────────────────────────────────────

export async function getAdminMembers(params?: {
  search?: string
  tier?: string
}): Promise<Profile[]> {
  try {
    await requireStaffSession()

    let query = db.select().from(profiles).$dynamic()

    const conditions = []
    if (params?.tier && params.tier !== 'ALL') {
      conditions.push(eq(profiles.tier, params.tier as UserTier))
    }
    if (params?.search && params.search.trim()) {
      const s = `%${params.search.trim()}%`
      conditions.push(
        or(
          ilike(profiles.name, s),
          ilike(profiles.nickname, s),
          ilike(profiles.phone, s),
          ilike(profiles.email, s)
        )
      )
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions))
    }

    const rows = await query.orderBy(desc(profiles.createdAt))

    return rows.map((row) => ({
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
    }))
  } catch (error) {
    console.error('getAdminMembers error:', error)
    return []
  }
}

export async function updateMemberTier(params: {
  targetUserId: string
  newTier: UserTier
}): Promise<{ success: boolean; error?: string }> {
  try {
    const caller = await requireStaffSession()
    const { targetUserId, newTier } = params

    await db.transaction(async (tx) => {
      const [prev] = await tx
        .select({ tier: profiles.tier })
        .from(profiles)
        .where(eq(profiles.id, targetUserId))

      if (!prev) throw new Error('TARGET_NOT_FOUND')

      await tx
        .update(profiles)
        .set({ tier: newTier, updatedAt: new Date() })
        .where(eq(profiles.id, targetUserId))

      await tx.insert(adminAuditLogs).values({
        adminId: caller.id,
        targetUserId,
        action: 'TIER_CHANGE',
        payload: {
          previousTier: prev.tier,
          newTier,
        },
      })
    })

    revalidatePath('/admin/members')
    return { success: true }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg || '등급 변경에 실패했습니다.' }
  }
}

export async function updateMemberRole(params: {
  targetUserId: string
  newRole: UserRole
}): Promise<{ success: boolean; error?: string }> {
  try {
    const caller = await requireStaffSession()
    const { targetUserId, newRole } = params

    // 최고관리자 또는 관리자 본인의 권한은 안전하게 보존
    if (caller.id === targetUserId && newRole === 'user' && caller.role === 'super_admin') {
      return { success: false, error: '최고관리자 본인의 권한은 해제할 수 없습니다.' }
    }

    await db.transaction(async (tx) => {
      const [prev] = await tx
        .select({ role: profiles.role, nickname: profiles.nickname })
        .from(profiles)
        .where(eq(profiles.id, targetUserId))

      if (!prev) throw new Error('회원을 찾을 수 없습니다.')

      await tx
        .update(profiles)
        .set({ role: newRole, updatedAt: new Date() })
        .where(eq(profiles.id, targetUserId))

      await tx.insert(adminAuditLogs).values({
        adminId: caller.id,
        targetUserId,
        action: 'ROLE_CHANGE',
        payload: {
          previousRole: prev.role,
          newRole,
        },
      })
    })

    revalidatePath('/admin/members')
    revalidatePath('/admin')
    return { success: true }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg || '관리자 권한 변경에 실패했습니다.' }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. 토너먼트 관리 (생성, 상태 전환, 상금 지급)
// ─────────────────────────────────────────────────────────────────────────────

export async function createAdminTournament(data: {
  title: string
  description?: string
  startTime: string
  entryPointCost: number
  totalPrizePoints: number
  maxPlayers: number
}): Promise<{ success: boolean; tournamentId?: string; error?: string }> {
  try {
    const caller = await requireStaffSession()

    const [created] = await db
      .insert(tournaments)
      .values({
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        entryPointCost: data.entryPointCost,
        totalPrizePoints: data.totalPrizePoints,
        maxPlayers: data.maxPlayers || 30,
        status: 'REGISTRATION',
      })
      .returning({ id: tournaments.id })

    await db.insert(adminAuditLogs).values({
      adminId: caller.id,
      action: 'TOURNAMENT_CREATE',
      payload: { ...data, tournamentId: created.id },
    })

    revalidatePath('/admin/tournaments')
    revalidatePath('/tournaments')
    return { success: true, tournamentId: created.id }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg || '토너먼트 개설에 실패했습니다.' }
  }
}

export async function updateAdminTournamentStatus(params: {
  tournamentId: string
  status: TourneyStatus
}): Promise<{ success: boolean; error?: string }> {
  try {
    const caller = await requireStaffSession()

    await db
      .update(tournaments)
      .set({ status: params.status })
      .where(eq(tournaments.id, params.tournamentId))

    await db.insert(adminAuditLogs).values({
      adminId: caller.id,
      action: 'TOURNAMENT_STATUS_CHANGE',
      payload: params,
    })

    revalidatePath('/admin/tournaments')
    revalidatePath('/tournaments')
    return { success: true }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg || '상태 변경에 실패했습니다.' }
  }
}

export interface AdminParticipantItem {
  id: string
  userId: string
  name: string
  nickname: string
  phone: string
  finalRank: number | null
  prizePointsAwarded: number
  registeredAt: string
}

export async function getAdminTournamentParticipants(
  tournamentId: string
): Promise<AdminParticipantItem[]> {
  try {
    await requireStaffSession()

    const rows = await db
      .select({
        id: tournamentParticipants.id,
        userId: tournamentParticipants.userId,
        finalRank: tournamentParticipants.finalRank,
        prizePointsAwarded: tournamentParticipants.prizePointsAwarded,
        registeredAt: tournamentParticipants.registeredAt,
        name: profiles.name,
        nickname: profiles.nickname,
        phone: profiles.phone,
      })
      .from(tournamentParticipants)
      .leftJoin(profiles, eq(tournamentParticipants.userId, profiles.id))
      .where(eq(tournamentParticipants.tournamentId, tournamentId))
      .orderBy(tournamentParticipants.registeredAt)

    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      name: r.name || '',
      nickname: r.nickname || '익명',
      phone: r.phone || '',
      finalRank: r.finalRank,
      prizePointsAwarded: r.prizePointsAwarded || 0,
      registeredAt: r.registeredAt.toISOString(),
    }))
  } catch (error) {
    console.error('getAdminTournamentParticipants error:', error)
    return []
  }
}

export async function distributeAdminTournamentPrizes(params: {
  tournamentId: string
  rankings: Array<{ userId: string; rank: number; prizePoints: number }>
}): Promise<{ success: boolean; error?: string }> {
  try {
    const caller = await requireStaffSession()
    const { tournamentId, rankings } = params

    await db.transaction(async (tx) => {
      // 1) 토너먼트 상태 확인
      const [tourney] = await tx
        .select()
        .from(tournaments)
        .where(eq(tournaments.id, tournamentId))

      if (!tourney) throw new Error('TOURNAMENT_NOT_FOUND')

      // 2) 참가자 순위 및 상금 부여 & 유저 잔액 지급
      for (const item of rankings) {
        // 참가자 테이블 업데이트
        await tx
          .update(tournamentParticipants)
          .set({
            finalRank: item.rank,
            prizePointsAwarded: item.prizePoints,
          })
          .where(
            and(
              eq(tournamentParticipants.tournamentId, tournamentId),
              eq(tournamentParticipants.userId, item.userId)
            )
          )

        // 상금이 있는 경우 유저 프로필 잔액 증가 + 원장 기록
        if (item.prizePoints > 0) {
          const [userProfile] = await tx
            .select({ totalPoints: profiles.totalPoints })
            .from(profiles)
            .where(eq(profiles.id, item.userId))
            .for('update')

          if (userProfile) {
            const newBal = userProfile.totalPoints + item.prizePoints
            await tx
              .update(profiles)
              .set({ totalPoints: newBal, updatedAt: new Date() })
              .where(eq(profiles.id, item.userId))

            await tx.insert(pointTransactions).values({
              userId: item.userId,
              amount: item.prizePoints,
              balanceAfter: newBal,
              reason: 'TOURNAMENT_WIN',
              description: `[${tourney.title}] ${item.rank}위 상금 지급`,
              processedBy: caller.id,
            })
          }
        }
      }

      // 3) 토너먼트 완료 처리
      await tx
        .update(tournaments)
        .set({ status: 'COMPLETED' })
        .where(eq(tournaments.id, tournamentId))

      // 4) 감사 로그
      await tx.insert(adminAuditLogs).values({
        adminId: caller.id,
        action: 'TOURNAMENT_PRIZE_DISTRIBUTION',
        payload: { tournamentId, rankings },
      })
    })

    revalidatePath('/admin/tournaments')
    revalidatePath('/tournaments')
    revalidatePath('/ledger')
    return { success: true }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg || '상금 배분에 실패했습니다.' }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. 공지 / 이벤트 관리 (생성, 수정, 삭제)
// ─────────────────────────────────────────────────────────────────────────────

export async function createAdminNotice(data: {
  category: NoticeCategory
  title: string
  content: string
  imageUrl?: string
  isPinned?: boolean
}): Promise<{ success: boolean; error?: string }> {
  try {
    const caller = await requireStaffSession()

    await db.insert(noticesEvents).values({
      category: data.category,
      title: data.title,
      content: data.content,
      imageUrl: data.imageUrl,
      isPinned: data.isPinned || false,
      authorId: caller.id,
    })

    await db.insert(adminAuditLogs).values({
      adminId: caller.id,
      action: 'NOTICE_CREATE',
      payload: data,
    })

    revalidatePath('/admin/notices')
    revalidatePath('/notices')
    return { success: true }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg || '공지 등록에 실패했습니다.' }
  }
}

export async function updateAdminNotice(data: {
  id: string
  category?: NoticeCategory
  title?: string
  content?: string
  imageUrl?: string
  isPinned?: boolean
}): Promise<{ success: boolean; error?: string }> {
  try {
    const caller = await requireStaffSession()

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.id)

    if (!isUuid) {
      // Mock / fallback 데이터인 경우 실제 DB에 새 레코드로 생성
      await db.insert(noticesEvents).values({
        category: data.category || 'NOTICE',
        title: data.title || '공지사항',
        content: data.content || '',
        imageUrl: data.imageUrl,
        isPinned: data.isPinned ?? false,
        authorId: caller.id,
      })
    } else {
      await db
        .update(noticesEvents)
        .set({
          ...(data.category ? { category: data.category } : {}),
          ...(data.title ? { title: data.title } : {}),
          ...(data.content ? { content: data.content } : {}),
          imageUrl: data.imageUrl,
          isPinned: data.isPinned ?? false,
        })
        .where(eq(noticesEvents.id, data.id))
    }

    await db.insert(adminAuditLogs).values({
      adminId: caller.id,
      action: 'NOTICE_UPDATE',
      payload: data,
    })

    revalidatePath('/admin/notices')
    revalidatePath('/notices')
    revalidatePath('/')
    return { success: true }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg || '공지 수정에 실패했습니다.' }
  }
}

export async function deleteAdminNotice(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const caller = await requireStaffSession()

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    if (isUuid) {
      await db.delete(noticesEvents).where(eq(noticesEvents.id, id))
    }

    await db.insert(adminAuditLogs).values({
      adminId: caller.id,
      action: 'NOTICE_DELETE',
      payload: { id },
    })

    revalidatePath('/admin/notices')
    revalidatePath('/notices')
    revalidatePath('/')
    return { success: true }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg || '공지 삭제에 실패했습니다.' }
  }
}
