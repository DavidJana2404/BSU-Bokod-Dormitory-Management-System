#!/bin/bash

# Fix missing tenant_id column in users table for Render deployment
echo "🔧 Fixing missing tenant_id column in users table..."

# Set environment
export APP_ENV=production
export APP_DEBUG=false

echo "Step 1: Checking if tenant_id column exists in users table..."
php artisan tinker --execute="
\$exists = Schema::hasColumn('users', 'tenant_id');
if (\$exists) {
    echo '✅ tenant_id column already exists in users table';
} else {
    echo '❌ tenant_id column missing from users table';
}
" --no-interaction

echo "Step 2: Adding tenant_id column if missing..."
php artisan tinker --execute="
if (!Schema::hasColumn('users', 'tenant_id')) {
    try {
        Schema::table('users', function (Blueprint \$table) {
            \$table->unsignedBigInteger('tenant_id')->nullable()->after('role');
            \$table->foreign('tenant_id')->references('tenant_id')->on('tenants')->onDelete('set null');
        });
        echo '✅ tenant_id column added successfully';
    } catch(Exception \$e) {
        echo '❌ Error adding tenant_id: ' . \$e->getMessage();
        
        // Try without foreign key first
        try {
            Schema::table('users', function (Blueprint \$table) {
                \$table->unsignedBigInteger('tenant_id')->nullable()->after('role');
            });
            echo '✅ tenant_id column added without foreign key';
        } catch(Exception \$e2) {
            echo '❌ Failed to add column: ' . \$e2->getMessage();
        }
    }
} else {
    echo '✅ tenant_id column already exists';
}
" --no-interaction

echo "Step 3: Verifying the column was added..."
php artisan tinker --execute="
\$exists = Schema::hasColumn('users', 'tenant_id');
if (\$exists) {
    echo '✅ tenant_id column exists in users table';
    
    // Check if we can query it
    try {
        \$user = DB::table('users')->first();
        echo '✅ Can query users table successfully';
    } catch(Exception \$e) {
        echo '❌ Error querying users table: ' . \$e->getMessage();
    }
} else {
    echo '❌ tenant_id column still missing';
}
" --no-interaction

echo "Step 4: Testing manager assignment functionality..."
php artisan tinker --execute="
try {
    \$manager = DB::table('users')->where('role', 'manager')->first();
    if (\$manager) {
        echo '✅ Found manager user: ' . \$manager->name;
        echo '✅ Manager tenant_id: ' . (\$manager->tenant_id ?? 'null');
    } else {
        echo '❌ No manager users found';
    }
} catch(Exception \$e) {
    echo '❌ Error testing manager assignment: ' . \$e->getMessage();
}
" --no-interaction

echo "✅ tenant_id fix completed!"
