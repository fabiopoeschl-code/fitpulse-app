import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FitPulse – Dein 3-Säulen Sport & Gesundheits-Begleiter',
  description:
    'Übungsbibliothek mit hochwertigen Animationen, adaptive Trainingspläne (Blutdruck, Muskelaufbau, Fit im Alter, Ausdauer), Smart-Tracker mit Countdown & interaktives Line-Chart Dashboard.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#090d16',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
