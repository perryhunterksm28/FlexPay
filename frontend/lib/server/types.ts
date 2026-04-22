/** Plain HTTP result for shared Next.js route handlers + Express backend. */
export type JsonHandlerResult = {
  status: number;
  body: unknown;
};
