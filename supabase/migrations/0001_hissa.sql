-- Hissa live mode schema. Paste into Supabase → SQL Editor and run once, then run seed.sql.
-- Money is play money: players get ₹10,000 on sign-up. All balance changes go through
-- security-definer functions below; clients can only read their own wallet.


-- ───────────────────────── Tables ─────────────────────────

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete cascade, -- null for seeded critics
  handle text not null unique check (handle ~ '^[a-z0-9_]{3,24}$'),
  name text not null check (length(name) between 1 and 40),
  avatar text not null default '🧑🏽',
  area text not null default 'Bengaluru',
  persona text not null default 'New critic · just getting started',
  taste_base int not null default 0,
  reviews_base int not null default 0,
  found_base int not null default 0,
  followers int not null default 0,
  badges jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table public.stalls (
  id text primary key,
  status text not null default 'live' check (status in ('live', 'pending')),
  name text not null check (length(name) between 2 and 80),
  vendor_name text not null default '',
  vendor_avatar text not null default '🧑🏽‍🍳',
  vendor_quote text not null default '',
  area text not null,
  lat double precision,
  lng double precision,
  emoji text not null default '🍽️',
  hue int not null default 30,
  dish text,
  tags text[] not null default '{}',
  veg boolean not null default false,
  avg_price int not null default 0,
  timings text not null default '',
  base_ratings jsonb not null default '{"taste":0,"hygiene":0,"value":0,"vibe":0}',
  base_count int not null default 0,
  verified boolean not null default false,
  suggested_by uuid references public.profiles (id) on delete set null,
  osm_id text,
  since int,
  dishes jsonb not null default '[]',
  ai_summary text not null default '',
  campaign_id text,
  created_at timestamptz not null default now()
);

create table public.ratings (
  id bigint generated always as identity primary key,
  stall_id text not null references public.stalls (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  taste smallint not null check (taste between 1 and 5),
  hygiene smallint not null check (hygiene between 1 and 5),
  value smallint not null check (value between 1 and 5),
  vibe smallint not null check (vibe between 1 and 5),
  review text not null default '' check (length(review) <= 500),
  is_seed boolean not null default false, -- seeded reviews are shown but already counted in base_ratings
  created_at timestamptz not null default now(),
  unique (stall_id, profile_id)
);

create table public.campaigns (
  id text primary key,
  stall_id text not null references public.stalls (id) on delete cascade,
  title text not null,
  short_goal text not null,
  story text not null,
  goal int not null check (goal > 0),
  raised int not null default 0,
  backers int not null default 0,
  ends_on date not null,
  cost_breakdown jsonb not null default '[]',
  revenue_share jsonb not null, -- {pctOfGrowth, cap, baselineMonthly}
  milestones jsonb not null,    -- [{title, reward, releasePct, status}]
  insight jsonb not null,
  updates jsonb not null default '[]'
);

create table public.backings (
  id bigint generated always as identity primary key,
  campaign_id text not null references public.campaigns (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  amount int not null check (amount > 0),
  created_at timestamptz not null default now()
);

create table public.vouches (
  stall_id text not null references public.stalls (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (stall_id, profile_id)
);

-- Ledger. Cash kinds: topup, backing (negative), earning, withdrawal (negative).
-- Food-credit kinds (per stall): credit, redeemed (negative).
create table public.wallet_txns (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('topup', 'backing', 'earning', 'withdrawal', 'credit', 'redeemed')),
  amount int not null,
  label text not null,
  stall_id text references public.stalls (id) on delete set null,
  campaign_id text references public.campaigns (id) on delete set null,
  created_at timestamptz not null default now()
);

create index on public.ratings (stall_id);
create index on public.backings (profile_id);
create index on public.backings (campaign_id);
create index on public.wallet_txns (profile_id, created_at desc);

-- ───────────────────────── Helpers ─────────────────────────

create or replace function public.my_profile_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from profiles where user_id = auth.uid()
$$;

-- New auth user → profile + welcome play money.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base text := regexp_replace(lower(coalesce(nullif(new.raw_user_meta_data ->> 'handle', ''), split_part(new.email, '@', 1))), '[^a-z0-9_]', '', 'g');
  candidate text;
  pid uuid;
begin
  if length(base) < 3 then base := base || 'critic'; end if;
  base := left(base, 18);
  candidate := base;
  while exists (select 1 from profiles where handle = candidate) loop
    candidate := base || (floor(random() * 9000) + 1000)::int;
  end loop;

  insert into profiles (user_id, handle, name, area, avatar)
  values (
    new.id,
    candidate,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), candidate), 40),
    coalesce(nullif(new.raw_user_meta_data ->> 'area', ''), 'Bengaluru'),
    coalesce(nullif(new.raw_user_meta_data ->> 'avatar', ''), '🧑🏽')
  )
  returning id into pid;

  insert into wallet_txns (profile_id, kind, amount, label)
  values (pid, 'topup', 10000, 'Welcome to Hissa! Play money to back stalls');
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────── Actions (RPC) ─────────────────────────

