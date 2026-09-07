-- RAPPI Sports Hub schema
-- Auth lives in the built-in auth schema (auth.users). public.profiles extends it.

create extension if not exists "pgcrypto" with schema extensions;

create type public.gender as enum ('men', 'women', 'kids', 'unisex');
create type public.product_badge as enum ('new', 'offer');
create type public.order_status as enum ('reserved', 'preparing', 'shipped', 'cancelled');
create type public.app_role as enum ('customer', 'admin');

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

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role public.app_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  slug text primary key,
  name text not null,
  featured boolean not null default false,
  blurb text not null default '',
  sort_order integer not null default 0
);

create table public.shipping_methods (
  id text primary key,
  name text not null,
  cost numeric(10, 2) not null default 0,
  sort_order integer not null default 0
);

create table public.products (
  id text primary key,
  code text not null unique,
  item text not null,
  title text not null,
  name text not null,
  display_name text not null,
  category_slug text not null references public.categories (slug),
  subcategory text not null,
  gender public.gender not null,
  price numeric(10, 2) not null check (price >= 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  currency text not null default 'NAD',
  sheet_category text,
  stock_qty integer not null default 0 check (stock_qty >= 0),
  badge public.product_badge,
  image_url text not null,
  images text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products (id) on delete cascade,
  size text not null,
  stock integer not null default 0 check (stock >= 0),
  unique (product_id, size)
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  full_name text not null,
  line1 text not null,
  city text not null,
  country text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  size text not null,
  qty integer not null check (qty > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id, size)
);

create table public.wishlist_items (
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.orders (
  id text primary key,
  user_id uuid references public.profiles (id) on delete set null,
  email text not null,
  full_name text not null,
  address text not null,
  city text not null,
  country text not null,
  shipping_method text not null,
  shipping_cost numeric(10, 2) not null default 0,
  notes text,
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  total numeric(10, 2) not null check (total >= 0),
  status public.order_status not null default 'reserved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders (id) on delete cascade,
  product_id text references public.products (id) on delete set null,
  code text not null,
  name text not null,
  size text not null,
  qty integer not null check (qty > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0)
);

create index products_category_slug_idx on public.products (category_slug);
create index products_subcategory_idx on public.products (subcategory);
create index products_gender_idx on public.products (gender);
create index product_sizes_product_id_idx on public.product_sizes (product_id);
create index addresses_user_id_idx on public.addresses (user_id);
create index cart_items_user_id_idx on public.cart_items (user_id);
create index wishlist_items_user_id_idx on public.wishlist_items (user_id);
create index orders_user_id_idx on public.orders (user_id);
create index orders_email_idx on public.orders (email);
create index order_items_order_id_idx on public.order_items (order_id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger cart_items_set_updated_at
  before update on public.cart_items
  for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

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

create trigger product_sizes_sync_stock
  after insert or update or delete on public.product_sizes
  for each row execute function public.sync_product_stock();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles
    set email = coalesce(new.email, '')
    where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.handle_user_email_change();

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

create trigger profiles_protect
  before update on public.profiles
  for each row execute function public.protect_profile();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.shipping_methods enable row level security;
alter table public.products enable row level security;
alter table public.product_sizes enable row level security;
alter table public.addresses enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

grant select on table public.categories to anon, authenticated;
grant select on table public.shipping_methods to anon, authenticated;
grant select on table public.products to anon, authenticated;
grant select on table public.product_sizes to anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.addresses to authenticated;
grant select, insert, update, delete on table public.cart_items to authenticated;
grant select, insert, update, delete on table public.wishlist_items to authenticated;
grant select, insert on table public.orders to authenticated;
grant select, insert on table public.order_items to authenticated;

grant select, insert, update, delete on table public.profiles to service_role;
grant select, insert, update, delete on table public.categories to service_role;
grant select, insert, update, delete on table public.shipping_methods to service_role;
grant select, insert, update, delete on table public.products to service_role;
grant select, insert, update, delete on table public.product_sizes to service_role;
grant select, insert, update, delete on table public.addresses to service_role;
grant select, insert, update, delete on table public.cart_items to service_role;
grant select, insert, update, delete on table public.wishlist_items to service_role;
grant select, insert, update, delete on table public.orders to service_role;
grant select, insert, update, delete on table public.order_items to service_role;

create policy "Catalog categories are public"
on public.categories for select
to anon, authenticated
using (true);

create policy "Shipping methods are public"
on public.shipping_methods for select
to anon, authenticated
using (true);

create policy "Products are public"
on public.products for select
to anon, authenticated
using (true);

create policy "Product sizes are public"
on public.product_sizes for select
to anon, authenticated
using (true);

create policy "Users can view own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id or (select public.is_admin()));

create policy "Users can update own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Users manage own addresses"
on public.addresses for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage own cart"
on public.cart_items for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage own wishlist"
on public.wishlist_items for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can view own orders"
on public.orders for select
to authenticated
using ((select auth.uid()) = user_id or (select public.is_admin()));

create policy "Users can place own orders"
on public.orders for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can view own order items"
on public.order_items for select
to authenticated
using (
  order_id in (
    select id from public.orders where user_id = (select auth.uid())
  )
  or (select public.is_admin())
);

create policy "Users can insert own order items"
on public.order_items for insert
to authenticated
with check (
  order_id in (
    select id from public.orders where user_id = (select auth.uid())
  )
);

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.handle_user_email_change() from public, anon, authenticated;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
