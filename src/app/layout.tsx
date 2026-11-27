import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ナンプレ＆クロスワード広場 | 作って遊べるパズル共有サイト',
  description:
    '「ナンプレ（数独）」と「クロスワード」を作成・公開・プレイできるWebパズルサイト。唯一解ソルバー・自動採番機能搭載。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
