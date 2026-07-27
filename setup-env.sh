#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

SERVER_HOST="$(hostname -I | awk '{print $1}')"

if [ -z "$SERVER_HOST" ]; then
  echo "No se pudo detectar la IP de la máquina." >&2
  exit 1
fi

echo "SERVER_HOST=${SERVER_HOST}" > .env

echo "SERVER_HOST=${SERVER_HOST} escrito en .env"
