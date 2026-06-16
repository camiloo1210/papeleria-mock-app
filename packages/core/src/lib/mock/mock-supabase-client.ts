import { MOCK_AUTH_USER } from './mock-data';
import { createQueryBuilder } from './mock-query-builder';

class MockSchemaBuilder {
  constructor(private readonly schema: string) {}

  from(table: string) {
    return createQueryBuilder(this.schema, table);
  }
}

class MockStorageBucket {
  constructor(private readonly bucket: string) { void this.bucket; }

  async createSignedUrls(paths: string[], _seconds: number) {
    return {
      data: paths.map(path => ({ path, signedUrl: path })),
      error: null,
    };
  }

  async createSignedUrl(path: string, _seconds: number) {
    return {
      data: { path, signedUrl: path },
      error: null,
    };
  }

  async upload(path: string, _file: unknown) {
    return { data: { path }, error: null };
  }

  getPublicUrl(path: string) {
    return { data: { publicUrl: path } };
  }

  async remove(_paths: string[]) {
    return { data: null, error: null };
  }
}

class MockStorage {
  from(bucket: string) {
    return new MockStorageBucket(bucket);
  }
}

// The mock client mimics the SupabaseClient API surface used across this codebase.
export function createMockSupabaseClient() {
  return {
    auth: {
      async getUser() {
        return { data: { user: MOCK_AUTH_USER }, error: null };
      },
      async getSession() {
        return { data: { session: null }, error: null };
      },
      async signOut() {
        return { error: null };
      },
    },

    schema(schemaName: string) {
      return new MockSchemaBuilder(schemaName);
    },

    from(table: string) {
      return createQueryBuilder('public', table);
    },

    storage: new MockStorage(),

    async rpc(_fn: string, _params?: unknown) {
      return { data: null, error: null };
    },

    channel(_name: string) {
      return {
        on() { return this; },
        subscribe() { return {}; },
      };
    },
  };
}

export type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>;
