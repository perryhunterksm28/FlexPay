import { createPublicClient, createWalletClient, http, parseUnits } from 'viem';
import { base } from '../chain-base';
import { privateKeyToAccount } from 'viem/accounts';
import type { Order } from '../order-types';
import { AIRTIME_ABI } from '../airtime-abi';
import { isDatabaseConfigured, db } from '../db';
import type { JsonHandlerResult } from './types';

const AIRTIME_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AIRTIME_CONTRACT_ADDRESS! as `0x${string}`;
const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY;

async function processSuccessfulTransaction(orderId: string) {
  try {
    await db.order.update({
      where: { id: orderId },
      data: { status: 'fulfilled' },
    });
  } catch (e) {
    console.error('Failed to update order to fulfilled:', e);
  }
}

async function executeRefund(order: Order): Promise<string | undefined> {
  if (!TREASURY_PRIVATE_KEY) {
    console.error('Treasury private key not configured');
    await markOrderAsRefunded(order.id);
    throw new Error('Manual refund required');
  }

  const privateKey = TREASURY_PRIVATE_KEY.startsWith('0x')
    ? TREASURY_PRIVATE_KEY
    : `0x${TREASURY_PRIVATE_KEY}`;
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(),
  });

  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  });

  const refundAmount = Number(order.amountUsdc) - Number(order.serviceFeeUsdc ?? 0);
  const amountWei = parseUnits(refundAmount.toString(), 6);
  const refundTxHash = await walletClient.writeContract({
    address: AIRTIME_CONTRACT_ADDRESS,
    abi: AIRTIME_ABI,
    functionName: 'refund',
    args: [order.orderRef, order.walletAddress as `0x${string}`, amountWei],
  });

  await publicClient.waitForTransactionReceipt({
    hash: refundTxHash,
    confirmations: 1,
  });

  return refundTxHash || undefined;
}

async function markOrderAsRefunded(orderId: string, txHash?: string) {
  try {
    await db.order.update({
      where: { id: orderId },
      data: {
        status: 'refunded',
        ...(txHash ? { refundTxHash: txHash } : {}),
      },
    });
  } catch (e) {
    console.error('Failed to update order refund status:', e);
  }
}

async function updateTransactionStatus(transactionId: bigint, status: string) {
  try {
    await db.airtimeTransaction.update({
      where: { id: transactionId },
      data: { providerStatus: status },
    });
  } catch (e) {
    console.error('Failed to update transaction:', e);
  }
}

/** AfricasTalking status callback: `requestId` + `status` (form fields). */
export async function handleAirtimeStatusPost(fields: {
  requestId?: string | null;
  status?: string | null;
}): Promise<JsonHandlerResult> {
  try {
    const requestId = fields.requestId ?? undefined;
    const status = fields.status ?? undefined;

    if (!isDatabaseConfigured()) {
      return {
        status: 200,
        body: { success: true, demo: true, note: 'No database: status callback ignored.' },
      };
    }

    if (!requestId || !status) {
      return { status: 400, body: { error: 'Missing requestId or status' } };
    }

    const transaction = (await db.airtimeTransaction.findFirst({
      where: { providerRequestId: requestId },
      include: { order: true },
    })) as unknown as
      | { id: bigint; orderId: string; order: Order }
      | null;

    if (!transaction) {
      return { status: 404, body: { error: 'Transaction not found' } };
    }

    await updateTransactionStatus(transaction.id, status);

    if (status === 'Success') {
      await processSuccessfulTransaction(transaction.orderId);
    } else if (status === 'Failed') {
      try {
        const refundTxHash = await executeRefund(transaction.order);
        await markOrderAsRefunded(transaction.orderId, refundTxHash);
      } catch (refundError) {
        console.error('Refund execution failed:', refundError);
        await markOrderAsRefunded(transaction.orderId);
        if (refundError instanceof Error && refundError.message === 'Manual refund required') {
          return { status: 500, body: { error: 'Manual refund required' } };
        }
      }
    }

    return { status: 200, body: { success: true } };
  } catch (error) {
    console.error('Error handling airtime status:', error);
    return {
      status: 500,
      body: {
        error: 'Failed to handle status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}


