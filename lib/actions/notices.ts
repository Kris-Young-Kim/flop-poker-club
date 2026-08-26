'use server'

import { db } from '@/lib/db'
import { noticesEvents } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import type { NoticeEvent, NoticeCategory } from '@/types/database.types'

export async function getNotices(category?: NoticeCategory): Promise<NoticeEvent[]> {
  const rows = await db
    .select()
    .from(noticesEvents)
    .where(category ? eq(noticesEvents.category, category) : undefined)
    .orderBy(desc(noticesEvents.isPinned), desc(noticesEvents.createdAt))

  return rows.map((row) => ({
    id: row.id,
    category: row.category as NoticeCategory,
    title: row.title,
    content: row.content,
    image_url: row.imageUrl,
    is_pinned: row.isPinned ?? false,
    author_id: row.authorId,
    created_at: row.createdAt.toISOString(),
  }))
}
