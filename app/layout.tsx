import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from './components/Navbar';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Ruta Segura AI',
  description: 'Ecosistema predictivo de seguridad para conductores nocturnos en Lima.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.className}>
      <body className="min-h-screen bg-night text-slate-900 antialiased">
        <Navbar />
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
          <main className="flex-1">{children}</main>
          <footer className="mt-12 border-t border-slate-200/70 pt-6 text-sm text-slate-500">
            <p>Diseñado para conductores nocturnos que buscan rutas más seguras y tranquilidad.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
