#!/bin/bash
# D1 Database Backup Script for GalleryPia

set -e  # Exit on error

DATABASE_NAME="gallerypia-production"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Starting database backup...${NC}"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Export database to SQL file
echo -e "${YELLOW}📥 Exporting database: ${DATABASE_NAME}${NC}"
npx wrangler d1 export ${DATABASE_NAME} --output="${BACKUP_FILE}" --local

if [ ! -f "${BACKUP_FILE}" ]; then
    echo -e "${RED}❌ Backup failed: File not created${NC}"
    exit 1
fi

# Compress backup
echo -e "${YELLOW}📦 Compressing backup...${NC}"
gzip "${BACKUP_FILE}"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

# Get file size
FILE_SIZE=$(du -h "${COMPRESSED_FILE}" | cut -f1)
echo -e "${GREEN}✅ Backup completed: ${COMPRESSED_FILE} (${FILE_SIZE})${NC}"

# Clean old backups (keep last 7 days)
echo -e "${YELLOW}🧹 Cleaning old backups (keeping last 7 days)...${NC}"
find "${BACKUP_DIR}" -name "backup_*.sql.gz" -mtime +7 -delete 2>/dev/null || true

# Count remaining backups
BACKUP_COUNT=$(ls -1 "${BACKUP_DIR}"/backup_*.sql.gz 2>/dev/null | wc -l)
echo -e "${GREEN}📊 Total backups: ${BACKUP_COUNT}${NC}"

echo -e "${GREEN}✨ Backup process completed successfully!${NC}"
