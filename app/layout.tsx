import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rezervacije sala',
  description: 'Interna aplikacija za vođenje događaja i rezervacija sala'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr">
      <body>{children}</body>
    </html>
  );
}
