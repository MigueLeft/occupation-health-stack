import crypto from 'node:crypto';
import fs from 'node:fs';
import pg from 'pg';

const { Pool } = pg;

// PostgreSQL error codes meaning the schema change was already applied:
// 42P07 = duplicate_table        (CREATE TABLE on existing table)
// 42701 = duplicate_column       (ADD COLUMN on existing column)
// 42710 = duplicate_object       (ADD CONSTRAINT / CREATE INDEX on existing object)
// 42P16 = invalid_table_definition
// 42P01 = undefined_table        (DROP TABLE on already-dropped table)
// 42703 = undefined_column       (DROP COLUMN on already-dropped column)
// 42704 = undefined_object       (DROP INDEX/CONSTRAINT on already-dropped object)
const ALREADY_EXISTS_CODES = new Set([
  '42P07', '42701', '42710', '42P16',
  '42P01', '42703', '42704',
]);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

try {
  // Drizzle stores its journal in the "drizzle" schema
  await client.query('CREATE SCHEMA IF NOT EXISTS drizzle');
  await client.query(`
    CREATE TABLE IF NOT EXISTS drizzle."__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `);

  const journal = JSON.parse(
    fs.readFileSync('./drizzle/meta/_journal.json').toString()
  );

  // Drizzle checks the last applied migration by timestamp
  const { rows } = await client.query(
    'SELECT created_at FROM drizzle."__drizzle_migrations" ORDER BY created_at DESC LIMIT 1'
  );
  const lastApplied = rows.length > 0 ? Number(rows[0].created_at) : 0;

  console.log(`Último timestamp registrado: ${lastApplied}`);

  for (const entry of journal.entries) {
    // Drizzle skips migrations whose timestamp is <= the last recorded one
    if (entry.when <= lastApplied) continue;

    const sqlPath = `./drizzle/${entry.tag}.sql`;
    if (!fs.existsSync(sqlPath)) {
      console.log(`Archivo no encontrado, saltando: ${sqlPath}`);
      continue;
    }

    const sqlContent = fs.readFileSync(sqlPath).toString();
    // Use the same hash algorithm as drizzle-orm/migrator.js
    const hash = crypto.createHash('sha256').update(sqlContent).digest('hex');
    const statements = sqlContent
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      await client.query('BEGIN');
      for (const stmt of statements) {
        await client.query(stmt);
      }
      await client.query(
        'INSERT INTO drizzle."__drizzle_migrations" (hash, created_at) VALUES ($1, $2)',
        [hash, entry.when]
      );
      await client.query('COMMIT');
      console.log(`Migración aplicada: ${entry.tag}`);
    } catch (err) {
      await client.query('ROLLBACK');

      if (ALREADY_EXISTS_CODES.has(err.code)) {
        // The schema already exists in the DB (e.g. restored from backup).
        // Record it in the journal so Drizzle does not attempt to re-run it.
        await client.query(
          'INSERT INTO drizzle."__drizzle_migrations" (hash, created_at) VALUES ($1, $2)',
          [hash, entry.when]
        );
        console.log(`Sincronizada (esquema ya existe en DB): ${entry.tag}`);
      } else {
        console.error(`Error en migración ${entry.tag} [${err.code}]: ${err.message}`);
        throw err;
      }
    }
  }

  console.log('Sincronización de esquemas completada');
} finally {
  client.release();
  await pool.end();
}
