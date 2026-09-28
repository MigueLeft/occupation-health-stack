#!/usr/bin/env bash
# Respaldo automático de la base de datos PostgreSQL hacia una carpeta de Windows.
#
# Genera un archivo .pgdump (formato custom, igual que el botón "Exportar" del
# sistema), por lo que se puede restaurar desde la pantalla de Respaldos.
#
# Uso:
#   ./scripts/backup-db.sh
#
# Variables opcionales:
#   BACKUP_DIR      Carpeta destino (ruta WSL). Default: /mnt/c/Respaldos/occupational-health
#   RETENTION_DAYS  Días que se conservan los respaldos. Default: 30

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/mnt/c/Respaldos/occupational-health}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB_USER="postgres"
DB_NAME="occupational_health"

TIMESTAMP="$(date +%Y-%m-%d_%H%M)"
FILE="$BACKUP_DIR/respaldo_${TIMESTAMP}.pgdump"
TMP_FILE="$FILE.tmp"
LOG_FILE="$BACKUP_DIR/respaldos.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

mkdir -p "$BACKUP_DIR"

# Evita que dos respaldos corran al mismo tiempo
exec 9>"/tmp/backup-db.lock"
if ! flock -n 9; then
  log "ERROR: ya hay un respaldo en curso"
  exit 1
fi

trap 'rm -f "$TMP_FILE"' EXIT

cd "$PROJECT_DIR"

# Al arrancar el equipo los contenedores tardan en levantar: esperar hasta 5 min
for i in $(seq 1 60); do
  if docker compose exec -T db pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
    break
  fi
  if [ "$i" -eq 60 ]; then
    log "ERROR: la base de datos no respondió después de 5 minutos"
    exit 1
  fi
  sleep 5
done

log "Iniciando respaldo -> $FILE"

# Se escribe a un .tmp y se renombra al final para no dejar archivos a medias
docker compose exec -T db \
  pg_dump -U "$DB_USER" -d "$DB_NAME" --format=custom --no-acl --no-owner \
  > "$TMP_FILE"

if [ ! -s "$TMP_FILE" ]; then
  log "ERROR: el respaldo quedó vacío"
  exit 1
fi

mv "$TMP_FILE" "$FILE"
log "Respaldo OK ($(du -h "$FILE" | cut -f1))"

# Limpieza de respaldos antiguos
deleted=$(find "$BACKUP_DIR" -maxdepth 1 -name 'respaldo_*.pgdump' -mtime +"$RETENTION_DAYS" -print -delete | wc -l)
if [ "$deleted" -gt 0 ]; then
  log "Eliminados $deleted respaldo(s) con más de $RETENTION_DAYS días"
fi
