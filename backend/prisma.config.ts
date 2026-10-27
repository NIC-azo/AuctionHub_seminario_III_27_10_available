import "dotenv/config";
import { definePrismaConfig } from "prisma/config";
import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";

const connection = process.env["DATABASE_URL"];

if (!connection) {
  throw new Error("DATABASE_URL must be set before running Prisma commands");
}

export default definePrismaConfig({
  orm: ormConfig({
    contract: "./prisma/contract.prisma",
    db: {
      connection,
    },
  }),
  skills: {
    agents: ["claude", "cursor", "agents", "devin"],
    check: false,
  },
});