create or replace function public.back_campaign(p_campaign text, p_amount int)
returns json language plpgsql security definer set search_path = public as $$
declare
  me uuid := my_profile_id();
  c campaigns%rowtype;
  s stalls%rowtype;
  play int;
  first_backing boolean;
  credit_amt int;
begin
  if me is null then raise exception 'Sign in to back a stall'; end if;
  if p_amount < 100 or p_amount > 50000 then raise exception 'Choose an amount between ₹100 and ₹50,000'; end if;

  select * into c from campaigns where id = p_campaign for update;
  if not found then raise exception 'Campaign not found'; end if;
  if c.raised >= c.goal then raise exception 'This campaign is already fully funded'; end if;
  if c.ends_on < current_date then raise exception 'This campaign has closed'; end if;

  select coalesce(sum(amount), 0) into play from wallet_txns where profile_id = me and kind in ('topup', 'backing');
  if play < p_amount then raise exception 'Not enough play money (₹% left)', play; end if;

  select * into s from stalls where id = c.stall_id;
  first_backing := not exists (select 1 from backings where campaign_id = c.id and profile_id = me);

  insert into backings (campaign_id, profile_id, amount) values (c.id, me, p_amount);
  insert into wallet_txns (profile_id, kind, amount, label, stall_id, campaign_id)
  values (me, 'backing', -p_amount, 'Backed ' || s.name, s.id, c.id);

  update campaigns
     set raised = raised + p_amount,
         backers = backers + case when first_backing then 1 else 0 end
   where id = c.id
  returning * into c;

  -- Crossing the goal completes milestone 1 and gives every player-backer its food credit.
  if c.raised >= c.goal then
    credit_amt := coalesce(substring(c.milestones -> 0 ->> 'reward' from '₹([0-9]+)')::int, 100);
    update campaigns
       set milestones = case
             when jsonb_array_length(milestones) > 1 and milestones -> 1 ->> 'status' = 'locked'
               then jsonb_set(jsonb_set(milestones, '{0,status}', '"done"'), '{1,status}', '"in_progress"')
             else jsonb_set(milestones, '{0,status}', '"done"')
           end
     where id = c.id;
    insert into wallet_txns (profile_id, kind, amount, label, stall_id, campaign_id)
    select distinct b.profile_id, 'credit', credit_amt, 'Food credit · ' || s.name || ' fully funded', s.id, c.id
      from backings b where b.campaign_id = c.id;
  end if;

  return json_build_object('raised', c.raised, 'backers', c.backers, 'funded', c.raised >= c.goal);
end $$;

create or replace function public.rate_stall(
  p_stall text, p_taste int, p_hygiene int, p_value int, p_vibe int, p_review text
) returns void language plpgsql security definer set search_path = public as $$
declare me uuid := my_profile_id();
begin
  if me is null then raise exception 'Sign in to rate'; end if;
  if not exists (select 1 from stalls where id = p_stall) then raise exception 'Stall not found'; end if;
  insert into ratings (stall_id, profile_id, taste, hygiene, value, vibe, review)
  values (p_stall, me, p_taste, p_hygiene, p_value, p_vibe, left(coalesce(p_review, ''), 500))
  on conflict (stall_id, profile_id) do update
    set taste = excluded.taste, hygiene = excluded.hygiene, value = excluded.value,
        vibe = excluded.vibe, review = excluded.review, created_at = now();
