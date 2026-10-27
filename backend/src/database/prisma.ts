import "dotenv/config";
import "temporal-polyfill/global";
import postgres from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";
import type { Contract } from "../../prisma/contract.d.ts";
import contractJson from "../../prisma/contract.json" with { type: "json" };

function getConnectionString(): string {
  const connection = process.env["DATABASE_URL"];
  if (!connection) {
    throw new Error("DATABASE_URL must be set before accessing the database");
  }
  return connection;
}

const connection = getConnectionString();
const contract = contractFromJson<Contract>(contractJson);

function createDatabase() {
  return postgres({ contract, url: connection });
}

type AuctionDatabase = ReturnType<typeof createDatabase>;

declare global {
  var auctionHubDatabase: AuctionDatabase | undefined;
}

export const db = globalThis.auctionHubDatabase ?? createDatabase();

if (process.env["NODE_ENV"] !== "production") {
  globalThis.auctionHubDatabase = db;
}
