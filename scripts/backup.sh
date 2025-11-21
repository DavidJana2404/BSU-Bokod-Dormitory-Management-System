#!/bin/bash
set -e

# Parse DATABASE_URL to extract connection details
# Format: postgres://user:password@host:port/database
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

echo "Parsing DATABASE_URL..."

# Parse the DATABASE_URL
# Remove postgres:// or postgresql:// prefix
DB_URL="${DATABASE_URL#postgres://}"
DB_URL="${DB_URL#postgresql://}"

# Extract user and rest
DB_USER="${DB_URL%%:*}"
DB_REST="${DB_URL#*:}"

# Extract password and rest
DB_PASS="${DB_REST%%@*}"
DB_REST="${DB_REST#*@}"

# Extract host and rest
DB_HOST="${DB_REST%%:*}"
DB_REST="${DB_REST#*:}"

# Extract port and database
DB_PORT="${DB_REST%%/*}"
DB_NAME="${DB_REST#*/}"

echo "Database: $DB_NAME"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "User: $DB_USER"

# Create backup directory if it doesn't exist
BACKUP_DIR="${BACKUP_DIR:-/var/data/backups}"
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
BACKUP_FILE="$BACKUP_DIR/pg_$(date +%Y%m%d_%H%M%S).dump.gz"

echo "Starting backup to $BACKUP_FILE..."

# Use pg_dump with explicit connection parameters and gzip compression
# Set PGPASSWORD environment variable for authentication
export PGPASSWORD="$DB_PASS"

# Run pg_dump with explicit parameters
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --no-password -Fc | gzip > "$BACKUP_FILE"

# Clear password from environment
unset PGPASSWORD

# Check if backup was successful
if [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "Backup completed successfully!"
    echo "File: $BACKUP_FILE"
    echo "Size: $BACKUP_SIZE"
    echo "$BACKUP_FILE"  # Return the filename for the app
    exit 0
else
    echo "ERROR: Backup file was not created"
    exit 1
fi
