-- Ejecuta este script en el SQL Editor de Supabase.
-- Objetivo:
-- - Exponer métricas reales (SUM/COUNT) para el Dashboard vía RPC.
-- - Dejar lista la estructura para Venta Neta cuando exista una columna de costos.
-- - Evitar que el fetch de clientes falle por RLS/permisos.

-- 1) Tablas mínimas (si no existen)
create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'procesando',
  -- Ingreso bruto del pedido
  total_amount numeric not null default 0,
  -- (Opcional) costo del pedido: cuando lo llenes, se calculará venta neta
  cost_amount numeric null
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  created_at timestamptz not null default now()
);

-- 2) Función RPC para métricas de ventas
-- Devuelve:
-- - gross_sales_mxn: SUM(total_amount)
-- - total_orders: COUNT(*)
-- - net_sales_mxn: SUM(total_amount - cost_amount) si existe cost_amount; si no, NULL
create or replace function public.dashboard_sales_metrics()
returns table (
  gross_sales_mxn numeric,
  net_sales_mxn numeric,
  total_orders bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  orders_exists boolean;
  has_total_amount boolean;
  has_cost_amount boolean;
  gross numeric;
  net numeric;
  cnt bigint;
begin
  orders_exists := to_regclass('public.orders') is not null;
  if not orders_exists then
    gross_sales_mxn := null;
    net_sales_mxn := null;
    total_orders := null;
    return next;
    return;
  end if;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'total_amount'
  ) into has_total_amount;

  if not has_total_amount then
    gross_sales_mxn := null;
    net_sales_mxn := null;
    total_orders := null;
    return next;
    return;
  end if;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'cost_amount'
  ) into has_cost_amount;

  execute 'select coalesce(sum(total_amount), 0), count(*)::bigint from public.orders'
    into gross, cnt;

  if has_cost_amount then
    execute 'select coalesce(sum(total_amount - coalesce(cost_amount, 0)), 0) from public.orders'
      into net;
  else
    net := null;
  end if;

  gross_sales_mxn := gross;
  net_sales_mxn := net;
  total_orders := cnt;
  return next;
end;
$$;

grant execute on function public.dashboard_sales_metrics() to authenticated;

-- 3) RLS/policies: profiles (clientes)
alter table public.profiles enable row level security;

-- Permite a cada usuario ver su propio perfil
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

-- Permite a emails admin ver todos los perfiles (mismo set que en el frontend)
drop policy if exists "profiles_select_admin_emails" on public.profiles;
create policy "profiles_select_admin_emails"
on public.profiles
for select
to authenticated
using (
  (auth.jwt() ->> 'email') in ('juliocov@icloud.com', 'juancajurs@gmail.com')
);

-- 4) RLS/policies: orders (para que el RPC pueda sumar sin depender del SELECT directo)
-- Si ya tienes RLS/policies aquí, revisa antes de aplicar.
alter table public.orders enable row level security;

