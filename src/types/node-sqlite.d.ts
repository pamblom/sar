declare module "node:sqlite" {
  export class DatabaseSync {
    constructor(path: string);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
  }

  export class StatementSync {
    run(...params: Array<string | number | bigint | null>): {
      lastInsertRowid: number | bigint;
      changes: number;
    };
    get(...params: Array<string | number | bigint | null>): unknown;
    all(...params: Array<string | number | bigint | null>): unknown[];
  }
}
