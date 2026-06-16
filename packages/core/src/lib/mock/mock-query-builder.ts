import { getMockStore, type MockStore } from './mock-data';

type Filter = {
  col: string;
  op: 'eq' | 'neq' | 'in' | 'gte' | 'lte' | 'gt' | 'lt' | 'not_in';
  val: unknown;
};

type MockResult = { data: unknown; error: null; count?: number };

export class MockQueryBuilder implements PromiseLike<MockResult> {
  private _schema: string;
  private _table: string;
  private _store: MockStore;
  private _operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select';
  private _payload: unknown = undefined;
  private _filters: Filter[] = [];
  private _withCount = false;

  constructor(schema: string, table: string, store: MockStore) {
    this._schema = schema;
    this._table = table;
    this._store = store;
  }

  // ---------- Column / option selectors ----------

  select(cols?: string, opts?: { count?: string }): this {
    if (opts?.count) this._withCount = true;
    void cols;
    return this;
  }

  // ---------- Filters ----------

  eq(col: string, val: unknown): this {
    this._filters.push({ col, op: 'eq', val });
    return this;
  }

  neq(col: string, val: unknown): this {
    this._filters.push({ col, op: 'neq', val });
    return this;
  }

  in(col: string, vals: unknown[]): this {
    this._filters.push({ col, op: 'in', val: vals });
    return this;
  }

  not(col: string, operator: string, val: unknown): this {
    if (operator === 'in') {
      // val is a string like "(1,2,3)"
      const ids = String(val)
        .replace(/[()]/g, '')
        .split(',')
        .map(v => v.trim());
      this._filters.push({ col, op: 'not_in', val: ids });
    }
    return this;
  }

  gte(col: string, val: unknown): this {
    this._filters.push({ col, op: 'gte', val });
    return this;
  }

  lte(col: string, val: unknown): this {
    this._filters.push({ col, op: 'lte', val });
    return this;
  }

  gt(col: string, val: unknown): this {
    this._filters.push({ col, op: 'gt', val });
    return this;
  }

  lt(col: string, val: unknown): this {
    this._filters.push({ col, op: 'lt', val });
    return this;
  }

  // ---------- Ordering / pagination ----------

  order(_col: string, _opts?: unknown): this { return this; }
  limit(_n: number): this { return this; }
  range(_from: number, _to: number): this { return this; }

  // ---------- Write operations ----------

  insert(data: unknown): this { this._operation = 'insert'; this._payload = data; return this; }
  update(data: unknown): this { this._operation = 'update'; this._payload = data; return this; }
  delete(): this { this._operation = 'delete'; return this; }
  upsert(data: unknown, _opts?: unknown): this { this._operation = 'upsert'; this._payload = data; return this; }

  // ---------- Terminal methods ----------

  single(): Promise<MockResult> {
    return this._execute().then(result => ({
      data: Array.isArray(result.data) ? (result.data[0] ?? null) : result.data,
      error: null,
    }));
  }

  maybeSingle(): Promise<MockResult> {
    return this.single();
  }

  // Makes the builder awaitable directly: `const { data } = await builder`
  then<T1, T2>(
    onFulfilled?: ((v: MockResult) => T1 | PromiseLike<T1>) | null,
    onRejected?: ((reason: unknown) => T2 | PromiseLike<T2>) | null,
  ): Promise<T1 | T2> {
    return this._execute().then(onFulfilled as never, onRejected as never) as Promise<T1 | T2>;
  }

  // ---------- Execution ----------

  private _execute(): Promise<MockResult> {
    const key = `${this._schema}:${this._table}`;
    const tableData = (this._store[key] ?? []) as Record<string, unknown>[];

    if (this._operation === 'delete') {
      // Silently succeed; in-memory store stays for reads
      return Promise.resolve({ data: null, error: null });
    }

    if (this._operation === 'insert') {
      const payload = this._payload as Record<string, unknown>;
      const newRow = { id: this._nextId(), ...payload };
      this._store[key] = [...tableData, newRow];
      return Promise.resolve({ data: [newRow], error: null });
    }

    if (this._operation === 'upsert') {
      const payload = this._payload as Record<string, unknown>;
      const newRow = { id: this._nextId(), ...payload };
      return Promise.resolve({ data: [newRow], error: null });
    }

    if (this._operation === 'update') {
      const payload = this._payload as Record<string, unknown>;
      const filtered = this._applyFilters(tableData);
      const updated = filtered.map(row => ({ ...row, ...payload }));
      return Promise.resolve({ data: updated, error: null });
    }

    // select
    const filtered = this._applyFilters(tableData);
    const result: MockResult = { data: filtered, error: null };
    if (this._withCount) result.count = filtered.length;
    return Promise.resolve(result);
  }

  private _applyFilters(rows: Record<string, unknown>[]): Record<string, unknown>[] {
    let result = rows;
    const toNum = (v: any) => (typeof v === 'string' && isNaN(Number(v)) && !isNaN(Date.parse(v))) ? Date.parse(v) : Number(v);

    for (const f of this._filters) {
      // Skip nested column filters (e.g. 'order.tenant_id') — joins aren't simulated
      if (f.col.includes('.')) continue;

      switch (f.op) {
        case 'eq':
          // eslint-disable-next-line eqeqeq
          result = result.filter(r => r[f.col] == f.val);
          break;
        case 'neq':
          // eslint-disable-next-line eqeqeq
          result = result.filter(r => r[f.col] != f.val);
          break;
        case 'in': {
          const vals = f.val as unknown[];
          // eslint-disable-next-line eqeqeq
          result = result.filter(r => vals.some(v => v == r[f.col]));
          break;
        }
        case 'not_in': {
          const ids = f.val as string[];
          // eslint-disable-next-line eqeqeq
          result = result.filter(r => !ids.some(id => id == String(r[f.col])));
          break;
        }
        case 'gte':
          result = result.filter(r => toNum(r[f.col]) >= toNum(f.val));
          break;
        case 'lte':
          result = result.filter(r => toNum(r[f.col]) <= toNum(f.val));
          break;
        case 'gt':
          result = result.filter(r => toNum(r[f.col]) > toNum(f.val));
          break;
        case 'lt':
          result = result.filter(r => toNum(r[f.col]) < toNum(f.val));
          break;
      }
    }
    return result;
  }

  private _nextId(): number {
    return Math.floor(Math.random() * 900000) + 100000;
  }
}

export function createQueryBuilder(schema: string, table: string): MockQueryBuilder {
  return new MockQueryBuilder(schema, table, getMockStore());
}
