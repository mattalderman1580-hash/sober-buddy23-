import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { sanitizeHandle, sanitizePublic } from "@/lib/sanitize";

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

const PostInput = z.object({
  kind: z.enum(["request", "encourage"]),
  displayName: z.string().min(1).max(40),
  body: z.string().min(1).max(400),
});

const ReplyInput = z.object({
  postId: z.number().int().positive(),
  displayName: z.string().min(1).max(40),
  body: z.string().min(1).max(400),
});

function asIso(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return String(value ?? "");
}

export const listWall = createServerFn({ method: "GET" }).handler(async (): Promise<WallPost[]> => {
  const sql = await getSql();
  const posts = await sql<{
    id: number;
    kind: WallKind;
    display_name: string;
    body: string;
    created_at: string;
    amen_count: number;
  }>`select id, kind, display_name, body, created_at, amen_count from prayer_posts order by created_at desc limit 48`;

  if (!posts.length) return [];

  const replies = await sql<{
    id: number;
    post_id: number;
    display_name: string;
    body: string;
    created_at: string;
  }>`select id, post_id, display_name, body, created_at from prayer_replies order by created_at asc limit 200`;

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
  .validator((input: unknown) => PostInput.parse(input))
  .handler(async ({ data }): Promise<{ ok: true; id: number } | { ok: false; error: string }> => {
    const displayName = sanitizeHandle(data.displayName);
    const body = sanitizePublic(data.body);
    if (displayName.length < 2) return { ok: false, error: "Use a short first name or handle." };
    if (body.length < 8) return { ok: false, error: "Write a little more, without personal details." };

    const sql = await getSql();
    const rows = await sql<{ id: number }>`
      insert into prayer_posts (kind, display_name, body)
      values (${data.kind}, ${displayName}, ${body})
      returning id
    `;
    const id = rows[0]?.id;
    if (!id) return { ok: false, error: "Could not post." };
    return { ok: true, id };
  });

export const createWallReply = createServerFn({ method: "POST" })
  .validator((input: unknown) => ReplyInput.parse(input))
  .handler(async ({ data }): Promise<{ ok: true } | { ok: false; error: string }> => {
    const displayName = sanitizeHandle(data.displayName);
    const body = sanitizePublic(data.body);
    if (displayName.length < 2) return { ok: false, error: "Use a short first name or handle." };
    if (body.length < 8) return { ok: false, error: "Write a little more, without personal details." };

    const sql = await getSql();
    const exists = await sql<{ id: number }>`select id from prayer_posts where id = ${data.postId} limit 1`;
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
