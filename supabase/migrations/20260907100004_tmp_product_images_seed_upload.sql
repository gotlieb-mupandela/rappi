-- Temporary seed-only upload. Dropped in 20260907100005 after catalog images land.
create policy product_images_tmp_seed_insert
  on storage.objects for insert
  to anon
  with check (bucket_id = 'product-images');

create policy product_images_tmp_seed_update
  on storage.objects for update
  to anon
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');
