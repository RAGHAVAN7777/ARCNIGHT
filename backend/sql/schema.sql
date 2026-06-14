create extension if not exists pgcrypto;

create table if not exists users (
  user_id text primary key,
  created_at timestamptz not null default now()
);

alter table users disable row level security;

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users (user_id) on delete cascade,
  role text not null,
  message text not null,
  language text not null default 'en',
  created_at timestamptz not null default now()
);

create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users (user_id) on delete cascade,
  score integer not null,
  tier text not null,
  percentile text not null,
  loan_eligible_amount numeric not null,
  factors jsonb not null,
  breakdown jsonb not null,
  insights jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users (user_id) on delete cascade,
  filename text not null,
  status text not null,
  extracted_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
