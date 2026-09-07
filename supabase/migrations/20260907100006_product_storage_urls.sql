-- Point catalog rows at public Storage URLs after images are uploaded.
update public.products
set
  image_url = 'https://wzmzwerzbyudcvoiiege.supabase.co/storage/v1/object/public/product-images/' || id || '/01.webp',
  images = array[
    'https://wzmzwerzbyudcvoiiege.supabase.co/storage/v1/object/public/product-images/' || id || '/01.webp',
    'https://wzmzwerzbyudcvoiiege.supabase.co/storage/v1/object/public/product-images/' || id || '/02.webp',
    'https://wzmzwerzbyudcvoiiege.supabase.co/storage/v1/object/public/product-images/' || id || '/03.webp',
    'https://wzmzwerzbyudcvoiiege.supabase.co/storage/v1/object/public/product-images/' || id || '/04.webp',
    'https://wzmzwerzbyudcvoiiege.supabase.co/storage/v1/object/public/product-images/' || id || '/05.webp'
  ]
where image_url not like '%/storage/v1/object/public/product-images/%';
