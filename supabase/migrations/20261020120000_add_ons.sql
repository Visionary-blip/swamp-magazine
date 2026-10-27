-- Add-ons: the gum at the register. Small products that are sold only alongside
-- a real purchase, never on their own.
--
-- An add-on is an ordinary product row (price, one variant carrying its stock,
-- an order_items snapshot, the same webhook decrement) with this flag set, so
-- none of the money path needs a second code path. The flag keeps them out of
-- the catalog grid, the sitemap and the product pages, and lets the server
-- refuse an order that contains nothing but add-ons -- the rule is enforced
-- there, not just hidden in the cart.
--
-- Existing rows are all garments, so the default is false. To create one: insert
-- a product with is_add_on = true, give it a single variant (a size such as
-- 'ONE SIZE' and an inventory_count), and upload its cutout to the product_cutout
-- slot for its slug like any other product.

alter table public.products
  add column is_add_on boolean not null default false;
