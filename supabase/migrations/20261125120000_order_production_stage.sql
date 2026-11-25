-- The founder tracks each sale through the work behind it: the blank bought
-- wholesale, then printed, then delivered. "Delivered" is already recorded by
-- the order's status (fulfilled / picked_up), so only the two steps before it
-- need storing; NULL means neither has happened yet. A separate column rather
-- than more statuses because status is about money and handover, and the
-- webhook, stock and capacity rules all read it.
alter table public.orders
  add column if not exists production_stage text
  check (production_stage in ('wholesale_bought', 'printed'));
