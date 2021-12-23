#!/usr/bin/env bash
set -e

# Generate API Spec
node index.js api /var/apispec/data $PGHOST 5432 $PGDATABASE $PGUSER $PGPASSWORD
node index.js esi /var/apispec/data $PGHOST 5432 $PGDATABASE $PGUSER $PGPASSWORD
node index.js sde /var/apispec/data $PGHOST 5432 $PGDATABASE $PGUSER $PGPASSWORD
