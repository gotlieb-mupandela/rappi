create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.sync_product_stock()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  target_id text;
begin
  target_id := coalesce(new.product_id, old.product_id);
  update public.products
  set stock_qty = (
    select coalesce(sum(stock), 0)
    from public.product_sizes
    where product_id = target_id
  )
  where id = target_id;
  return null;
end;
$$;

create or replace function public.protect_profile()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'Cannot change profile id';
  end if;
  if new.role is distinct from old.role then
    raise exception 'Cannot change role';
  end if;
  return new;
end;
$$;

drop function if exists public.seed_catalog_products(jsonb);
drop function if exists public.seed_catalog_sizes(jsonb);

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.handle_user_email_change() from public, anon, authenticated;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
revoke all on function public.rls_auto_enable() from public, anon, authenticated;
