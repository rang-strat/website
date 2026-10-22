create table public.website_leads (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique,
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 254),
  company text not null check (char_length(company) between 1 and 160),
  phone text not null default '' check (char_length(phone) <= 40),
  job_title text not null default '' check (char_length(job_title) <= 120),
  service_interest text not null default '' check (service_interest in ('', 'Data Strategy & Advisory', 'Data Architecture & Data Pipeline Design', 'Implementation & Delivery', 'AI Readiness', 'Other')),
  message text not null check (char_length(message) between 10 and 5000),
  contact_consent boolean not null default true check (contact_consent),
  marketing_opt_in boolean not null default false,
  source text not null default 'website_contact' check (source = 'website_contact'),
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed')),
  notification_status text not null default 'pending' check (notification_status in ('pending', 'sent', 'failed')),
  notification_id text,
  notified_at timestamptz
);

create index website_leads_created_at_idx on public.website_leads (created_at desc);
create index website_leads_notification_idx on public.website_leads (notification_status) where notification_status <> 'sent';

create table public.website_contact_limits (
  ip_hash text primary key check (ip_hash ~ '^[a-f0-9]{64}$'),
  window_started_at timestamptz not null default now(),
  attempts integer not null default 1 check (attempts > 0)
);

alter table public.website_leads enable row level security;
alter table public.website_contact_limits enable row level security;
revoke all on public.website_leads, public.website_contact_limits from public, anon, authenticated;
grant select, insert, update, delete on public.website_leads, public.website_contact_limits to service_role;

create function public.capture_website_lead(
  p_submission_id uuid,
  p_name text,
  p_email text,
  p_company text,
  p_phone text,
  p_job_title text,
  p_service_interest text,
  p_message text,
  p_marketing_opt_in boolean,
  p_ip_hash text
) returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  attempt_count integer;
  captured public.website_leads;
begin
  delete from public.website_contact_limits where window_started_at < now() - interval '1 day';
  insert into public.website_contact_limits as limits (ip_hash)
  values (p_ip_hash)
  on conflict (ip_hash) do update set
    window_started_at = case when limits.window_started_at < now() - interval '15 minutes' then now() else limits.window_started_at end,
    attempts = case when limits.window_started_at < now() - interval '15 minutes' then 1 else limits.attempts + 1 end
  returning attempts into attempt_count;

  if attempt_count > 5 then
    raise exception 'contact_rate_limit' using errcode = 'P0001';
  end if;

  insert into public.website_leads (
    submission_id, name, email, company, phone, job_title,
    service_interest, message, marketing_opt_in
  ) values (
    p_submission_id, p_name, p_email, p_company, p_phone, p_job_title,
    p_service_interest, p_message, p_marketing_opt_in
  ) on conflict (submission_id) do nothing
  returning * into captured;

  if captured.id is null then
    select * into strict captured from public.website_leads where submission_id = p_submission_id;
  end if;

  return to_jsonb(captured);
end;
$$;

revoke all on function public.capture_website_lead(uuid, text, text, text, text, text, text, text, boolean, text) from public, anon, authenticated;
grant execute on function public.capture_website_lead(uuid, text, text, text, text, text, text, text, boolean, text) to service_role;
