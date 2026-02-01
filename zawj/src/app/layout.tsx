import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'aos/dist/aos.css';
import { Providers } from "@/components/Providers";
import Layout from "@/components/Layout";
import { AOSInit } from "@/components/AOSInit";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zawj - L'Amour Halal & Élégant",
  description: "Oubliez les standards. Vivez une expérience matrimoniale où la pudeur est magnifiée par la modernité.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ff007f',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AOSInit />
        <Providers>
          <Layout>
            {children}
          </Layout>
        </Providers>
      </body>
    </html>
  );
}
