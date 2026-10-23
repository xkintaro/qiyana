import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QIYANA',
  description: "A universe dedicated to the Empress of the Elements. Explore Qiyana's skins, artwork, and unmistakable energy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
