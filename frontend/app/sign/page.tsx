'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Wallet, useWalletContext } from '@coinbase/onchainkit/wallet';
import { FlexpaySignInModal } from '../FlexpaySignInModal';
import styles from '../landing.module.css';

function OpenConnectModalOnce() {
  const { setIsConnectModalOpen } = useWalletContext();
  const { status } = useAccount();
  const openedRef = useRef(false);

  useEffect(() => {
    if (openedRef.current) return;
    if (status !== 'disconnected') return;
    openedRef.current = true;
    const id = requestAnimationFrame(() => setIsConnectModalOpen(true));
    return () => cancelAnimationFrame(id);
  }, [status, setIsConnectModalOpen]);

  return null;
}

export default function SignPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isConnected) router.replace('/home');
  }, [isConnected, router]);

  if (!mounted) return <div className={styles.connectOnlyRoot} aria-hidden />;

  return (
    <Wallet className={styles.walletFullBleed}>
      <Fragment>
        <FlexpaySignInModal />
        <OpenConnectModalOnce />
        <div className={styles.connectOnlyRoot} aria-hidden />
      </Fragment>
    </Wallet>
  );
}

