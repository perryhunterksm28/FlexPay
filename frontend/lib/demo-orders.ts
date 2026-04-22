/**
 * In-memory orders when DATABASE_URL is not set (local UI / demo).
 * Survives Next.js dev HMR via globalThis.
 */
export type DemoOrderRow = {
  id: string;
  order_ref: string;
  phone_number: string;
  product_type: string;
  amount: number;
  amount_usdc: number;
  service_fee_usdc: number;
  status: string;
  wallet_address: string;
  currency: string;
  tx_hash: string | null;
  refund_tx_hash: string | null;
  created_at: string;
  updated_at: string;
};

type GlobalWithDemo = typeof globalThis & {
  __flexpayDemoOrders?: Map<string, DemoOrderRow>;
};

function getStore(): Map<string, DemoOrderRow> {
  const g = globalThis as GlobalWithDemo;
  if (!g.__flexpayDemoOrders) {
    g.__flexpayDemoOrders = new Map();
  }
  return g.__flexpayDemoOrders;
}

export function demoPutOrder(row: DemoOrderRow): void {
  getStore().set(row.order_ref, row);
}

export function demoGetOrder(orderRef: string): DemoOrderRow | undefined {
  return getStore().get(orderRef);
}
