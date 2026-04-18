import type { Metadata, Viewport } from "next";
import "./globals.css";

function resolveMetadataBase(): URL | undefined {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    try {
      return new URL(fromEnv);
    } catch {
      // ignore invalid url
    }
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    try {
      return new URL(`https://${vercel}`);
    } catch {
      // ignore invalid url
    }
  }

  return undefined;
}

const description = "Painel administrativo TáhNaMão";

export const viewport: Viewport = {
  themeColor: "#FF5A36",
};

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  applicationName: "TáhNaMão Admin",
  title: {
    default: "TáhNaMão Admin",
    template: "%s | TáhNaMão Admin",
  },
  description,
  keywords: ["TáhNaMão", "admin", "painel", "gestão"],
  authors: [{ name: "TáhNaMão" }],
  creator: "TáhNaMão",
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    title: "TáhNaMão Admin",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "TáhNaMão Admin",
    title: "TáhNaMão Admin",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "TáhNaMão Admin",
    description,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
