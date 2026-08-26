import {
  pgTable,
  pgEnum,
  uuid,
  text,
  bigint,
  integer,
  boolean,
  timestamp,
  jsonb,
  unique,
  primaryKey,
} from 'drizzle-orm/pg-core'
import type { AdapterAccount } from 'next-auth/adapters'

// ─── ENUMs ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['user', 'staff', 'super_admin'])
export const userTierEnum = pgEnum('user_tier', ['NORMAL', 'VIP', 'VVIP', 'ROYAL'])
export const pointReasonEnum = pgEnum('point_reason', [
  'FOUR_OF_A_KIND',
  'STRAIGHT_FLUSH',
  'ROYAL_FLUSH',
  'TOURNAMENT_WIN',
  'TOURNAMENT_BUYIN',
  'EVENT_BONUS',
  'ADMIN_ADJUSTMENT',
  'POINT_SHOP_USAGE',
])
export const tourneyStatusEnum = pgEnum('tourney_status', [
  'UPCOMING',
  'REGISTRATION',
  'LIVE',
  'COMPLETED',
  'CANCELLED',
])

// ─── profiles (NextAuth users 호환) ──────────────────────────────────────────

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  // NextAuth 필수 필드
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  // 게임 필드
  nickname: text('nickname').unique(),
  phone: text('phone').unique(),
  role: userRoleEnum('role').default('user').notNull(),
  tier: userTierEnum('tier').default('NORMAL').notNull(),
  qrToken: uuid('qr_token').defaultRandom().unique().notNull(),
  totalPoints: bigint('total_points', { mode: 'number' }).default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── accounts (NextAuth OAuth 계정 연결) ─────────────────────────────────────

export const accounts = pgTable(
  'accounts',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    // @auth/drizzle-adapter가 요구하는 snake_case 필드명
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
)

// ─── verificationTokens (NextAuth 이메일 인증용) ──────────────────────────────

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
)

// ─── point_transactions (포인트 원장 — 불변) ─────────────────────────────────

export const pointTransactions = pgTable('point_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  balanceAfter: bigint('balance_after', { mode: 'number' }).notNull(),
  reason: pointReasonEnum('reason').notNull(),
  description: text('description'),
  processedBy: uuid('processed_by')
    .notNull()
    .references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── tournaments ─────────────────────────────────────────────────────────────

export const tournaments = pgTable('tournaments', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  entryPointCost: bigint('entry_point_cost', { mode: 'number' }).default(0).notNull(),
  totalPrizePoints: bigint('total_prize_points', { mode: 'number' }).default(0).notNull(),
  maxPlayers: integer('max_players').default(30),
  status: tourneyStatusEnum('status').default('UPCOMING').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── tournament_participants ──────────────────────────────────────────────────

export const tournamentParticipants = pgTable(
  'tournament_participants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tournamentId: uuid('tournament_id')
      .notNull()
      .references(() => tournaments.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    finalRank: integer('final_rank'),
    prizePointsAwarded: bigint('prize_points_awarded', { mode: 'number' }).default(0),
    registeredAt: timestamp('registered_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique().on(t.tournamentId, t.userId)]
)

// ─── notices_events ───────────────────────────────────────────────────────────

export const noticesEvents = pgTable('notices_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: text('category', { enum: ['NOTICE', 'EVENT', 'RULE'] }).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  isPinned: boolean('is_pinned').default(false),
  authorId: uuid('author_id')
    .notNull()
    .references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── admin_audit_logs ─────────────────────────────────────────────────────────

export const adminAuditLogs = pgTable('admin_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminId: uuid('admin_id')
    .notNull()
    .references(() => profiles.id),
  targetUserId: uuid('target_user_id').references(() => profiles.id),
  action: text('action').notNull(),
  payload: jsonb('payload'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── 타입 추론 ─────────────────────────────────────────────────────────────────

export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
export type PointTransaction = typeof pointTransactions.$inferSelect
export type NewPointTransaction = typeof pointTransactions.$inferInsert
export type Tournament = typeof tournaments.$inferSelect
export type NewTournament = typeof tournaments.$inferInsert
export type TournamentParticipant = typeof tournamentParticipants.$inferSelect
export type NoticeEvent = typeof noticesEvents.$inferSelect
export type NewNoticeEvent = typeof noticesEvents.$inferInsert
export type AdminAuditLog = typeof adminAuditLogs.$inferSelect
