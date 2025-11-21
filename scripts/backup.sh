#!/bin/bash
set -e

# Parse DATABASE_URL to extract connection details
# Format: postgres://user:password@host:port/database
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

echo "Parsing DATABASE_URL..."

# Parse the DATABASE_URL using a more reliable method
# Format: postgres://user:password@host:port/database
DB_URL="${DATABASE_URL#postgres://}"
DB_URL="${DB_URL#postgresql://}"

# Extract credentials (user:password)
DB_CREDENTIALS="${DB_URL%%@*}"
DB_USER="${DB_CREDENTIALS%%:*}"
DB_PASS="${DB_CREDENTIALS#*:}"

# Extract host, port, and database (everything after @)
DB_HOST_PORT_DB="${DB_URL#*@}"

# Extract host:port (everything before /)
DB_HOST_PORT="${DB_HOST_PORT_DB%%/*}"
DB_HOST="${DB_HOST_PORT%%:*}"
DB_PORT="${DB_HOST_PORT#*:}"

# Extract database name (everything after /)
DB_NAME="${DB_HOST_PORT_DB#*/}"

# Remove any query parameters from database name
DB_NAME="${DB_NAME%%\?*}"

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

# Run pg_dump with explicit parameters (plain SQL format)
# Redirect stderr to stdout to capture errors
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --no-password 2>&1 | gzip > "$BACKUP_FILE"

EXIT_CODE=${PIPESTATUS[0]}

# Clear password from environment
unset PGPASSWORD

# Check if pg_dump failed
if [ $EXIT_CODE -ne 0 ]; then
    echo "ERROR: pg_dump failed with exit code $EXIT_CODE"
    # Show the error from the backup file
    if [ -f "$BACKUP_FILE" ]; then
        echo "Error details:"
        gunzip -c "$BACKUP_FILE" 2>&1 || cat "$BACKUP_FILE"
        rm -f "$BACKUP_FILE"
    fi
    exit $EXIT_CODE
fi

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
