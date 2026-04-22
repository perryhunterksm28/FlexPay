'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Wallet, useWalletContext } from '@coinbase/onchainkit/wallet';
import { FlexpaySignInModal } from '../FlexpaySignInModal';
import landing from '../landing.module.css';
import styles from './connect.module.css';

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

export default function ConnectPage() {
  return (
    <Wallet className={landing.walletFullBleed}>
      <Fragment>
        <FlexpaySignInModal />
        <OpenConnectModalOnce />
        <ConnectPageInner />
      </Fragment>
    </Wallet>
  );
}

function ConnectPageInner() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (isConnected) {
      router.replace('/platform');
    }
  }, [isConnected, router]);

  const handleComingSoon = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  return (
    <div className={landing.landingContainer}>
      <header className={landing.header}>
        <div className={landing.headerContent}>
          <Link href="/" className={landing.logo}>
            <Image
              src="/flexpay_logo.png"
              alt="Flexpay Logo"
              width={120}
              height={120}
              priority
            />
            <span>Flexpay</span>
          </Link>

          <nav
            className={`${landing.nav} ${isMenuOpen ? landing.navOpen : ''}`}
          >
            <Link
              href="/#how-it-works"
              className={landing.navLink}
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <a
              href="#"
              className={landing.navLink}
              onClick={(e) => {
                setIsMenuOpen(false);
                handleComingSoon(e);
              }}
            >
              FAQs
            </a>
            <Link
              href="/connect"
              className={landing.ctaButton}
              onClick={() => setIsMenuOpen(false)}
            >
              Connect Wallet
            </Link>
          </nav>

          <button
            type="button"
            className={landing.hamburger}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <main className={styles.connectMain}>
        <div className={styles.card}>
          <h1 className={styles.cardTitle}>Connect wallet</h1>
          <p className={styles.cardSubtitle}>
            Easily buy mobile airtime using USDC — connect your wallet on Base to
            continue. Use the wallet window to sign in.
          </p>
          <p className={styles.terms}>
            By connecting a wallet, you agree to our{' '}
            <a href="#" onClick={(e) => e.preventDefault()}>
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" onClick={(e) => e.preventDefault()}>
              Privacy Policy
            </a>
            .
          </p>
          <Link href="/" className={styles.backLink}>
            ← Back to home
          </Link>
        </div>
      </main>

      {showPopup && (
        <div className={landing.popup}>
          <div className={landing.popupContent}>
            <div className={landing.popupIcon}>🚀</div>
            <p>Coming Soon! This feature is under development.</p>
          </div>
        </div>
      )}
    </div>
  );
}
