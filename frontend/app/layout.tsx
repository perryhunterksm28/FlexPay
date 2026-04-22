import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { SafeArea } from "@coinbase/onchainkit/minikit";
import { minikitConfig } from "@/minikit.config";
import { RootProvider } from "./rootProvider";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      // Keep ASCII-only to avoid non-Latin1 header issues in some fetch clients (OnchainKit analytics).
      default: "Flexpay - Buy Airtime with USDC on Base",
      template: "%s | Flexpay",
    },
    description: minikitConfig.miniapp.description,
    applicationName: "Flexpay",
    metadataBase: new URL(minikitConfig.miniapp.homeUrl),
    alternates: {
      canonical: minikitConfig.miniapp.homeUrl,
    },
    openGraph: {
      title: minikitConfig.miniapp.ogTitle,
      description: minikitConfig.miniapp.ogDescription,
      url: minikitConfig.miniapp.homeUrl,
      siteName: "Flexpay",
      images: [{ url: minikitConfig.miniapp.ogImageUrl }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: minikitConfig.miniapp.ogTitle,
      description: minikitConfig.miniapp.ogDescription,
      images: [minikitConfig.miniapp.ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
    other: {
      "fc:miniapp": JSON.stringify({
        version: minikitConfig.miniapp.version,
        imageUrl: minikitConfig.miniapp.heroImageUrl,
        button: {
          title: `Launch ${minikitConfig.miniapp.name}`,
          action: {
            name: `Launch ${minikitConfig.miniapp.name}`,
            type: "launch_miniapp",
          },
        },
      }),
      "base:app_id": "68f930fd3eacc16300ec1e66",
      "talentapp:project_verification":
        "6b7487cc1e878226c7116688d5b081f16ae0095ebe98fe8da476323b3f8f5b8955ea6265fe67590904f278ece53414606da3942b13f82d6903917fda53302621",
    },
  };
}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RootProvider>
      <html lang="en">
        <body className={`${inter.variable} ${sourceCodePro.variable}`}>
          <SafeArea>{children}</SafeArea>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Flexpay",
                url: minikitConfig.miniapp.homeUrl,
                logo: minikitConfig.miniapp.iconUrl,
              }),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                name: "Flexpay Airtime",
                description: minikitConfig.miniapp.description,
                brand: "Flexpay",
                image: minikitConfig.miniapp.heroImageUrl,
                url: minikitConfig.miniapp.homeUrl,
                category: "Mobile Airtime",
                offers: {
                  "@type": "Offer",
                  priceCurrency: "USDC",
                  price: "0",
                  availability: "https://schema.org/InStock",
                },
              }),
            }}
          />
        </body>
      </html>
    </RootProvider>
  );
}
