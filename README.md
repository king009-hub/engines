# Engine Markets - Premium Used Auto Parts

## Critical Fixes & Improvements

I have implemented several fixes to make the website work correctly and run faster:

1.  **Database Fixes**: Created `fix-db-schema.sql`. You **must** run this script in your Supabase SQL Editor to add the missing `slug` and `youtube_url` columns and set up the `admin` role.
2.  **Performance Optimization**: 
    *   Added a translation cache to `translateDynamic` to speed up rendering.
    *   Increased query caching times to make navigation feel instant.
    *   Increased authentication timeouts to handle slow connections.
3.  **Professional UI**: Added a Hero section to the home page for a more premium look.
4.  **Admin Robustness**: The admin panel now handles missing database columns gracefully without crashing.

## How to fix Login and Admin Panel

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Open the **SQL Editor**.
3.  Copy the contents of `fix-db-schema.sql` (found in the root of this project).
4.  Paste it into the SQL Editor and click **Run**.
5.  This will:
    *   Add the `slug` and `youtube_url` columns to the `products` table.
    *   Create the `has_role` function.
    *   Set the user with ID `61bb47f5-d907-4a00-9612-80233cc7cf53` as an admin.

## Performance Note

The website contains thousands of large JPG images in the `public/images` folder. For "instant" speed in production, it is highly recommended to:
1.  Compress these images using a tool like [TinyJPG](https://tinyjpg.com/).
2.  Convert them to `.webp` format.
3.  Host them on a CDN or Supabase Storage bucket instead of bundling them with the application.
