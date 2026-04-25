#!/bin/sh
set -e

echo "Aplicando migraciones..."
node migrate.mjs

echo "Ejecutando seed..."
node dist/seed/seed.js

echo "Iniciando la aplicación..."
exec node dist/main
