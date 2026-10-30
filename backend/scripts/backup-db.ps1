param (
    [string]$ContainerDb = "auctionhub-postgres-1",
    [string]$DbUser = "postgres",
    [string]$DbName = "auctionhub",
    [string]$BucketName = "database-backups"
)

$ErrorActionPreference = "Stop"

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "auctionhub_backup_$timestamp.sql"

Write-Host "=== [AuctionHub] Iniciando respaldo de PostgreSQL ===" -ForegroundColor Cyan

# 1. Ejecutar pg_dump dentro del contenedor
docker exec -t $ContainerDb pg_dump -U $DbUser $DbName | Out-File -FilePath "./$backupFile" -Encoding utf8

Write-Host "Respaldo generado localmente: $backupFile" -ForegroundColor Cyan

# 2. Subir a MinIO en la red de Docker
$currentPath = (Get-Location).Path -replace '\\', '/'
docker run --rm -v "${currentPath}:/backup" --network auctionhub_default `
    -e AWS_ACCESS_KEY_ID=minioadmin `
    -e AWS_SECRET_ACCESS_KEY=minioadminpassword `
    amazon/aws-cli:2.27.49 --endpoint-url http://minio:9000 s3 cp "/backup/$backupFile" "s3://$BucketName/$backupFile"

# 3. Limpiar archivo temporal
if (Test-Path "./$backupFile") {
    Remove-Item -Force "./$backupFile"
}

Write-Host "=== [AuctionHub] Respaldo subido exitosamente a s3://$BucketName/$backupFile ===" -ForegroundColor Green

