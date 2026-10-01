-- Hissa vendor side. Run after 0001_hissa.sql (Supabase → SQL Editor).
-- A vendor is a player who owns a stall. In play mode, claims and new stalls are auto-approved.

alter table public.stalls add column owner_id uuid references public.profiles (id) on delete set null;
create unique index stalls_one_per_owner on public.stalls (owner_id) where owner_id is not null;

-- Redeem codes: the customer shows a 6-digit code; credit is only spent when the vendor accepts it.
create table public.redeem_codes (
  id bigint generated always as identity primary key,
  code text not null check (code ~ '^[0-9]{6}$'),
  stall_id text not null references public.stalls (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  amount int not null check (amount > 0),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '15 minutes',
  used_at timestamptz
);
create unique index redeem_codes_open on public.redeem_codes (code) where used_at is null;
alter table public.redeem_codes enable row level security;
create policy "see own codes" on public.redeem_codes for select using (profile_id = public.my_profile_id());

-- ───────────── Customer: ask for a code (replaces the instant-redeem version) ─────────────

create or replace function public.redeem_credit(p_stall text, p_amount int)
returns text language plpgsql security definer set search_path = public as $$
declare
  me uuid := my_profile_id();
  available int;
  reserved int;
  new_code text;
begin
  if me is null then raise exception 'Sign in first'; end if;
  if p_amount <= 0 then raise exception 'Choose an amount'; end if;

  delete from redeem_codes where used_at is null and expires_at < now();
  select coalesce(sum(amount), 0) into available
    from wallet_txns where profile_id = me and stall_id = p_stall and kind in ('credit', 'redeemed');
  select coalesce(sum(amount), 0) into reserved
    from redeem_codes where profile_id = me and stall_id = p_stall and used_at is null;
  if available - reserved < p_amount then
    raise exception 'Only ₹% of treats left here', greatest(available - reserved, 0);
  end if;

  loop
    new_code := lpad((floor(random() * 1000000))::int::text, 6, '0');
    exit when not exists (select 1 from redeem_codes where code = new_code and used_at is null);
  end loop;
  insert into redeem_codes (code, stall_id, profile_id, amount) values (new_code, p_stall, me, p_amount);
  return new_code;
end $$;

-- ───────────── Vendor actions ─────────────

create or replace function public.claim_stall(p_stall text, p_vendor_name text, p_quote text, p_avatar text)
returns void language plpgsql security definer set search_path = public as $$
declare me uuid := my_profile_id();
begin
  if me is null then raise exception 'Sign in first'; end if;
  if exists (select 1 from stalls where owner_id = me) then raise exception 'You already run a stall on Hissa'; end if;
  if length(trim(coalesce(p_vendor_name, ''))) < 2 then raise exception 'Tell customers your name'; end if;
  update stalls
     set owner_id = me,
         vendor_name = trim(p_vendor_name),
         vendor_quote = left(trim(coalesce(p_quote, '')), 160),
         vendor_avatar = coalesce(nullif(p_avatar, ''), vendor_avatar),
         verified = true
   where id = p_stall and owner_id is null;
  if not found then raise exception 'This stall has already been claimed'; end if;
end $$;

create or replace function public.register_stall(
  p_name text, p_area text, p_vendor_name text, p_quote text, p_avatar text,
  p_tags text[], p_veg boolean, p_timings text, p_avg_price int, p_dishes jsonb,
  p_lat double precision default null, p_lng double precision default null
) returns text language plpgsql security definer set search_path = public as $$
declare
  me uuid := my_profile_id();
  new_id text;
begin
  if me is null then raise exception 'Sign in first'; end if;
  if exists (select 1 from stalls where owner_id = me) then raise exception 'You already run a stall on Hissa'; end if;
  if length(trim(coalesce(p_name, ''))) < 2 then raise exception 'Give your stall a name'; end if;
  if length(trim(coalesce(p_vendor_name, ''))) < 2 then raise exception 'Tell customers your name'; end if;

  new_id := trim(both '-' from regexp_replace(lower(p_name), '[^a-z0-9]+', '-', 'g')) || '-' || substr(md5(random()::text), 1, 5);
  insert into stalls (id, status, name, area, lat, lng, vendor_name, vendor_quote, vendor_avatar, tags, veg,
                      timings, avg_price, dishes, owner_id, verified, since, ai_summary)
  values (new_id, 'live', trim(p_name), p_area, p_lat, p_lng, trim(p_vendor_name), left(trim(coalesce(p_quote, '')), 160),
          coalesce(nullif(p_avatar, ''), '🧑🏽‍🍳'), coalesce(p_tags, '{}'), coalesce(p_veg, false),
          left(coalesce(p_timings, ''), 40), greatest(coalesce(p_avg_price, 0), 0), coalesce(p_dishes, '[]'),
          me, true, extract(year from now())::int, 'New on Hissa. Be one of the first critics to rate it.');
  return new_id;
end $$;

create or replace function public.create_campaign(
  p_title text, p_short_goal text, p_story text, p_goal int, p_days int,
  p_cost_breakdown jsonb, p_pct numeric, p_cap numeric, p_baseline int
) returns text language plpgsql security definer set search_path = public as $$
declare
  me uuid := my_profile_id();
  s stalls%rowtype;
  new_id text;
begin
  if me is null then raise exception 'Sign in first'; end if;
  select * into s from stalls where owner_id = me;
  if not found then raise exception 'Claim or register your stall first'; end if;
  if exists (select 1 from campaigns where stall_id = s.id and raised < goal and ends_on >= current_date) then
    raise exception 'You already have a campaign running';
  end if;
  if length(trim(coalesce(p_short_goal, ''))) < 3 then raise exception 'Say what the money is for'; end if;
  if p_goal not between 5000 and 500000 then raise exception 'Goal must be between ₹5,000 and ₹5,00,000'; end if;
  if p_days not between 7 and 60 then raise exception 'Run the campaign for 7 to 60 days'; end if;
  if p_pct not between 1 and 30 then raise exception 'Share between 1%% and 30%% of sales growth'; end if;
  if p_cap not between 1.1 and 2 then raise exception 'Payback cap must be between 1.1× and 2×'; end if;
  if p_baseline < 0 then raise exception 'Monthly sales can''t be negative'; end if;

  new_id := 'c-' || s.id || '-' || substr(md5(random()::text), 1, 4);
  insert into campaigns (id, stall_id, title, short_goal, story, goal, ends_on, cost_breakdown, revenue_share, milestones, insight, updates)
  values (
    new_id, s.id,
    coalesce(nullif(trim(p_title), ''), 'Help ' || split_part(s.vendor_name, ' ', 1) || ' get ' || trim(p_short_goal)),
    trim(p_short_goal),
    left(trim(coalesce(p_story, '')), 600),
    p_goal,
    current_date + p_days,
    coalesce(p_cost_breakdown, '[]'),
    jsonb_build_object('pctOfGrowth', p_pct, 'cap', p_cap, 'baselineMonthly', p_baseline),
    jsonb_build_array(
      jsonb_build_object('title', 'Fully funded', 'reward', '₹100 food credit', 'releasePct', 40, 'status', 'in_progress'),
      jsonb_build_object('title', initcap(regexp_replace(trim(p_short_goal), '^(a|an|the) ', '', 'i')) || ' in place',
                         'reward', '₹200 credit + backer badge', 'releasePct', 40, 'status', 'locked'),
      jsonb_build_object('title', 'Sales up 25%', 'reward', '₹300 credit', 'releasePct', 20, 'status', 'locked')
    ),
    jsonb_build_object('summary', 'A new campaign. The backer insight grows as ratings, updates and sales come in.',
                       'signals', jsonb_build_array(), 'risks', jsonb_build_array('New campaign: no track record on Hissa yet')),
    '[]'
  );
  update stalls set campaign_id = new_id where id = s.id;
  return new_id;
end $$;

create or replace function public.post_update(p_text text, p_emoji text)
returns void language plpgsql security definer set search_path = public as $$
declare
  me uuid := my_profile_id();
  cid text;
begin
  if me is null then raise exception 'Sign in first'; end if;
  select campaign_id into cid from stalls where owner_id = me;
  if cid is null then raise exception 'Start a campaign to post updates'; end if;
  if length(trim(coalesce(p_text, ''))) < 3 then raise exception 'Write a short update'; end if;
  update campaigns
     set updates = jsonb_build_array(jsonb_build_object(
           'date', to_char(current_date, 'YYYY-MM-DD'),
           'emoji', coalesce(nullif(p_emoji, ''), '📣'),
           'text', left(trim(p_text), 280))) || updates
   where id = cid;
end $$;

create or replace function public.accept_redeem_code(p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare
  me uuid := my_profile_id();
  rc redeem_codes%rowtype;
  s stalls%rowtype;
  balance int;
  who profiles%rowtype;
begin
  if me is null then raise exception 'Sign in first'; end if;
  select * into s from stalls where owner_id = me;
  if not found then raise exception 'Only the stall owner can accept codes'; end if;

  select * into rc from redeem_codes
   where code = trim(p_code) and stall_id = s.id and used_at is null and expires_at > now()
   for update;
  if not found then raise exception 'That code isn''t valid here, or it has expired'; end if;

  select coalesce(sum(amount), 0) into balance
    from wallet_txns where profile_id = rc.profile_id and stall_id = s.id and kind in ('credit', 'redeemed');
  if balance < rc.amount then raise exception 'This customer no longer has enough credit'; end if;

  insert into wallet_txns (profile_id, kind, amount, label, stall_id)
  values (rc.profile_id, 'redeemed', -rc.amount, 'Redeemed at ' || s.name, s.id);
  update redeem_codes set used_at = now() where id = rc.id;

  select * into who from profiles where id = rc.profile_id;
  return json_build_object('amount', rc.amount, 'name', who.name, 'handle', who.handle, 'avatar', who.avatar);
end $$;

-- Everything the vendor dashboard needs that isn't public: who backed, and recent redemptions.
create or replace function public.vendor_dashboard()
returns json language plpgsql stable security definer set search_path = public as $$
declare
  me uuid := my_profile_id();
  s stalls%rowtype;
begin
  if me is null then return null; end if;
  select * into s from stalls where owner_id = me;
  if not found then return null; end if;
  return json_build_object(
    'stall_id', s.id,
    'backers', coalesce((
      select json_agg(x order by x.last_at desc) from (
        select p.name, p.handle, p.avatar, sum(b.amount)::int as amount, max(b.created_at) as last_at
          from backings b join profiles p on p.id = b.profile_id
         where b.campaign_id = s.campaign_id
         group by p.id
      ) x), '[]'::json),
    'redemptions', coalesce((
      select json_agg(y order by y.used_at desc) from (
        select p.name, p.avatar, r.amount, r.used_at
          from redeem_codes r join profiles p on p.id = r.profile_id
         where r.stall_id = s.id and r.used_at is not null
         order by r.used_at desc limit 20
      ) y), '[]'::json)
  );
end $$;

revoke execute on function public.claim_stall, public.register_stall, public.create_campaign, public.post_update,
  public.accept_redeem_code, public.vendor_dashboard from public, anon;
grant execute on function public.claim_stall, public.register_stall, public.create_campaign, public.post_update,
  public.accept_redeem_code, public.vendor_dashboard to authenticated;
