import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

const database = new DatabaseSync("prisma/dev.sqlite");
const migrations = [
  "prisma/migrations/20240530213853_create_session_table/migration.sql",
  "prisma/migrations/20260731170000_add_badges/migration.sql",
];

for (const migration of migrations) {
  const sql = readFileSync(migration, "utf8")
    .replaceAll("CREATE TABLE ", "CREATE TABLE IF NOT EXISTS ")
    .replaceAll("CREATE INDEX ", "CREATE INDEX IF NOT EXISTS ");
  database.exec(sql);
}

database.close();
console.log("Development database is ready.");
