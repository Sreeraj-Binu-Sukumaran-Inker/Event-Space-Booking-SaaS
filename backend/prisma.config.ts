import { defineConfig } from "prisma/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  // Added seed configuration to run the seed script after migrations
  migrations: {
    seed: "ts-node prisma/seed.ts",
  },

  // Required for CLI commands like db push
  datasource: {
    url: connectionString,
  },

});
