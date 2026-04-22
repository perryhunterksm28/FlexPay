import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connect wallet',
  description: 'Connect your wallet to buy mobile airtime with USDC on Base.',
};

export default function ConnectLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
