-- Prayer Wall safety: community reports + per-author rate limiting.
--
-- author_key / reporter_key are opaque strings: "u:<user id>" when the poster is
-- signed in, otherwise "d:<random device id>". They are never returned to clients.

alter table prayer_posts add column if not exists author_key text;
alter table prayer_posts add column if not exists report_count integer not null default 0;

create index if not exists prayer_posts_author_created_idx
  on prayer_posts (author_key, created_at desc);

create table if not exists prayer_reports (
  post_id integer not null references prayer_posts(id) on delete cascade,
  reporter_key text not null,
  created_at timestamptz not null default now(),
  primary key (post_id, reporter_key)
);

create index if not exists prayer_reports_reporter_idx on prayer_reports (reporter_key);
