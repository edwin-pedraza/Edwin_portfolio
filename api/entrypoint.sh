#!/bin/sh
set -e

if [ "$RUN_MIGRATE" = "true" ]; then
  echo "Running migration..."
  node src/migrate.js && echo "Migration done" || echo "Migration skipped (already applied)"
fi

exec node src/index.js
