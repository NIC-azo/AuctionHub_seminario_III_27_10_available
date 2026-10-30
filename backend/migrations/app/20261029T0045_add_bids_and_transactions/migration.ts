#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/ae979602fd9ee4113048e1117c5a46d9fd0407f952af125c5bf9d5b974441f75/contract';
import startContract from '../../snapshots/ae979602fd9ee4113048e1117c5a46d9fd0407f952af125c5bf9d5b974441f75/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/e2c3f070dd4a541cc2bbf5d6e056077426dfa20c308e9c5a90a837da8797ec7f/contract';
import endContract from '../../snapshots/e2c3f070dd4a541cc2bbf5d6e056077426dfa20c308e9c5a90a837da8797ec7f/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'Bid',
        columns: [
          col('amount', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('productId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Bid',
        index: 'Bid_productId_idx_5858600a',
        columns: ['productId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Bid',
        index: 'Bid_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Bid',
        foreignKey: {
          name: 'Bid_productId_fkey',
          columns: ['productId'],
          references: { schema: 'public', table: 'Product', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Bid',
        foreignKey: {
          name: 'Bid_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
