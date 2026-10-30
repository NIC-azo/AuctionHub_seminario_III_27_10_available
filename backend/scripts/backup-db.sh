#!/bin/bash
set -e

# Configuración de variables
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="auctionhub_backup_$TIMESTAMP.sql.gz"
CONTAINER_DB="${CONTAINER_DB:-auctionhub-postgres-1}"
BUCKET_NAME="${BUCKET_NAME:-database-backups}"
MINIO_ENDPOINT="${MINIO_ENDPOINT:-http://minio:9000}"

echo "=== [AuctionHub] Iniciando respaldo de base de datos PostgreSQL ==="

# 1. Ejecutar pg_dump dentro del contenedor y comprimir
docker exec -t "$CONTAINER_DB" pg_dump -U "${DB_USER:-postgres}" "${DB_NAME:-auctionhub}" | gzip > "./$BACKUP_FILE"

echo "Respaldo local comprimido generado: $BACKUP_FILE"

# 2. Subir el respaldo a MinIO utilizando contenedor auxiliar aws-cli en la red de Docker
docker run --rm -v "$(pwd)/$BACKUP_FILE:/tmp/$BACKUP_FILE" --network auctionhub_default \
  -e AWS_ACCESS_KEY_ID="${MINIO_ROOT_USER:-minioadmin}" \
  -e AWS_SECRET_ACCESS_KEY="${MINIO_ROOT_PASSWORD:-minioadminpassword}" \
  amazon/aws-cli:2.27.49 --endpoint-url "$MINIO_ENDPOINT" s3 cp "/tmp/$BACKUP_FILE" "s3://$BUCKET_NAME/$BACKUP_FILE"

# 3. Limpiar archivo temporal
rm -f "./$BACKUP_FILE"

echo "=== [AuctionHub] Respaldo subido exitosamente a s3://$BUCKET_NAME/$BACKUP_FILE ==="

