import { isDatabaseConfigured, db } from '../db';
import type { JsonHandlerResult } from './types';

export async function handleAirtimeValidatePost(body: unknown): Promise<JsonHandlerResult> {
  try {
    const data = body as {
      transactionId?: string;
      phoneNumber?: string;
      sourceIpAddress?: string;
      currencyCode?: string;
      amount?: string | number;
      requestMetadata?: { orderRef?: string };
    };

    const { transactionId, phoneNumber, sourceIpAddress, currencyCode, amount, requestMetadata } = data;

    console.log('Airtime Validation Callback Data:', data);
    console.log('Received IP Address:', sourceIpAddress);

    const missing =
      transactionId == null ||
      transactionId === '' ||
      phoneNumber == null ||
      phoneNumber === '' ||
      sourceIpAddress == null ||
      sourceIpAddress === '' ||
      currencyCode == null ||
      currencyCode === '' ||
      amount == null ||
      amount === '';

    if (missing) {
      console.warn('Missing parameters in Airtime Validation Callback');
      return { status: 400, body: { status: 'Failed' } };
    }

    if (!isDatabaseConfigured()) {
      return { status: 200, body: { status: 'Validated', demo: true } };
    }

    const orderRef = requestMetadata?.orderRef;

    const order = (await db.order.findFirst({
      where: {
        status: { in: ['pending', 'processing'] },
        ...(orderRef
          ? { orderRef }
          : {
              phoneNumber,
              amount: Number(amount),
            }),
      },
      orderBy: { createdAt: 'desc' },
    })) as unknown as { currency: string } | null;

    if (!order) {
      console.error('Pending order not found for validation:', { phoneNumber, amount });
      return { status: 404, body: { status: 'Failed' } };
    }

    console.log('Order found for validation:', order);

    if (order.currency.toUpperCase() !== String(currencyCode).toUpperCase()) {
      console.warn('Currency mismatch in validation callback:', {
        expected: order.currency,
        received: currencyCode,
      });
      return { status: 400, body: { status: 'Failed' } };
    }

    return { status: 200, body: { status: 'Validated' } };
  } catch (error) {
    console.error('Error in Airtime Validation Callback:', error);
    return { status: 500, body: { status: 'Failed' } };
  }
}


