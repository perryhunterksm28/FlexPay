import type { Order } from './order-types'

/** Shape expected by the platform UI (matches former Supabase row JSON). */
export function orderToApiJson(order: Order) {
  return {
    id: order.id,
    order_ref: order.orderRef,
    phone_number: order.phoneNumber,
    product_type: order.productType,
    amount: Number(order.amount),
    amount_usdc: Number(order.amountUsdc),
    service_fee_usdc: order.serviceFeeUsdc != null ? Number(order.serviceFeeUsdc) : null,
    status: order.status,
    tx_hash: order.txHash,
    refund_tx_hash: order.refundTxHash,
    wallet_address: order.walletAddress,
    currency: order.currency,
    created_at: order.createdAt.toISOString(),
    updated_at: order.updatedAt.toISOString(),
  }
}
