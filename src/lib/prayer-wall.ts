import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { sanitizeHandle, sanitizePublic } from "@/lib/sanitize";
import {
  checkWallPrivacy,
  POST_LIMIT_DAILY,
  POST_LIMIT_SHORT,
  POST_LIMIT_SHORT_MINUTES,
  REPORT_HIDE_THRESHOLD,
  WALL_MAX_BODY,
} from "@/lib/wall-safety";
import { wallIdentityMiddleware } from "@/lib/wall-identity";

export type WallKind = "request" | "encourage";

export interface WallPost {
  id: number;
  kind: WallKind;
  displayName: string;
  body: string;
  createdAt: string;
  amenCount: number;
  replies: WallReply[];
}

export interface WallReply {
  id: number;
  postId: number;
  displayName: string;
  body: string;
  createdAt: string;
}

const DeviceId = z.string().min(8).max(64).regex(/^[a-z0-9-]+$/i);

const PostInput = z.object({
  kind: z.enum(["request", "encourage"]),
  displayName: z.string().min(1).max(40),
  body: z.string().min(1).max(2000),
  deviceId: DeviceId,
});

const ReplyInput = z.object({
  postId: z.number().int().positive(),
  displayName: z.string().min(1).max(40),
  body: z.string().min(1).max(2000),
});

const ListInput = z.object({ deviceId: DeviceId.optional() }).optional();

const ReportInput = z.object({
  postId: z.number().int().positive(),
  deviceId: DeviceId,
});

/** Opaque per-person key: signed-in user when available, else this device. */
function actorKey(userId: string | null, deviceId: string | undefined): string | null {
  if (userId) return `u:${userId}`;
  if (deviceId) return `d:${deviceId}`;
  return null;
}

/** Server-side privacy + length gate shared by posts and replies. */
function bodyProblem(raw: string): string | null {
  if (raw.trim().length > WALL_MAX_BODY) {
    return `Keep it to ${WALL_MAX_BODY} characters or fewer.`;
  }
  const check = checkWallPrivacy(raw);
  if (check.blocked.length) return check.blocked[0]!;
  return null;
}

function asIso(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return String(value ?? "");
}

export const listWall = createServerFn({ method: "GET" })
  .middleware([wallIdentityMiddleware])
  .validator((input: unknown) => ListInput.parse(input))
  .handler(async ({ data, context }): Promise<WallPost[]> => {
  const sql = await getSql();
  // Hide posts that reached the report threshold, plus anything this person reported.
  const viewer = actorKey(context.userId, data?.deviceId) ?? "";
  const posts = await sql<{
    id: number;
    kind: WallKind;
    display_name: string;
    body: string;
    created_at: string;
    amen_count: number;
  }>`
    select p.id, p.kind, p.display_name, p.body, p.created_at, p.amen_count
    from prayer_posts p
    where p.report_count < ${REPORT_HIDE_THRESHOLD}
      and not exists (
        select 1 from prayer_reports r where r.post_id = p.id and r.reporter_key = ${viewer}
      )
    order by p.created_at desc
    limit 48
  `;

  if (!posts.length) return [];

  const replies = await sql<{
    id: number;
    post_id: number;
    display_name: string;
    body: string;
    created_at: string;
  }>`
    select id, post_id, display_name, body, created_at from prayer_replies
    where post_id in (
      select p.id from prayer_posts p
      where p.report_count < ${REPORT_HIDE_THRESHOLD}
      order by p.created_at desc
      limit 48
    )
    order by created_at asc
    limit 400
  `;

  const byPost = new Map<number, WallReply[]>();
  for (const r of replies) {
    const list = byPost.get(r.post_id) ?? [];
    list.push({
      id: r.id,
      postId: r.post_id,
      displayName: r.display_name,
      body: r.body,
      createdAt: asIso(r.created_at),
    });
    byPost.set(r.post_id, list);
  }

  return posts.map((p) => ({
    id: p.id,
    kind: p.kind,
    displayName: p.display_name,
    body: p.body,
    createdAt: asIso(p.created_at),
    amenCount: Number(p.amen_count ?? 0),
    replies: byPost.get(p.id) ?? [],
  }));
});

