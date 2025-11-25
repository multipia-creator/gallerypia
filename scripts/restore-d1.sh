#!/bin/bash
# D1 Database Restore Script for GalleryPia

set -e  # Exit on error

DATABASE_NAME="gallerypia-production"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Usage: ./restore-d1.sh <backup-file.sql.gz> [--production]${NC}"
    echo -e "${BLUE}Examples:${NC}"
    echo -e "  ./restore-d1.sh backups/backup_20241124_120000.sql.gz"
    echo -e "  ./restore-d1.sh backups/backup_20241124_120000.sql.gz --production"
    exit 1
fi

BACKUP_FILE=$1
PRODUCTION_MODE=false

if [ "$2" == "--production" ]; then
    PRODUCTION_MODE=true
fi

# Check if backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
    echo -e "${RED}❌ Backup file not found: ${BACKUP_FILE}${NC}"
    exit 1
fi

TEMP_SQL="temp_restore_$$.sql"

echo -e "${YELLOW}🔄 Starting database restore...${NC}"
echo -e "${BLUE}📦 Backup file: ${BACKUP_FILE}${NC}"

# Decompress
echo -e "${YELLOW}📤 Decompressing backup...${NC}"
gunzip -c "${BACKUP_FILE}" > "${TEMP_SQL}"

# Count operations
TABLE_COUNT=$(grep -c "CREATE TABLE" "${TEMP_SQL}" || echo "0")
INSERT_COUNT=$(grep -c "INSERT INTO" "${TEMP_SQL}" || echo "0")
echo -e "${BLUE}📊 Tables: ${TABLE_COUNT}, Inserts: ${INSERT_COUNT}${NC}"

# Ask for confirmation
if [ "$PRODUCTION_MODE" = true ]; then
    echo -e "${RED}⚠️  WARNING: This will restore to PRODUCTION database!${NC}"
    read -p "Type 'yes' to continue: " confirm
else
    echo -e "${YELLOW}ℹ️  Restoring to LOCAL database${NC}"
    read -p "Continue? (yes/no): " confirm
fi

if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}❌ Restore cancelled${NC}"
    rm "${TEMP_SQL}"
    exit 0
fi

# Restore
echo -e "${YELLOW}🔄 Restoring database...${NC}"
if [ "$PRODUCTION_MODE" = true ]; then
    npx wrangler d1 execute ${DATABASE_NAME} --file="${TEMP_SQL}"
else
    npx wrangler d1 execute ${DATABASE_NAME} --local --file="${TEMP_SQL}"
fi

# Cleanup
rm "${TEMP_SQL}"
echo -e "${GREEN}✅ Restore completed successfully!${NC}"

# Verification
echo -e "${YELLOW}🔍 Verifying database...${NC}"
if [ "$PRODUCTION_MODE" = true ]; then
    npx wrangler d1 execute ${DATABASE_NAME} --command="SELECT COUNT(*) as table_count FROM sqlite_master WHERE type='table'"
else
    npx wrangler d1 execute ${DATABASE_NAME} --local --command="SELECT COUNT(*) as table_count FROM sqlite_master WHERE type='table'"
fi

echo -e "${GREEN}✨ Restore process completed!${NC}"
