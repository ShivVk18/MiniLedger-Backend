#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/3ac824f059a35a7fb50200dd3d13e0c27f265081e1d27e493dede86d2199f717/contract';
import endContract from '../../snapshots/3ac824f059a35a7fb50200dd3d13e0c27f265081e1d27e493dede86d2199f717/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/85a37a46b39752f5ed73e2f9c156fba54cb575a0510606e288cfa2dc58d06127/contract';
import startContract from '../../snapshots/85a37a46b39752f5ed73e2f9c156fba54cb575a0510606e288cfa2dc58d06127/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'OtpCode',
        columns: [
          col('code', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('expiresAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'OtpCode',
        index: 'OtpCode_phone_idx_8db23f45',
        columns: ['phone'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
