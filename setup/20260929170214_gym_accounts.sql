-- One private, versioned snapshot per account for the multi-device pilot.
-- Authentication is managed by Supabase Auth; no passwords are stored here.
begin;

create table public.gym_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  revision bigint not null default 1 check (revision > 0),
  last_write_id uuid not null,
  updated_at timestamptz not null default now(),
  constraint gym_state_shape check (coalesce((
    jsonb_typeof(data) = 'object'
    and data ?& array['version','routines','history','active','timerEnd']
    and data ->> 'version' = '1'
    and jsonb_typeof(data -> 'routines') = 'array'
    and jsonb_typeof(data -> 'history') = 'array'
    and jsonb_typeof(data -> 'active') in ('object','null')
    and octet_length(data::text) <= 4194304
  ), false))
);

alter table public.gym_states enable row level security;
revoke all on public.gym_states from anon, authenticated;
grant select on public.gym_states to authenticated;
create policy gym_read_own on public.gym_states for select to authenticated
  using ((select auth.uid()) = user_id);

-- All writes must use the compare-and-swap function. It never accepts a user id.
create schema gym_private;
revoke all on schema gym_private from public, anon;
grant usage on schema gym_private to authenticated;

create function gym_private.save_state(p_state jsonb, p_expected_revision bigint, p_write_id uuid)
returns setof public.gym_states
language plpgsql security definer set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  saved public.gym_states;
begin
  if owner_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if p_expected_revision is null or p_expected_revision < 0 or p_write_id is null then
    raise exception 'Invalid revision or write id' using errcode = '22023';
  end if;

  if p_expected_revision = 0 then
    insert into public.gym_states(user_id,data,revision,last_write_id)
    values (owner_id,p_state,1,p_write_id)
    on conflict (user_id) do nothing
    returning * into saved;
  else
    update public.gym_states
      set data=p_state, revision=revision+1, last_write_id=p_write_id, updated_at=now()
      where user_id=owner_id and revision=p_expected_revision
      returning * into saved;
  end if;
  if saved.user_id is not null then return next saved; return; end if;

  select * into saved from public.gym_states where user_id=owner_id;
  if saved.last_write_id = p_write_id then return next saved; return; end if;
  raise exception 'State changed on another device' using errcode = '40001';
end;
$$;
revoke all on function gym_private.save_state(jsonb,bigint,uuid) from public, anon;
grant execute on function gym_private.save_state(jsonb,bigint,uuid) to authenticated;

-- Expose only an invoker wrapper. The privileged function lives outside the Data API.
create function public.gym_save_state(p_state jsonb, p_expected_revision bigint, p_write_id uuid)
returns setof public.gym_states
language sql security invoker set search_path = ''
as $$ select * from gym_private.save_state(p_state,p_expected_revision,p_write_id); $$;
revoke all on function public.gym_save_state(jsonb,bigint,uuid) from public, anon;
grant execute on function public.gym_save_state(jsonb,bigint,uuid) to authenticated;

comment on table public.gym_states is 'Private Mi Gym account state; writes require revision comparison through gym_save_state.';
commit;