end $$;

create or replace function public.suggest_stall(
  p_name text, p_area text, p_tags text[], p_veg boolean, p_dishes jsonb,
  p_osm_id text default null, p_lat double precision default null, p_lng double precision default null
) returns text language plpgsql security definer set search_path = public as $$
declare
  me uuid := my_profile_id();
  new_id text;
begin
  if me is null then raise exception 'Sign in to suggest a stall'; end if;
  if length(trim(coalesce(p_name, ''))) < 2 then raise exception 'Give the stall a name'; end if;
  if p_osm_id is not null and exists (select 1 from stalls where osm_id = p_osm_id) then
    raise exception 'Someone already suggested this spot';
  end if;

  new_id := trim(both '-' from regexp_replace(lower(p_name), '[^a-z0-9]+', '-', 'g')) || '-' || substr(md5(random()::text), 1, 5);
  insert into stalls (id, status, name, area, lat, lng, tags, veg, dishes, suggested_by, osm_id, ai_summary)
  values (new_id, 'pending', trim(p_name), p_area, p_lat, p_lng, coalesce(p_tags, '{}'), coalesce(p_veg, false),
          coalesce(p_dishes, '[]'), me, p_osm_id, 'New find. Waiting for critics to vouch and rate.');
  insert into vouches (stall_id, profile_id) values (new_id, me); -- the finder's own vouch
  return new_id;
end $$;

create or replace function public.vouch_stall(p_stall text)
returns json language plpgsql security definer set search_path = public as $$
declare
  me uuid := my_profile_id();
  n int;
  st text;
begin
  if me is null then raise exception 'Sign in to vouch'; end if;
  select status into st from stalls where id = p_stall for update;
  if st is null then raise exception 'Stall not found'; end if;
  if st <> 'pending' then raise exception 'This stall is already live'; end if;

  insert into vouches (stall_id, profile_id) values (p_stall, me) on conflict do nothing;
  select count(*) into n from vouches where stall_id = p_stall;
  if n >= 3 then
    update stalls set status = 'live' where id = p_stall;
    st := 'live';
  end if;
  return json_build_object('vouches', n, 'status', st);
end $$;

create or replace function public.withdraw_earnings(p_amount int, p_upi text)
returns void language plpgsql security definer set search_path = public as $$
declare
  me uuid := my_profile_id();
  available int;
begin
  if me is null then raise exception 'Sign in first'; end if;
  if p_upi !~* '^[a-z0-9._-]{2,}@[a-z]{2,}$' then raise exception 'That UPI ID doesn''t look right'; end if;
  if p_amount < 100 then raise exception 'Minimum withdrawal is ₹100'; end if;
  select coalesce(sum(amount), 0) into available from wallet_txns where profile_id = me and kind in ('earning', 'withdrawal');
  if available < p_amount then raise exception 'Only ₹% is ready to withdraw', available; end if;
  insert into wallet_txns (profile_id, kind, amount, label)
  values (me, 'withdrawal', -p_amount, 'Withdrawn to UPI · ' || p_upi);
end $$;

create or replace function public.redeem_credit(p_stall text, p_amount int)
returns text language plpgsql security definer set search_path = public as $$
declare
  me uuid := my_profile_id();
  available int;
  stall_name text;
begin
  if me is null then raise exception 'Sign in first'; end if;
  if p_amount <= 0 then raise exception 'Choose an amount'; end if;
  select coalesce(sum(amount), 0) into available
    from wallet_txns where profile_id = me and stall_id = p_stall and kind in ('credit', 'redeemed');
  if available < p_amount then raise exception 'Only ₹% of treats left here', available; end if;
  select name into stall_name from stalls where id = p_stall;
  insert into wallet_txns (profile_id, kind, amount, label, stall_id)
  values (me, 'redeemed', -p_amount, 'Redeemed at ' || stall_name, p_stall);
  return lpad((floor(random() * 900000) + 100000)::int::text, 6, '0');
end $$;

