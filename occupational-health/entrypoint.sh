#!/bin/sh
set -e

echo "Sincronizando esquemas..."
node sync-journal.mjs

echo "Aplicando migraciones..."
node migrate.mjs

echo "Ejecutando seed..."
node dist/seed/seed.js

echo "Iniciando la aplicación..."
exec node dist/main
