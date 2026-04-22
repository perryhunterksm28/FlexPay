'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useConnect } from 'wagmi';
import { useOnchainKit } from '@coinbase/onchainkit';
import { useWalletContext } from '@coinbase/onchainkit/wallet';
import styles from './flexpay-sign-in-modal.module.css';

type WalletKey =
  | 'coinbase'
  | 'metamask'
  | 'rabby'
  | 'phantom'
  | 'trust'
  | 'frame'
  | 'enkrypt'
  | 'injected';

function walletIconSrc(key: WalletKey): string {
  switch (key) {
    case 'metamask':
      return '/wallet-icons/metamask.svg';
    case 'coinbase':
      return '/wallet-icons/coinbase.svg';
    case 'rabby':
      return '/wallet-icons/rabby.svg';
    case 'phantom':
      return '/wallet-icons/phantom.svg';
    case 'trust':
      return '/wallet-icons/trust.svg';
    case 'frame':
      return '/wallet-icons/frame.svg';
    case 'enkrypt':
      return '/wallet-icons/enkrypt.svg';
    default:
      return '/wallet-icons/metamask.svg';
  }
}

function walletKeyFromConnectorId(id: string): WalletKey {
  const lower = id.toLowerCase();
  if (lower === 'coinbasewallet') return 'coinbase';
  if (lower === 'metamask') return 'metamask';
  if (lower === 'rabby') return 'rabby';
  if (lower === 'phantom') return 'phantom';
  if (lower === 'trust' || lower === 'trustwallet') return 'trust';
  if (lower === 'frame') return 'frame';
  if (lower === 'enkrypt') return 'enkrypt';
  return 'injected';
}

function walletLabel(key: WalletKey): string {
  switch (key) {
    case 'coinbase':
      return 'Coinbase Wallet';
    case 'metamask':
      return 'MetaMask';
    case 'rabby':
      return 'Rabby';
    case 'phantom':
      return 'Phantom';
    case 'trust':
      return 'Trust Wallet';
    case 'frame':
      return 'Frame';
    case 'enkrypt':
      return 'Enkrypt';
    default:
      return 'Injected';
  }
}

function WalletImageIcon({ k }: { k: WalletKey }) {
  const src = walletIconSrc(k);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={styles.walletIconImg} />
  );
}

function formatConnectError(error: unknown): string | null {
  const msg = error instanceof Error ? error.message : String(error ?? '');
  const lower = msg.toLowerCase();
  if (
    lower.includes('user rejected') ||
    lower.includes('request rejected') ||
    lower.includes('rejected the request') ||
    lower.includes('user denied') ||
    lower.includes('rejected')
  ) {
    return 'Connection cancelled.';
  }
  if (!msg) return null;
  // Remove noisy "Version: viem@..." tail if present.
  return msg.replace(/\s*Version:\s*viem@[^\s]+/gi, '').trim();
}

