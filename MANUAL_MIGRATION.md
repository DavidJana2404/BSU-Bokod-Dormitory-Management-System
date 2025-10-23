# Manual Migration Guide for Render

If automatic migrations fail during deployment, follow these steps to manually run migrations on Render.

## Option 1: Via Render Dashboard (Recommended)

1. Go to your [Render Dashboard](https://dashboard.render.com)
2. Select your **BSU Bokod DMS** service
3. Click on the **Shell** tab in the left sidebar
4. In the shell terminal, run:
   ```bash
   php artisan migrate --force
   ```
5. Verify the migration:
   ```bash
   php artisan tinker --execute="echo Schema::hasTable('payment_records') ? 'Table exists' : 'Table missing';"
   ```

## Option 2: Using the Migration Script

1. Access the Render Shell (see Option 1, steps 1-3)
2. Run the migration script:
   ```bash
   bash migrate-production.sh
   ```

## Option 3: Manual Deploy with Build Command

1. Go to your Render Dashboard
2. Select your service
3. Go to **Settings** → **Build & Deploy**
4. Temporarily update the **Build Command** to include:
   ```bash
   composer install --no-dev --optimize-autoloader &&
   npm ci &&
   npm run build &&
   php artisan migrate --force
   ```
5. Click **Manual Deploy** → **Deploy latest commit**
6. After successful deployment, revert the build command to the original

## Verifying the Migration

After running migrations, check if the `payment_records` table exists:

```bash
php artisan tinker --execute="DB::table('payment_records')->count();"
```

If this returns `0` (zero records), the table exists and is working properly.

## Common Issues

### Issue: "Database connection failed"
**Solution:** Check that your `DATABASE_URL` environment variable is correctly set in Render.

### Issue: "Migration already ran"
**Solution:** The migration was successful. Verify with:
```bash
php artisan migrate:status
```

### Issue: "SQLSTATE[42P01]: Undefined table"
**Solution:** The migration hasn't run yet. Follow Option 1 above.

## Current Migration Status

The `payment_records` table migration:
- **File:** `2025_10_23_133324_create_payment_records_table.php`
- **Created:** October 23, 2025
- **Purpose:** Stores payment transaction history for cashiers

## After Migration Success

Once the migration completes:
1. Refresh your application in the browser
2. Navigate to **Cashier** → **Records**
3. The error "relation 'payment_records' does not exist" should be gone
4. You should see an empty records list or existing payment records

## Need Help?

If migrations continue to fail:
1. Check Render deployment logs for specific error messages
2. Verify database connection settings
3. Ensure PostgreSQL database is running
4. Check if there are any pending migrations blocking this one
