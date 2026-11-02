create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  password_hash text not null,
  role text not null default 'owner' check (role in ('owner', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.app_users add column if not exists role text not null default 'owner';
alter table public.app_users drop constraint if exists app_users_role_check;
alter table public.app_users add constraint app_users_role_check check (role in ('owner', 'admin'));

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.app_users(id) on delete cascade,
  name text not null,
  description text not null default 'Authentic local cuisine and delicious meals.',
  logo text not null default '',
  cover_image text not null default '',
  whatsapp_number text not null default '',
  address text not null default '',
  opening_hours text not null default '',
  currency text not null default '₦',
  slug text not null unique,
  is_open boolean not null default true,
  theme text not null default 'warm' check (theme in ('warm', 'dark', 'clean')),
  plan text not null default 'Starter' check (plan in ('Starter', 'Pro', 'Premium')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now()
);

alter table public.restaurants add column if not exists status text not null default 'active';
alter table public.restaurants drop constraint if exists restaurants_status_check;
alter table public.restaurants add constraint restaurants_status_check check (status in ('active', 'suspended'));

create table if not exists public.auth_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null,
  description text not null default '',
  price numeric(12, 2) not null check (price >= 0),
  image text not null default '',
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  customer_name text not null,
  customer_phone text,
  delivery_preference text not null check (delivery_preference in ('delivery', 'pickup')),
  delivery_address text,
  special_instructions text,
  items jsonb not null check (jsonb_typeof(items) = 'array'),
  total_amount numeric(12, 2) not null check (total_amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists categories_restaurant_sort_idx on public.categories (restaurant_id, sort_order);
create index if not exists menu_items_restaurant_name_idx on public.menu_items (restaurant_id, name);
create index if not exists orders_restaurant_created_idx on public.orders (restaurant_id, created_at desc);
create index if not exists auth_sessions_expiry_idx on public.auth_sessions (expires_at);

alter table public.app_users enable row level security;
alter table public.restaurants enable row level security;
alter table public.auth_sessions enable row level security;
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;

revoke all on public.app_users, public.restaurants, public.auth_sessions, public.categories, public.menu_items, public.orders from anon, authenticated;
grant all on public.app_users, public.restaurants, public.auth_sessions, public.categories, public.menu_items, public.orders to service_role;

drop function if exists public.register_app_user(text, text, text, text, text);

create or replace function public.register_app_user(
  p_email text,
  p_name text,
  p_password_hash text,
  p_restaurant_name text,
  p_restaurant_slug text,
  p_whatsapp_number text
)
returns table (
  user_id uuid,
  email text,
  name text,
  restaurant_id uuid,
  restaurant_name text,
  restaurant_slug text,
  description text,
  logo text,
  cover_image text,
  whatsapp_number text,
  address text,
  opening_hours text,
  currency text,
  is_open boolean,
  theme text,
  plan text,
  created_at timestamptz
)
language plpgsql
as $$
declare
  created_user_id uuid;
begin
  insert into public.app_users (email, name, password_hash)
  values (p_email, p_name, p_password_hash)
  returning id into created_user_id;

  return query
  insert into public.restaurants as new_restaurant (user_id, name, slug, whatsapp_number)
  values (created_user_id, p_restaurant_name, p_restaurant_slug, p_whatsapp_number)
  returning
    created_user_id,
    p_email,
    p_name,
    new_restaurant.id,
    new_restaurant.name,
    new_restaurant.slug,
    new_restaurant.description,
    new_restaurant.logo,
    new_restaurant.cover_image,
    new_restaurant.whatsapp_number,
    new_restaurant.address,
    new_restaurant.opening_hours,
    new_restaurant.currency,
    new_restaurant.is_open,
    new_restaurant.theme,
    new_restaurant.plan,
    new_restaurant.created_at;
end;
$$;

revoke all on function public.register_app_user(text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.register_app_user(text, text, text, text, text, text) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menudrop-images', 'menudrop-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- After creating your account, replace the email below and run this once to grant admin access:
-- update public.app_users set role = 'admin' where lower(email) = lower('you@example.com');
