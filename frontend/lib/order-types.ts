export type Order = {
  id: string;
  orderRef: string;
  phoneNumber: string;
  productType: string;
  amount: number;
  amountUsdc: number;
  serviceFeeUsdc: number | null;
  status: string;
  txHash: string | null;
  refundTxHash: string | null;
  walletAddress: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
};