export const createWallPost = createServerFn({ method: "POST" })
  .middleware([wallIdentityMiddleware])
  .validator((input: unknown) => PostInput.parse(input))
  .handler(async ({ data, context }): Promise<{ ok: true; id: number } | { ok: false; error: string }> => {
    const problem = bodyProblem(data.body);
    if (problem) return { ok: false, error: problem };
    const displayName = sanitizeHandle(data.displayName);
    const body = sanitizePublic(data.body);
    if (displayName.length < 2) return { ok: false, error: "Use a short first name or handle." };
    if (body.length < 8) return { ok: false, error: "Write a little more, without personal details." };

    const author = actorKey(context.userId, data.deviceId)!;
    const sql = await getSql();
    const counts = await sql<{ recent: number; today: number }>`
      select
        count(*) filter (
          where created_at > now() - make_interval(mins => ${POST_LIMIT_SHORT_MINUTES}::int)
        )::int as recent,
        count(*)::int as today
      from prayer_posts
      where author_key = ${author} and created_at > now() - interval '24 hours'
    `;
    const recent = Number(counts[0]?.recent ?? 0);
    const today = Number(counts[0]?.today ?? 0);
    if (recent >= POST_LIMIT_SHORT) {
      return {
        ok: false,
        error: `You've shared ${POST_LIMIT_SHORT} posts in the last ${POST_LIMIT_SHORT_MINUTES} minutes. Take a breath and try again in a little while.`,
      };
    }
    if (today >= POST_LIMIT_DAILY) {
      return {
        ok: false,
        error: "You've reached today's posting limit. The circle is still praying. Try again tomorrow.",
      };
    }

    const rows = await sql<{ id: number }>`
      insert into prayer_posts (kind, display_name, body, author_key)
      values (${data.kind}, ${displayName}, ${body}, ${author})
      returning id
    `;
    const id = rows[0]?.id;
    if (!id) return { ok: false, error: "Could not post." };
    return { ok: true, id };
  });

export const createWallReply = createServerFn({ method: "POST" })
  .validator((input: unknown) => ReplyInput.parse(input))
  .handler(async ({ data }): Promise<{ ok: true } | { ok: false; error: string }> => {
    const problem = bodyProblem(data.body);
    if (problem) return { ok: false, error: problem };
    const displayName = sanitizeHandle(data.displayName);
    const body = sanitizePublic(data.body);
    if (displayName.length < 2) return { ok: false, error: "Use a short first name or handle." };
    if (body.length < 8) return { ok: false, error: "Write a little more, without personal details." };

    const sql = await getSql();
    const exists = await sql<{ id: number }>`
      select id from prayer_posts
      where id = ${data.postId} and report_count < ${REPORT_HIDE_THRESHOLD}
      limit 1
    `;
    if (!exists[0]) return { ok: false, error: "That post is gone." };

    await sql`
      insert into prayer_replies (post_id, display_name, body)
      values (${data.postId}, ${displayName}, ${body})
    `;
    return { ok: true };
  });

const AmenInput = z.object({
  postId: z.number().int().positive(),
});

export const amenWallPost = createServerFn({ method: "POST" })
  .validator((input: unknown) => AmenInput.parse(input))
  .handler(async ({ data }): Promise<{ ok: true; count: number } | { ok: false; error: string }> => {
    const sql = await getSql();
    const rows = await sql<{ amen_count: number }>`
      update prayer_posts
      set amen_count = amen_count + 1
      where id = ${data.postId}
      returning amen_count
    `;
    const count = rows[0]?.amen_count;
    if (count === undefined) return { ok: false, error: "That post is gone." };
    return { ok: true, count: Number(count) };
  });

export const reportWallPost = createServerFn({ method: "POST" })
  .middleware([wallIdentityMiddleware])
  .validator((input: unknown) => ReportInput.parse(input))
  .handler(async ({ data, context }): Promise<{ ok: true } | { ok: false; error: string }> => {
    const reporter = actorKey(context.userId, data.deviceId)!;
    const sql = await getSql();
    const exists = await sql<{ id: number }>`select id from prayer_posts where id = ${data.postId} limit 1`;
    if (!exists[0]) return { ok: false, error: "That post is gone." };

    // One report per person per post; a repeat report is a quiet no-op.
    const inserted = await sql<{ post_id: number }>`
      insert into prayer_reports (post_id, reporter_key)
      values (${data.postId}, ${reporter})
      on conflict (post_id, reporter_key) do nothing
      returning post_id
    `;
    if (inserted.length) {
      await sql`
        update prayer_posts
        set report_count = (select count(*) from prayer_reports where post_id = ${data.postId})
        where id = ${data.postId}
      `;
    }
    return { ok: true };
  });