-- Play-mode time machine: pays one month of revenue share on every funded campaign you backed,
-- assuming sales grew 25%, never beyond each backing's cap.
create or replace function public.simulate_month()
returns int language plpgsql security definer set search_path = public as $$
declare
  me uuid := my_profile_id();
  r record;
  share int;
  pay int;
  total int := 0;
begin
  if me is null then raise exception 'Sign in first'; end if;
  for r in
    select c.id, c.goal, c.revenue_share, s.name, s.id as stall_id, sum(b.amount) as stake,
           (select coalesce(sum(t.amount), 0) from wallet_txns t
             where t.profile_id = me and t.campaign_id = c.id and t.kind = 'earning') as earned
      from backings b
      join campaigns c on c.id = b.campaign_id
      join stalls s on s.id = c.stall_id
     where b.profile_id = me and c.raised >= c.goal
     group by c.id, s.id
  loop
    share := round((r.revenue_share ->> 'baselineMonthly')::numeric * 0.25
                   * (r.revenue_share ->> 'pctOfGrowth')::numeric / 100 * r.stake / r.goal);
    pay := least(share, floor(r.stake * (r.revenue_share ->> 'cap')::numeric)::int - r.earned);
    if pay > 0 then
      insert into wallet_txns (profile_id, kind, amount, label, stall_id, campaign_id)
      values (me, 'earning', pay, 'Revenue share · ' || r.name || ' (simulated month)', r.stall_id, r.id);
      total := total + pay;
    end if;
  end loop;
  return total;
end $$;

-- Leaderboard: needs counts across private tables, so it runs as definer and returns only public fields.
create or replace function public.leaderboard()
returns table (
  id uuid, handle text, name text, avatar text, area text, persona text,
  taste_score int, reviews int, found int, followers int, badges jsonb, is_player boolean
) language sql stable security definer set search_path = public as $$
  -- Seeded critics keep their fixed numbers; live activity only counts for real players.
  select p.id, p.handle, p.name, p.avatar, p.area, p.persona,
         p.taste_base + case when p.user_id is null then 0 else
             10 * (select count(*) from ratings r where r.profile_id = p.id)::int
           + 50 * (select count(*) from stalls s where s.suggested_by = p.id and s.status = 'live')::int
           + 20 * (select count(distinct campaign_id) from backings b where b.profile_id = p.id)::int
         end,
         p.reviews_base + case when p.user_id is null then 0
           else (select count(*) from ratings r where r.profile_id = p.id)::int end,
         p.found_base + case when p.user_id is null then 0
           else (select count(*) from stalls s where s.suggested_by = p.id)::int end,
         p.followers, p.badges, p.user_id is not null
    from profiles p
$$;

-- ───────────────────────── Row level security ─────────────────────────

alter table public.profiles enable row level security;
alter table public.stalls enable row level security;
alter table public.ratings enable row level security;
alter table public.campaigns enable row level security;
alter table public.backings enable row level security;
alter table public.vouches enable row level security;
alter table public.wallet_txns enable row level security;

create policy "profiles are public" on public.profiles for select using (true);
create policy "edit own profile" on public.profiles for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
-- Players may only change cosmetic fields; scores and badges are not theirs to edit.
revoke update on public.profiles from anon, authenticated;
grant update (name, avatar, area) on public.profiles to authenticated;

create policy "stalls are public" on public.stalls for select using (true);
create policy "ratings are public" on public.ratings for select using (true);
create policy "campaigns are public" on public.campaigns for select using (true);
create policy "vouches are public" on public.vouches for select using (true);
create policy "see own backings" on public.backings for select using (profile_id = public.my_profile_id());
create policy "see own wallet" on public.wallet_txns for select using (profile_id = public.my_profile_id());
-- No insert/update/delete policies: every write goes through the functions above.

-- Functions are executable by PUBLIC by default; only signed-in players may call the actions.
revoke execute on function public.back_campaign, public.rate_stall, public.suggest_stall, public.vouch_stall,
  public.withdraw_earnings, public.redeem_credit, public.simulate_month from public, anon;
grant execute on function public.back_campaign, public.rate_stall, public.suggest_stall, public.vouch_stall,
  public.withdraw_earnings, public.redeem_credit, public.simulate_month to authenticated;
