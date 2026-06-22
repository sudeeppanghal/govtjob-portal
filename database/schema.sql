-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. NOTIFICATIONS TABLE
create table if not exists public.notifications (
    id uuid default gen_random_uuid() primary key,
    source_name varchar(100) not null,
    source_url text not null,
    category varchar(50) not null, -- 'Job', 'Result', 'Admit Card', 'Answer Key', 'Sarkari Yojana', 'Scholarship'
    title text not null,
    article_title text not null,
    slug varchar(255) not null,
    extracted_json jsonb not null default '{}'::jsonb,
    article_content text not null,
    meta_description varchar(255) not null,
    schemas jsonb not null default '{}'::jsonb,
    status varchar(50) default 'published' not null, -- 'draft', 'published'
    last_date date,
    qualifications text[] not null default '{}'::text[],
    states text[] not null default '{}'::text[],
    image_url text,
    is_updated boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    constraint notifications_source_url_key unique (source_url),
    constraint notifications_slug_key unique (slug)
);

-- Full-Text Search GIN Index for fast search across title & content
alter table public.notifications add column if not exists fts tsvector generated always as (
    to_tsvector('english', coalesce(article_title, '') || ' ' || coalesce(article_content, ''))
) stored;

create index if not exists notifications_fts_idx on public.notifications using gin (fts);
create index if not exists notifications_category_idx on public.notifications (category);
create index if not exists notifications_last_date_idx on public.notifications (last_date);

-- 2. CRAWLS LOG TABLE
create table if not exists public.crawls (
    id uuid default gen_random_uuid() primary key,
    started_at timestamp with time zone default timezone('utc'::text, now()) not null,
    completed_at timestamp with time zone,
    status varchar(50) not null, -- 'success', 'failed'
    new_notices integer default 0 not null,
    tokens_used integer default 0 not null,
    error_log text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists crawls_created_at_idx on public.crawls (created_at desc);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.notifications enable row level security;
alter table public.crawls enable row level security;

-- Policies for public.notifications
create policy "Allow public read access to published notifications"
    on public.notifications for select
    using (status = 'published');

create policy "Allow all actions for authenticated users on notifications"
    on public.notifications for all
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

-- Policies for public.crawls
create policy "Allow authenticated users to view crawl logs"
    on public.crawls for select
    using (auth.role() = 'authenticated');

create policy "Allow all actions for service role on crawls"
    on public.crawls for all
    using (true)
    with check (true);

-- Auto-update updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger trigger_handle_updated_at
    before update on public.notifications
    for each row
    execute function public.handle_updated_at();

-- 4. PAGE VIEWS (ANALYTICS) TABLE
create table if not exists public.page_views (
    id bigserial primary key,
    slug varchar(255) not null,
    referrer text,
    user_agent text,
    ip_hash varchar(64),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists page_views_slug_idx on public.page_views (slug);
create index if not exists page_views_referrer_idx on public.page_views (referrer);
create index if not exists page_views_created_at_idx on public.page_views (created_at desc);

-- Enable RLS on page_views
alter table public.page_views enable row level security;

-- Policies for public.page_views
create policy "Allow public insert to page views"
    on public.page_views for insert
    with check (true);

create policy "Allow authenticated select to page views"
    on public.page_views for select
    using (auth.role() = 'authenticated');
