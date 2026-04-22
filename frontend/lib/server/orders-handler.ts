import { randomUUID } from 'node:crypto';
import { nanoid } from 'nanoid';
import { demoPutOrder, demoGetOrder, type DemoOrderRow } from '../demo-orders';
import {
  AIRTIME_AMOUNT_BOUNDS_BY_ISO,
  AIRTIME_SUPPORTED_ISO,
  matchDialFromPhoneDigits,
} from '../country-phone-data';
import { fetchUsdcToFiat } from '../fx';
import { isDatabaseConfigured, db } from '../db';
import { orderToApiJson } from '../order-json';
import type { Order } from '../order-types';
import type { JsonHandlerResult } from './types';

const SERVICE_FEE = parseFloat(process.env.SERVICE_FEE || '0.05');

export async function handleCreateOrderPost(body: unknown): Promise<JsonHandlerResult> {
  try {
    const parsed = body as {
      phoneNumber?: string;
      amountKes?: number;
      walletAddress?: string;
    };
    const { phoneNumber, amountKes, walletAddress } = parsed;

    if (!phoneNumber || amountKes == null || !walletAddress) {
      return {
        status: 400,
        body: { error: 'Missing phoneNumber, amountKes, or walletAddress' },
      };
    }

    const phoneWithoutPlus = phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber;
    const dialMatch = matchDialFromPhoneDigits(phoneWithoutPlus);
    if (!dialMatch) {
      return {
        status: 400,
        body: { error: 'Unrecognized country calling code in phone number' },
      };
    }

    if (!AIRTIME_SUPPORTED_ISO.has(dialMatch.iso2)) {
      return {
        status: 400,
        body: {
          error:
            'Mobile airtime is only available for Kenya, Tanzania, Uganda, Rwanda, and South Africa at this time.',
        },
      };
    }

    const currency = dialMatch.currency;
    const restrictions =
      AIRTIME_AMOUNT_BOUNDS_BY_ISO[dialMatch.iso2] ?? AIRTIME_AMOUNT_BOUNDS_BY_ISO.KE!;

    if (amountKes < restrictions.lower || amountKes > restrictions.upper) {
      return {
        status: 400,
        body: {
          error: `Amount must be between ${restrictions.lower} and ${restrictions.upper} ${currency}`,
        },
      };
    }

    if (!isDatabaseConfigured()) {
      const price = await fetchUsdcToFiat(currency);
      const airtimeUsdc = amountKes / price;
      const serviceFeeUsdc = SERVICE_FEE;
      const totalUsdc = airtimeUsdc + serviceFeeUsdc;
      const orderRef = nanoid(8);
      const id = randomUUID();
      const now = new Date().toISOString();
      const row: DemoOrderRow = {
        id,
        order_ref: orderRef,
        phone_number: phoneNumber,
        product_type: 'airtime',
        amount: amountKes,
        amount_usdc: totalUsdc,
        service_fee_usdc: serviceFeeUsdc,
        status: 'pending',
        wallet_address: walletAddress,
        currency,
        tx_hash: null,
        refund_tx_hash: null,
        created_at: now,
        updated_at: now,
      };
      demoPutOrder(row);
      return {
        status: 200,
        body: {
          orderRef,
          amountKes,
          amountUsdc: totalUsdc,
          airtimeUsdc,
          serviceFeeUsdc,
          price,
          orderId: id,
          currency,
          demo: true,
        },
      };
    }

    const priceRow = (await db.price.findUnique({
      where: {
        token_currency: { token: 'USDC', currency },
      },
    })) as unknown as { price: unknown } | null;

    let price: number;
    if (!priceRow) {
      price = await fetchUsdcToFiat(currency);
      await db.price.upsert({
        where: {
          token_currency: { token: 'USDC', currency },
        },
        create: { token: 'USDC', currency, price },
        update: { price },
      });
    } else {
      price = Number(priceRow.price);
    }
    const airtimeUsdc = amountKes / price;
    const serviceFeeUsdc = SERVICE_FEE;
    const totalUsdc = airtimeUsdc + serviceFeeUsdc;

    const orderRef = nanoid(8);

    const orderData = (await db.order.create({
      data: {
        orderRef,
        phoneNumber,
        productType: 'airtime',
        amount: amountKes,
        amountUsdc: totalUsdc,
        serviceFeeUsdc,
        status: 'pending',
        walletAddress,
        currency,
      },
    })) as unknown as { id: string };

    return {
      status: 200,
      body: {
        orderRef,
        amountKes,
        amountUsdc: totalUsdc,
        airtimeUsdc,
        serviceFeeUsdc,
        price,
        orderId: orderData.id,
        currency,
      },
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return { status: 500, body: { error: 'Failed to create order' } };
  }
}

export async function handleGetOrderByRef(orderRef: string): Promise<JsonHandlerResult> {
  try {
    if (!isDatabaseConfigured()) {
      const demo = demoGetOrder(orderRef);
      if (!demo) {
        return { status: 404, body: { error: 'Order not found' } };
      }
      return { status: 200, body: demo };
    }

    const order = (await db.order.findUnique({
      where: { orderRef },
    })) as unknown as Order | null;

    if (!order) {
      return { status: 404, body: { error: 'Order not found' } };
    }

    return { status: 200, body: orderToApiJson(order) };
  } catch (error) {
    console.error('Error fetching order:', error);
    return { status: 500, body: { error: 'Failed to fetch order' } };
  }
}


