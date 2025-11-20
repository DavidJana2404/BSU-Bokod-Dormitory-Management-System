#!/bin/bash
set -e

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "ERROR: Backup file path not provided"
    echo "Usage: $0 /path/to/backup.dump.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file does not exist: $BACKUP_FILE"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

echo "Starting restore from $BACKUP_FILE..."
echo "WARNING: This will replace all current data in the database!"

# Create a safety backup before restoring
BACKUP_DIR="${BACKUP_DIR:-/var/data/backups}"
SAFETY_BACKUP="$BACKUP_DIR/safety_before_restore_$(date +%Y%m%d_%H%M%S).dump.gz"
echo "Creating safety backup at $SAFETY_BACKUP..."
pg_dump "$DATABASE_URL" | gzip > "$SAFETY_BACKUP"
echo "Safety backup created: $SAFETY_BACKUP"

# Extract database name from DATABASE_URL
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*\/\([^?]*\).*|\1|p')

# Disconnect all active connections to the database
echo "Disconnecting active connections..."
psql "$DATABASE_URL" -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$DB_NAME' AND pid <> pg_backend_pid();" || true

# Drop and recreate the database schema (safer than dropping the database itself on Render)
echo "Cleaning database..."
gunzip -c "$BACKUP_FILE" | psql "$DATABASE_URL"

echo "Restore completed successfully!"
echo "Safety backup saved at: $SAFETY_BACKUP"
exit 0
