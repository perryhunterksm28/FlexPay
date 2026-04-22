'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Wallet, useWalletContext } from '@coinbase/onchainkit/wallet';
import { FlexpaySignInModal } from './FlexpaySignInModal';
import styles from './landing.module.css';

/** Opens the OnchainKit wallet connect modal once when the user is disconnected. */
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

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid the OnchainKit Wallet fallback button on first paint.
  if (!mounted) return <div className={styles.connectOnlyRoot} aria-hidden />;

  return (
    <Wallet className={styles.walletFullBleed}>
      <Fragment>
        <FlexpaySignInModal />
        <OpenConnectModalOnce />
        <LandingPageInner />
      </Fragment>
    </Wallet>
  );
}

function LandingPageInner() {
  const router = useRouter();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      router.replace('/home');
    }
  }, [isConnected, router]);

  if (isConnected) {
    return (
      <div className={styles.connectOnlyRoot}>
        <p className={styles.connectOnlyRedirecting}>Opening Flexpay…</p>
      </div>
    );
  }

  return <div className={styles.connectOnlyRoot} aria-hidden />;
}
