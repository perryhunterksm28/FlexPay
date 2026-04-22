import { createPublicClient, http, parseUnits, createWalletClient } from 'viem';
import { base } from '../chain-base';
import { privateKeyToAccount } from 'viem/accounts';
import { AIRTIME_ABI } from '../airtime-abi';
import { isDatabaseConfigured, db } from '../db';
import type { Order } from '../order-types';
import type { JsonHandlerResult } from './types';

const AFRICASTALKING_USERNAME = process.env.NEXT_AFRICASTALKING_USERNAME!;
const AFRICASTALKING_API_KEY = process.env.NEXT_AFRICASTALKING_API_KEY!;
const AFRICASTALKING_URL = process.env.NEXT_AFRICASTALKING_URL!;
const AIRTIME_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AIRTIME_CONTRACT_ADDRESS! as `0x${string}`;
const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY;

function normalizePrivateKey(pk?: string | null): `0x${string}` | null {
  if (!pk) return null;
  const trimmed = pk.trim().startsWith('0x') ? pk.trim() : `0x${pk.trim()}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(trimmed)) {
    return null;
  }
  return trimmed as `0x${string}`;
}

export async function handleAirtimeSendPost(body: unknown): Promise<JsonHandlerResult> {
  try {
    console.log('Request body:', body);

    if (!isDatabaseConfigured()) {
      return {
        status: 400,
        body: {
          error:
            'Demo mode: DATABASE_URL is not set. Configure Postgres + Prisma to enable orders + airtime (see frontend/README.md).',
          demo: true,
        },
      };
    }

    const { orderRef, txHash } = body as { orderRef?: string; txHash?: string };

    if (!orderRef) {
      console.log('ERROR: Missing orderRef');
      return { status: 400, body: { error: 'Missing orderRef' } };
    }

    if (!txHash) {
      console.log('ERROR: Missing transaction hash');
      return { status: 400, body: { error: 'Missing transaction hash' } };
    }

    console.log('Processing order:', orderRef, 'with txHash:', txHash);

    let order: Order | null;
    try {
      order = (await db.order.findUnique({
        where: { orderRef },
      })) as unknown as Order | null;
    } catch (e) {
      console.log('Database error fetching order:', e);
      return { status: 404, body: { error: 'Order not found', details: String(e) } };
    }

    if (!order) {
      console.log('Order not found in database');
      return { status: 404, body: { error: 'Order not found' } };
    }

    console.log('Order found:', order);

    if (order.status !== 'pending') {
      console.log('Order status is not pending:', order.status);

      if (order.status === 'processing') {
        return {
          status: 409,
          body: {
            error: 'Order is already being processed. Please wait.',
            status: 'processing',
          },
        };
      }

      if (order.status === 'refunded') {
        return {
          status: 400,
          body: {
            error: 'Order already refunded',
            status: 'refunded',
            message: 'This order was previously refunded. Please create a new order to try again.',
            refundTxHash: order.refundTxHash,
          },
        };
      }

      if (order.status === 'fulfilled') {
        return {
          status: 400,
          body: {
            error: 'Order already fulfilled',
            status: 'fulfilled',
            message: 'Airtime has already been sent for this order.',
            txHash: order.txHash,
          },
        };
      }

      return {
        status: 400,
        body: {
          error: 'Order not pending',
          status: order.status,
          message: `Order status is ${order.status}. Only pending orders can be processed.`,
        },
      };
    }

    const recentTx = (await db.airtimeTransaction.findFirst({
      where: { orderId: order.id },
      orderBy: { createdAt: 'desc' },
    })) as unknown as { createdAt: Date } | null;

    if (recentTx) {
      const createdAt = recentTx.createdAt;
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      if (createdAt > fiveMinutesAgo) {
        return {
          status: 429,
          body: {
            error:
              'Airtime already attempted recently. Please wait 5 minutes or create a new order if this continues.',
            status: order.status,
          },
        };
      }
    }

    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    try {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash as `0x${string}`,
        confirmations: 1,
      });

      if (receipt.status !== 'success') {
        return { status: 400, body: { error: 'Transaction failed on blockchain' } };
      }

      const orderPaidEvent = receipt.logs.find((log) => {
        try {
          return log.address.toLowerCase() === AIRTIME_CONTRACT_ADDRESS.toLowerCase();
        } catch {
          return false;
        }
      });

      if (!orderPaidEvent) {
        return { status: 400, body: { error: 'OrderPaid event not found in transaction' } };
      }
    } catch (verifyError) {
      console.error('Transaction verification failed:', verifyError);
      return { status: 400, body: { error: 'Could not verify transaction' } };
    }

    await db.order.update({
      where: { id: order.id },
      data: { txHash, status: 'processing' },
    });

    const currency = order.currency || 'KES';

    console.log('Preparing airtime request...');
    const airtimePayload = {
      username: AFRICASTALKING_USERNAME,
      recipients: [
        {
          phoneNumber: order.phoneNumber,
          amount: `${currency} ${Number(order.amount).toFixed(2)}`,
        },
      ],
      maxNumRetry: 3,
      requestMetadata: {
        orderRef: orderRef,
      },
    };

    console.log('Sending airtime request:', airtimePayload);

    const response = await fetch(AFRICASTALKING_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apiKey: AFRICASTALKING_API_KEY,
        Accept: 'application/json',
      },
      body: JSON.stringify(airtimePayload),
    });

    console.log('AfricasTalking response status:', response.status);

    let result: {
      responses?: { status?: string; requestId?: string; errorMessage?: string }[];
      errorMessage?: string;
    };
    try {
      result = await response.json();
    } catch {
      const textResponse = await response.text();
      console.error('AfricasTalking returned non-JSON response:', textResponse);

      if (response.status === 401) {
        return {
          status: 500,
          body: {
            error: 'Authentication failed with airtime provider',
            details: textResponse.substring(0, 200),
          },
        };
      }

      return {
        status: 500,
        body: {
          error: 'Airtime service returned invalid response',
          details: `Status: ${response.status}, Response: ${textResponse.substring(0, 200)}...`,
        },
      };
    }
    console.log('AfricasTalking response:', result);

    if (response.ok && result.responses?.[0]?.status === 'Sent') {
      const requestId = result.responses[0].requestId;
      console.log('Airtime request accepted, requestId:', requestId);

      console.log('Inserting airtime transaction with requestId:', requestId);
      try {
        await db.airtimeTransaction.create({
          data: {
            orderId: order.id,
            phoneNumber: order.phoneNumber,
            amount: order.amount,
            currency: currency,
            providerRequestId: requestId,
            providerStatus: 'Sent',
          },
        });
        console.log('Airtime transaction inserted successfully');
      } catch (insertError) {
        console.error('Failed to insert airtime transaction:', insertError);
      }

      return { status: 200, body: { success: true, requestId } };
    }

    const priorTxs = await db.airtimeTransaction.findFirst({
      where: {
        orderId: order.id,
        providerStatus: { in: ['Sent', 'Success'] },
      },
    });

    if (priorTxs) {
      return {
        status: 409,
        body: {
          error: 'Airtime already sent for this order. No refund issued.',
          status: 'fulfilled',
        },
      };
    }

    const errorMessage = result.responses?.[0]?.errorMessage || result.errorMessage || 'Unknown error';
    const requestId = result.responses?.[0]?.requestId;
    console.log('Airtime request failed:', errorMessage, 'requestId:', requestId);

    if (errorMessage.toLowerCase().includes('duplicate request')) {
      await db.order.update({
        where: { id: order.id },
        data: { status: 'duplicate' },
      });
      return {
        status: 409,
        body: {
          error:
            'A duplicate airtime request was received within the last 5 minutes. Please wait and try again or create a new order.',
          status: 'duplicate',
        },
      };
    }

    console.log('Inserting failed airtime transaction with requestId:', requestId);
    try {
      await db.airtimeTransaction.create({
        data: {
          orderId: order.id,
          phoneNumber: order.phoneNumber,
          amount: order.amount,
          currency: currency,
          providerRequestId: requestId ?? null,
          providerStatus: 'Failed',
          errorMessage: errorMessage,
        },
      });
      console.log('Failed airtime transaction inserted successfully');
    } catch (insertError) {
      console.error('Failed to insert failed airtime transaction:', insertError);
    }

    try {
      const normalizedPk = normalizePrivateKey(TREASURY_PRIVATE_KEY);
      if (!normalizedPk) {
        console.error('REFUND DEBUG: Treasury private key not configured or invalid');
        await db.order.update({
          where: { id: order.id },
          data: { status: 'refund_failed' },
        });
        return {
          status: 500,
          body: { error: 'Airtime send failed. Please contact support with your order reference.' },
        };
      }

      const account = privateKeyToAccount(normalizedPk);
      const walletClient = createWalletClient({
        account,
        chain: base,
        transport: http(),
      });

      const refundAmount = Number(order.amountUsdc) - Number(order.serviceFeeUsdc ?? 0);
      const amountWei = parseUnits(refundAmount.toString(), 6);
      const refundTxHash = await walletClient.writeContract({
        address: AIRTIME_CONTRACT_ADDRESS,
        abi: AIRTIME_ABI,
        functionName: 'refund',
        args: [orderRef, order.walletAddress as `0x${string}`, amountWei],
      });

      await publicClient.waitForTransactionReceipt({
        hash: refundTxHash,
        confirmations: 1,
      });

      try {
        await db.order.update({
          where: { id: order.id },
          data: {
            status: 'refunded',
            refundTxHash: refundTxHash,
          },
        });
      } catch (updateError) {
        console.error('Failed to update order with refund tx hash:', updateError);
      }

      const normalizedError = errorMessage || 'Airtime send failed';
      return {
        status: 400,
        body: {
          error: normalizedError,
          refundTxHash,
        },
      };
    } catch (refundError) {
      console.error('Refund execution failed:', refundError);
      await db.order.update({
        where: { id: order.id },
        data: { status: 'refund_failed' },
      });

      return {
        status: 500,
        body: {
          error: 'Airtime send failed and refund failed',
          details: errorMessage,
          refundError: refundError instanceof Error ? refundError.message : 'Unknown refund error',
        },
      };
    }
  } catch (error) {
    console.error('Error in airtime send API:', error);
    return {
      status: 500,
      body: {
        error: 'Failed to send airtime',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}


