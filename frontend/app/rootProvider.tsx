"use client";
import { ReactNode } from "react";
import { createConfig, createStorage, cookieStorage, http, WagmiProvider } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { coinbaseWallet, injected, metaMask } from "wagmi/connectors";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import "@coinbase/onchainkit/styles.css";
import { minikitConfig } from "@/minikit.config";

const flexpayLogoUrl = `${minikitConfig.miniapp.homeUrl.replace(/\/$/, "")}/flexpay_logo.png`;

const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    // Prefer browser wallets (avoids keys.coinbase.com Base Account flow).
    coinbaseWallet({
      appName: minikitConfig.miniapp.name,
      appLogoUrl: flexpayLogoUrl,
      preference: "all",
    }),
    metaMask({
      dappMetadata: {
        name: minikitConfig.miniapp.name,
        url: minikitConfig.miniapp.homeUrl,
        iconUrl: flexpayLogoUrl,
      },
    }),
    // Common injected wallets (only shown in UI if detected).
    injected({ target: "metaMask" }),
    injected({ target: "coinbaseWallet" }),
    injected({ target: "rabby" }),
    injected({ target: "trust" }),
    injected({ target: "phantom" }),
    injected({ target: "frame" }),
    injected({ target: "enkrypt" }),
    // Fallback "Injected" (any other wallet).
    injected(),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY
      ? http(
          `https://api.developer.coinbase.com/rpc/v1/base/${process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}`
        )
      : http(),
    [baseSepolia.id]: process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY
      ? http(
          `https://api.developer.coinbase.com/rpc/v1/base-sepolia/${process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}`
        )
      : http(),
  },
});

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <OnchainKitProvider
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        chain={base}
        config={{
          appearance: {
            mode: "light",
            name: minikitConfig.miniapp.name,
            logo: flexpayLogoUrl,
            theme: "base",
          },
          wallet: {
            // Use FlexpaySignInModal instead of the multi-wallet OnchainKit modal
            display: "classic",
            preference: "all",
          },
        }}
        miniKit={{
          enabled: true,
          autoConnect: true,
          notificationProxyUrl: undefined,
        }}
      >
        {children}
      </OnchainKitProvider>
    </WagmiProvider>
  );
}
