import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Universal OS",
  description: "Universal Operating System",
  icons: {
    icon: { url: '/uos-avatar.png', type: 'image/png' },
    shortcut: { url: '/uos-avatar.png', type: 'image/png' },
    apple: { url: '/uos-avatar.png', type: 'image/png' },
    other: [
      { rel: 'mask-icon', url: '/uos-avatar.png' },
      { rel: 'favicon', url: '/uos-avatar.png' }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <div className="relative flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
