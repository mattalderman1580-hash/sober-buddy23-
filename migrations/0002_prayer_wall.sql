create table if not exists prayer_posts (
  id serial primary key,
  kind text not null check (kind in ('request', 'encourage')),
  display_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists prayer_posts_created_idx on prayer_posts (created_at desc);

create table if not exists prayer_replies (
  id serial primary key,
  post_id integer not null references prayer_posts(id) on delete cascade,
  display_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists prayer_replies_post_idx on prayer_replies (post_id);
