export function isDatabaseConfigured(): boolean {
  // Prisma has been removed from this repo.
  return false
}

type DbDelegate = {
  [method: string]: (...args: unknown[]) => Promise<unknown>;
};

type DbClient = {
  order: DbDelegate;
  price: DbDelegate;
  airtimeTransaction: DbDelegate;
};

function makeDisabledDelegate(): DbDelegate {
  return new Proxy(
    {},
    {
      get() {
        return async () => {
          throw new Error('Database access is disabled (Prisma removed).');
        };
      },
    },
  ) as DbDelegate;
}

// Placeholder so server handlers still typecheck.
export const db: DbClient = {
  order: makeDisabledDelegate(),
  price: makeDisabledDelegate(),
  airtimeTransaction: makeDisabledDelegate(),
};
