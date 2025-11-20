#!/bin/bash
set -e

# Parse DATABASE_URL to extract connection details
# Format: postgres://user:password@host:port/database
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

# Create backup directory if it doesn't exist
BACKUP_DIR="${BACKUP_DIR:-/var/data/backups}"
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
BACKUP_FILE="$BACKUP_DIR/pg_$(date +%Y%m%d_%H%M%S).dump.gz"

echo "Starting backup to $BACKUP_FILE..."

# Use pg_dump with gzip compression
# The DATABASE_URL is already in the correct format for pg_dump
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"

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
