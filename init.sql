-- ── init.sql ──────────────────────────────────────────────────────────────────
-- This runs automatically when the PostgreSQL container starts for the first time.
-- It creates your 4 schemas so the DB structure is ready before the app connects.
-- Your tables are created separately via DBeaver or migration scripts.

CREATE SCHEMA IF NOT EXISTS registers;
CREATE SCHEMA IF NOT EXISTS inventory;
CREATE SCHEMA IF NOT EXISTS ordering_system;
CREATE SCHEMA IF NOT EXISTS analytics;