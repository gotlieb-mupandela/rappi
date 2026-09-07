-- Storefront shipping rates (NAD)
update public.shipping_methods set cost = 100 where id = 'standard';
update public.shipping_methods set cost = 150 where id = 'express';
update public.shipping_methods set cost = 0 where id = 'pickup';
