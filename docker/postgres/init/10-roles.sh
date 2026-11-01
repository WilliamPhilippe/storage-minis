#!/usr/bin/env bash
# Creates the two application roles (owner-approved 2026-10-31, D2/D3). The
# official PostgreSQL image runs this file once, when it initializes an empty
# data directory; it never runs again for an existing volume.
#
# Retained custom exception: the image's SQL init files cannot read
# environment variables, so this script passes the role passwords to psql as
# variables, which psql quotes as literals.
#
#   storage_minis_owner  owns the database and its schemas; runs migrations.
#   storage_minis_app    least privilege: DML on tables, sequence use and
#                        function execution through default privileges.
#
# The default privileges are database-wide rather than per schema, so they
# survive a disposable test database recreating its public schema. To rotate
# a password on an existing volume, run ALTER ROLE ... PASSWORD as the
# postgres superuser (see README).
set -euo pipefail

: "${POSTGRES_USER:?POSTGRES_USER is required}"
: "${POSTGRES_DB:?POSTGRES_DB is required}"
: "${DB_OWNER_PASSWORD:?DB_OWNER_PASSWORD is required}"
: "${DB_APP_PASSWORD:?DB_APP_PASSWORD is required}"

psql --no-psqlrc --set ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  --set database="$POSTGRES_DB" \
  --set owner_password="$DB_OWNER_PASSWORD" \
  --set app_password="$DB_APP_PASSWORD" <<'SQL'
CREATE ROLE storage_minis_owner LOGIN PASSWORD :'owner_password';
CREATE ROLE storage_minis_app LOGIN PASSWORD :'app_password';
ALTER DATABASE :"database" OWNER TO storage_minis_owner;
GRANT CONNECT ON DATABASE :"database" TO storage_minis_app;
GRANT USAGE ON SCHEMA public TO storage_minis_app;
ALTER DEFAULT PRIVILEGES FOR ROLE storage_minis_owner
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO storage_minis_app;
ALTER DEFAULT PRIVILEGES FOR ROLE storage_minis_owner
  GRANT USAGE, SELECT ON SEQUENCES TO storage_minis_app;
ALTER DEFAULT PRIVILEGES FOR ROLE storage_minis_owner
  GRANT EXECUTE ON FUNCTIONS TO storage_minis_app;
SQL