export function FlexpaySignInModal() {
  const { isConnectModalOpen, setIsConnectModalOpen } = useWalletContext();
  const { config } = useOnchainKit();
  const { connect, connectors, isPending, error, reset } = useConnect();
  const [step, setStep] = useState<'intro' | 'list'>('intro');
  const [availableIds, setAvailableIds] = useState<Set<string> | null>(null);

  const isCoinbaseInstalled = useMemo(() => {
    if (!isConnectModalOpen) return false;
    if (typeof window === 'undefined') return false;
    const w = window as unknown as {
      ethereum?: { isCoinbaseWallet?: boolean } | undefined;
      coinbaseWalletExtension?: unknown;
    };
    return Boolean(w.ethereum?.isCoinbaseWallet || w.coinbaseWalletExtension);
  }, [isConnectModalOpen]);

  const friendlyError = useMemo(() => formatConnectError(error), [error]);

  // Reserved for future copy variations.
  const _appName = config?.appearance?.name ?? 'Flexpay';
  const termsUrl = config?.wallet?.termsUrl;
  const privacyUrl = config?.wallet?.privacyUrl;
  const appIcon = config?.appearance?.logo ?? '';

  const close = useCallback(() => {
    reset();
    setIsConnectModalOpen(false);
  }, [reset, setIsConnectModalOpen]);

  const beginList = useCallback(() => {
    setStep('list');
  }, []);

  const detectedConnectors = useMemo(() => {
    // Dedupe by wallet key (MetaMask appears both as `metaMask()` and `injected({ target: 'metaMask' })`, etc).
    const byKey = new Map<WalletKey, (typeof connectors)[number]>();
    const score = (c: (typeof connectors)[number]) => {
      // Prefer dedicated connectors (coinbaseWallet/metaMask) over generic injected.
      if (c.id === 'coinbaseWallet') return 100;
      if (c.id.toLowerCase() === 'metamask') return 90;
      if (c.id.toLowerCase() === 'rabby') return 80;
      if (c.id.toLowerCase() === 'phantom') return 70;
      if (c.id.toLowerCase() === 'trust' || c.id.toLowerCase() === 'trustwallet') return 60;
      if (c.id.toLowerCase() === 'frame') return 50;
      if (c.id.toLowerCase() === 'enkrypt') return 40;
      return 10;
    };

    for (const c of connectors) {
      // Only include wallets detected in browser (except Coinbase Wallet SDK, which can onboard).
      const key = walletKeyFromConnectorId(c.id);
      if (key === 'injected') continue; // hide generic injected from UI
      if (c.id === 'coinbaseWallet') {
        // Only show Coinbase Wallet if the extension is actually installed.
        if (!isCoinbaseInstalled) continue;
      } else {
        if (!availableIds) continue;
        if (!availableIds.has(`${c.type}:${c.id}`)) continue;
      }
      const existing = byKey.get(key);
      if (!existing || score(c) > score(existing)) byKey.set(key, c);
    }

    const order: WalletKey[] = [
      'metamask',
      'coinbase',
      'rabby',
      'phantom',
      'trust',
      'frame',
      'enkrypt',
    ];
    return order.map((k) => byKey.get(k)).filter(Boolean) as (typeof connectors)[number][];
  }, [connectors, availableIds, isCoinbaseInstalled]);

  const connectWith = useCallback(
    (connector: (typeof connectors)[number]) => {
      reset();
      connect(
        { connector },
        {
          onSuccess: () => setIsConnectModalOpen(false),
        }
      );
    },
    [connect, reset, setIsConnectModalOpen]
  );

  useEffect(() => {
    if (!isConnectModalOpen) return;
    reset();
    setStep('intro');
    setAvailableIds(null);
  }, [isConnectModalOpen, reset]);

  useEffect(() => {
    if (!isConnectModalOpen) return;
    // Detect wallets as soon as modal opens so the list is ready instantly.
    if (availableIds) return;
    let cancelled = false;
    (async () => {
      const set = new Set<string>();
      for (const c of connectors) {
        const key = `${c.type}:${c.id}`;
        if (c.id === 'coinbaseWallet') continue;
        try {
          // Most wagmi connectors implement getProvider(); injected targets return undefined when not installed.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const provider = await (c as any).getProvider?.();
          if (provider) set.add(key);
        } catch {
          // ignore
        }
      }
      if (!cancelled) setAvailableIds(set);
    })();
    return () => {
      cancelled = true;
    };
  }, [isConnectModalOpen, connectors, availableIds]);

  useEffect(() => {
    if (!isConnectModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isConnectModalOpen, close]);

  if (!isConnectModalOpen) return null;

  return (
    <div
      className={styles.root}
      role="presentation"
    >
      <div
        className={step === 'intro' ? `${styles.dialog} ${styles.dialogIntro}` : styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="flexpay-signin-heading"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className={styles.close} onClick={close} aria-label="Close">
          ×
        </button>
        {step === 'intro' ? (
          <>
            <div className={styles.logoWrap} style={{ margin: '0 auto 0.75rem' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={appIcon} alt="" className={styles.logoImg} />
            </div>
            <h2 id="flexpay-signin-heading" className={styles.introTitle}>
              Sign in with your wallet
            </h2>
            <p className={styles.introBody}>
              Choose a wallet you already use in this browser to open the Flexpay dashboard. If
              several Ethereum wallets are installed, you may see more than one option—pick the one
              you want to use here.
            </p>
            {friendlyError ? <p className={styles.error}>{friendlyError}</p> : null}
            <button type="button" className={styles.primary} onClick={beginList} disabled={isPending}>
              Connect Wallet
            </button>
            <p className={styles.legal}>
              By connecting a wallet, you agree to our{' '}
              {termsUrl ? (
                <a href={termsUrl} target="_blank" rel="noopener noreferrer">
                  Terms of Service
                </a>
              ) : (
                <>Terms of Service</>
              )}
              {privacyUrl ? (
                <>
                  {' '}
                  and{' '}
                  <a href={privacyUrl} target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </a>
                </>
              ) : null}
              .
            </p>
          </>
        ) : (
          <>
            <div className={styles.left}>
              <h3 className={styles.leftTitle}>Select your wallet to login</h3>
              <p className={styles.leftHint}>Showing wallets detected in this browser.</p>
              {friendlyError ? <p className={styles.error}>{friendlyError}</p> : null}
              {!availableIds ? (
                <p className={styles.leftHint}>Detecting wallets…</p>
              ) : null}
              <ul className={styles.walletList}>
                {detectedConnectors.map((c) => {
                  const k = walletKeyFromConnectorId(c.id);
                  const label = walletLabel(k);
                  return (
                    <li key={`${c.type}:${c.id}`}>
                      <button
                        type="button"
                        className={styles.walletBtn}
                        onClick={() => connectWith(c)}
                        disabled={isPending}
                      >
                        <span className={styles.walletMeta}>
                          <span className={styles.walletIcon} aria-hidden>
                            <WalletImageIcon k={k} />
                          </span>
                          <span className={styles.walletName}>{label}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className={styles.legal}>
                By connecting a wallet, you agree to our{' '}
                {termsUrl ? (
                  <a href={termsUrl} target="_blank" rel="noopener noreferrer">
                    Terms of Service
                  </a>
                ) : (
                  <>Terms of Service</>
                )}
                {privacyUrl ? (
                  <>
                    {' '}
                    and{' '}
                    <a href={privacyUrl} target="_blank" rel="noopener noreferrer">
                      Privacy Policy
                    </a>
                  </>
                ) : null}
                .
              </p>
            </div>
            <div className={styles.right}>
              <div className={styles.brandMark} aria-hidden>
                {appIcon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={appIcon} alt="" style={{ width: 56, height: 56, borderRadius: 14 }} />
                ) : null}
              </div>
              <h2 id="flexpay-signin-heading" className={styles.rightTitle}>
                Sign in with your wallet
              </h2>
              <p className={styles.rightBody}>
                Connecting your wallet is like “logging in” to Web3. Select your wallet from the
                options to get started.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
